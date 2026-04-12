import {createDiffPreview, readTextFile, writeTextFile} from '../../utils/file.js';
import {sanitizeInput} from '../../utils/shell.js';
import type {EnvDoctorFix, EnvEntry, EnvSummary} from './env-parser.js';

const EXPORT_PATTERN = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)=/;
const FISH_EXPORT_PATTERN = /^\s*set\s+-(?:g?x|xg)\s+([A-Za-z_][A-Za-z0-9_]*)\s+/;

/**
 * Pending environment file write shown in a confirmation dialog.
 */
export interface EnvPendingChange {
  readonly title: string;
  readonly diff: string;
  readonly execute: () => Promise<void>;
}

interface FileChange {
  readonly filePath: string;
  readonly before: string;
  readonly after: string;
}

/**
 * Returns whether a config file uses fish syntax.
 */
function isFishConfig(filePath: string): boolean {
  return filePath.endsWith('.fish');
}

/**
 * Formats an env assignment for the target shell config file.
 */
function formatEnvAssignment(filePath: string, key: string, value: string): string {
  const safeKey = sanitizeInput(key);
  const safeValue = sanitizeInput(value);
  return isFishConfig(filePath) ? `set -gx ${safeKey} "${safeValue}"` : `export ${safeKey}="${safeValue}"`;
}

/**
 * Finds an existing env assignment line in the target file.
 */
function findAssignmentIndex(lines: readonly string[], filePath: string, key: string): number {
  const safeKey = sanitizeInput(key);

  return lines.findIndex((line) => {
    const match = isFishConfig(filePath) ? line.match(FISH_EXPORT_PATTERN) : line.match(EXPORT_PATTERN);
    return match?.[1] === safeKey;
  });
}

/**
 * Combines multiple file previews into one confirmable diff.
 */
function createCombinedDiffPreview(changes: readonly FileChange[]): string {
  return changes
    .map((change) => [`### ${change.filePath}`, createDiffPreview(change.before, change.after)].join('\n'))
    .join('\n\n');
}

/**
 * Creates a pending write for one or more files.
 */
function createPendingChange(title: string, changes: readonly FileChange[]): EnvPendingChange {
  return {
    title,
    diff: createCombinedDiffPreview(changes),
    execute: async () => {
      for (const change of changes) {
        await writeTextFile(change.filePath, change.after);
      }
    },
  };
}

/**
 * Splits a PATH-like value into non-empty segments.
 */
function splitPathSegments(value: string): readonly string[] {
  return value
    .split(':')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

/**
 * Builds an add-or-update env operation for a shell file.
 */
export async function prepareEnvChange(filePath: string, key: string, value: string): Promise<EnvPendingChange> {
  const current = (await readTextFile(filePath)) ?? '';
  const nextLine = formatEnvAssignment(filePath, key, value);
  const lines = current.split('\n');
  const existingIndex = findAssignmentIndex(lines, filePath, key);
  let next = current;

  if (existingIndex >= 0) {
    lines[existingIndex] = nextLine;
    next = lines.join('\n');
  } else {
    next = `${current}${current.endsWith('\n') || current.length === 0 ? '' : '\n'}${nextLine}\n`;
  }

  return createPendingChange(`Confirm update environment variable ${sanitizeInput(key)}`, [
    {
      filePath,
      before: current,
      after: next,
    },
  ]);
}

/**
 * Builds a doctor-fix that removes shadowed duplicate definitions for one key.
 */
async function prepareDuplicateFix(summary: EnvSummary, fix: EnvDoctorFix): Promise<EnvPendingChange> {
  const issue = summary.duplicateIssues.find((candidate) => candidate.key === fix.key && candidate.fixable);
  if (!issue || issue.entries.length < 2) {
    throw new Error('No safe duplicate fix is available for that variable.');
  }

  const removableEntries = issue.entries.slice(0, -1);
  const removals = new Map<string, Set<number>>();

  for (const entry of removableEntries) {
    const lines = removals.get(entry.file) ?? new Set<number>();
    lines.add(entry.line);
    removals.set(entry.file, lines);
  }

  const changes: FileChange[] = [];
  for (const [filePath, linesToRemove] of removals) {
    const current = (await readTextFile(filePath)) ?? '';
    const next = current
      .split('\n')
      .filter((_, index) => !linesToRemove.has(index + 1))
      .join('\n');

    if (current !== next) {
      changes.push({filePath, before: current, after: next});
    }
  }

  if (changes.length === 0) {
    throw new Error('Nothing changed while preparing the duplicate fix.');
  }

  return createPendingChange(`Confirm doctor fix for duplicate ${issue.key}`, changes);
}

/**
 * Builds a doctor-fix that removes one missing PATH segment from its defining line.
 */
async function preparePathFix(summary: EnvSummary, fix: EnvDoctorFix): Promise<EnvPendingChange> {
  const targetIssue = summary.pathIssues.find(
    (issue) =>
      issue.kind === 'missing-path' &&
      issue.fixable &&
      issue.entry.file === fix.file &&
      issue.entry.line === fix.line &&
      issue.segment === fix.segment,
  );
  if (!targetIssue) {
    throw new Error('No safe PATH cleanup is available for that segment.');
  }

  const current = (await readTextFile(targetIssue.entry.file)) ?? '';
  const lines = current.split('\n');
  const currentLine = lines[targetIssue.entry.line - 1] ?? '';
  const targetEntry = summary.entries.find(
    (entry) => entry.key === 'PATH' && entry.file === targetIssue.entry.file && entry.line === targetIssue.entry.line,
  );

  if (!targetEntry) {
    throw new Error('The PATH definition could not be located.');
  }

  const nextSegments = splitPathSegments(targetEntry.value).filter((segment) => segment !== targetIssue.segment);
  if (nextSegments.length === 0) {
    throw new Error('Removing that PATH segment would empty the assignment.');
  }

  lines[targetIssue.entry.line - 1] = formatEnvAssignment(targetIssue.entry.file, 'PATH', nextSegments.join(':'));
  const next = lines.join('\n');

  if (currentLine === lines[targetIssue.entry.line - 1]) {
    throw new Error('Nothing changed while preparing the PATH fix.');
  }

  return createPendingChange(`Confirm doctor fix for PATH at ${targetIssue.entry.file}:${targetIssue.entry.line}`, [
    {
      filePath: targetIssue.entry.file,
      before: current,
      after: next,
    },
  ]);
}

/**
 * Builds a doctor-fix that adds a recommended EDITOR setting.
 */
async function prepareEditorFix(summary: EnvSummary, fix: EnvDoctorFix): Promise<EnvPendingChange> {
  return prepareEnvChange(fix.file ?? summary.preferredShellFile, 'EDITOR', fix.value ?? summary.recommendedEditor);
}

/**
 * Builds a pending change from one doctor-fix suggestion.
 */
export async function prepareEnvDoctorFix(summary: EnvSummary, fixId: string): Promise<EnvPendingChange> {
  const fix = summary.doctorFixes.find((candidate) => candidate.id === fixId);
  if (!fix) {
    throw new Error('Doctor fix not found.');
  }

  switch (fix.kind) {
    case 'dedupe':
      return prepareDuplicateFix(summary, fix);
    case 'remove-path-segment':
      return preparePathFix(summary, fix);
    case 'set-editor':
      return prepareEditorFix(summary, fix);
    default: {
      const neverFix: never = fix;
      throw new Error(`Unsupported doctor fix: ${JSON.stringify(neverFix)}`);
    }
  }
}

/**
 * Locates one env entry by file and line.
 */
export function findEnvEntry(summary: EnvSummary, file: string, line: number): EnvEntry | undefined {
  return summary.entries.find((entry) => entry.file === file && entry.line === line);
}
