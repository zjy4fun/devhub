import fs from 'node:fs/promises';
import path from 'node:path';
import {z} from 'zod';
import {expandHome, pathExists, readTextFile} from '../../utils/file.js';
import {runCommand} from '../../utils/shell.js';

const EnvEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
  file: z.string(),
  line: z.number().int().positive(),
});

const VARIABLE_REFERENCE_PATTERN = /\$([A-Za-z_][A-Za-z0-9_]*)|\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
const EXPORT_PATTERN = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/;
const FISH_EXPORT_PATTERN = /^\s*set\s+-(?:g?x|xg)\s+([A-Za-z_][A-Za-z0-9_]*)\s+(.*)\s*$/;

export type EnvEntry = z.infer<typeof EnvEntrySchema>;

/**
 * Shell config file metadata used by the env UI.
 */
export interface ShellFileInfo {
  readonly path: string;
  readonly exists: boolean;
  readonly current: boolean;
  readonly note?: string;
}

/**
 * Duplicate definition details used for doctor-fix suggestions.
 */
export interface EnvDuplicateIssue {
  readonly key: string;
  readonly entries: readonly EnvEntry[];
  readonly fixable: boolean;
}

/**
 * PATH diagnostics with file provenance.
 */
export interface EnvPathIssue {
  readonly kind: 'missing-path' | 'unresolved-path';
  readonly entry: EnvEntry;
  readonly segment: string;
  readonly resolvedSegment?: string;
  readonly referencedVariables: readonly string[];
  readonly fixable: boolean;
}

/**
 * Individual health row rendered in the env module.
 */
export interface EnvHealthItem {
  readonly status: 'ok' | 'warn' | 'info';
  readonly message: string;
}

/**
 * Safe doctor-fix candidate exposed to the UI.
 */
export interface EnvDoctorFix {
  readonly id: string;
  readonly kind: 'dedupe' | 'remove-path-segment' | 'set-editor';
  readonly title: string;
  readonly description: string;
  readonly key?: string;
  readonly file?: string;
  readonly line?: number;
  readonly segment?: string;
  readonly value?: string;
}

/**
 * Parsed environment summary.
 */
export interface EnvSummary {
  readonly shell: string;
  readonly files: readonly ShellFileInfo[];
  readonly preferredShellFile: string;
  readonly recommendedEditor: string;
  readonly entries: readonly EnvEntry[];
  readonly effectiveMap: ReadonlyMap<string, EnvEntry>;
  readonly duplicates: readonly string[];
  readonly duplicateIssues: readonly EnvDuplicateIssue[];
  readonly missingPathEntries: readonly string[];
  readonly pathIssues: readonly EnvPathIssue[];
  readonly health: readonly EnvHealthItem[];
  readonly doctorFixes: readonly EnvDoctorFix[];
}

interface ShellProfile {
  readonly files: readonly string[];
  readonly preferredFile: string;
}

/**
 * Returns the preferred config files for a supported shell.
 */
function getShellProfile(shellName: string): ShellProfile {
  if (shellName === 'bash') {
    return {
      files: ['~/.bash_profile', '~/.bashrc', '~/.profile'],
      preferredFile: '~/.bashrc',
    };
  }

  if (shellName === 'fish') {
    return {
      files: ['~/.config/fish/config.fish'],
      preferredFile: '~/.config/fish/config.fish',
    };
  }

  return {
    files: ['~/.zshenv', '~/.zprofile', '~/.zshrc', '~/.zlogin'],
    preferredFile: '~/.zshrc',
  };
}

/**
 * Returns candidate shell rc files in precedence order.
 */
export function getShellFiles(shellPath: string, cwd = process.cwd()): readonly ShellFileInfo[] {
  const shellName = shellPath.split('/').pop() ?? 'zsh';
  const profile = getShellProfile(shellName);

  return [
    ...profile.files.map((filePath) => ({
      path: filePath,
      exists: false,
      current: filePath === profile.preferredFile,
      note: filePath === profile.preferredFile ? '(current shell)' : undefined,
    })),
    {path: path.join(cwd, '.env'), exists: false, current: false, note: '(current directory)'},
  ];
}

/**
 * Parses export statements from one shell file with line numbers.
 */
export async function parseEnvFile(filePath: string): Promise<EnvEntry[]> {
  const raw = await readTextFile(filePath);
  if (!raw) {
    return [];
  }

  return raw.split('\n').flatMap((line, index) => {
    const match = line.match(EXPORT_PATTERN) ?? line.match(FISH_EXPORT_PATTERN);
    if (!match) {
      return [];
    }

    const [, key, rawValue] = match;
    const trimmedValue = rawValue.trim().replace(/^['"]|['"]$/g, '');
    return [
      EnvEntrySchema.parse({
        key,
        value: trimmedValue,
        file: filePath,
        line: index + 1,
      }),
    ];
  });
}

/**
 * Extracts $VAR and ${VAR} references from a shell-style string.
 */
function extractVariableReferences(value: string): readonly string[] {
  const variables = new Set<string>();

  for (const match of value.matchAll(VARIABLE_REFERENCE_PATTERN)) {
    variables.add(match[1] ?? match[2]);
  }

  return Array.from(variables);
}

/**
 * Resolves shell-style variable references using effective env values and process env.
 */
function resolveReferences(
  value: string,
  effectiveMap: ReadonlyMap<string, EnvEntry>,
  seen = new Set<string>(),
): string {
  return value.replace(VARIABLE_REFERENCE_PATTERN, (match, simpleName, bracedName) => {
    const name = simpleName ?? bracedName;
    if (!name || seen.has(name)) {
      return match;
    }

    const nextSeen = new Set(seen);
    nextSeen.add(name);
    const nextValue = effectiveMap.get(name)?.value ?? process.env[name];
    return typeof nextValue === 'string' ? resolveReferences(nextValue, effectiveMap, nextSeen) : match;
  });
}

/**
 * Returns whether the value references the provided variable.
 */
function referencesVariable(value: string, key: string): boolean {
  return extractVariableReferences(value).includes(key);
}

/**
 * Splits a PATH-like value while keeping the original segment strings.
 */
function splitPathSegments(value: string): readonly string[] {
  return value
    .split(':')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

/**
 * Detects duplicate definitions that are safe to collapse to the final value.
 */
function isSafeDuplicate(entries: readonly EnvEntry[], groupedEntries: readonly EnvEntry[], key: string): boolean {
  if (groupedEntries.length < 2) {
    return false;
  }

  const positions = groupedEntries.map((entry) => entries.findIndex((candidate) => candidate.file === entry.file && candidate.line === entry.line));
  if (positions.some((position) => position < 0)) {
    return false;
  }

  for (let index = 0; index < positions.length - 1; index += 1) {
    const currentPosition = positions[index];
    const nextPosition = positions[index + 1];
    const nextEntry = entries[nextPosition];

    if (referencesVariable(nextEntry.value, key)) {
      return false;
    }

    for (let cursor = currentPosition + 1; cursor < nextPosition; cursor += 1) {
      if (referencesVariable(entries[cursor].value, key)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Analyses PATH definitions file-by-file so issues can be traced back to a source line.
 */
async function collectPathIssues(entries: readonly EnvEntry[], effectiveMap: ReadonlyMap<string, EnvEntry>): Promise<EnvPathIssue[]> {
  const pathEntries = entries.filter((entry) => entry.key === 'PATH');
  const issues: EnvPathIssue[] = [];

  for (const entry of pathEntries) {
    const segments = splitPathSegments(entry.value);

    for (const segment of segments) {
      if (segment === '$PATH' || segment === '${PATH}') {
        continue;
      }

      const referencedVariables = extractVariableReferences(segment).filter((name) => name !== 'PATH');
      const resolvedSegment = expandHome(resolveReferences(segment, effectiveMap, new Set(['PATH']))).trim();

      if (!resolvedSegment || resolvedSegment.includes('$')) {
        issues.push({
          kind: 'unresolved-path',
          entry,
          segment,
          referencedVariables,
          fixable: false,
        });
        continue;
      }

      try {
        await fs.access(resolvedSegment);
      } catch {
        const remainingSegments = segments.filter((candidate) => candidate !== segment);
        issues.push({
          kind: 'missing-path',
          entry,
          segment,
          resolvedSegment,
          referencedVariables,
          fixable: remainingSegments.length > 0,
        });
      }
    }
  }

  return issues;
}

/**
 * Picks a sensible default editor for doctor-fix.
 */
async function detectRecommendedEditor(): Promise<string> {
  const candidates = [
    {command: 'code', value: 'code --wait'},
    {command: 'cursor', value: 'cursor --wait'},
    {command: 'nvim', value: 'nvim'},
    {command: 'vim', value: 'vim'},
    {command: 'nano', value: 'nano'},
  ] as const;

  for (const candidate of candidates) {
    const result = await runCommand('which', [candidate.command]);
    if (result.ok && result.stdout) {
      return candidate.value;
    }
  }

  return 'vim';
}

/**
 * Builds doctor-fix candidates from the current diagnostics.
 */
function buildDoctorFixes({
  duplicateIssues,
  pathIssues,
  effectiveMap,
  preferredShellFile,
  recommendedEditor,
}: {
  readonly duplicateIssues: readonly EnvDuplicateIssue[];
  readonly pathIssues: readonly EnvPathIssue[];
  readonly effectiveMap: ReadonlyMap<string, EnvEntry>;
  readonly preferredShellFile: string;
  readonly recommendedEditor: string;
}): readonly EnvDoctorFix[] {
  const fixes: EnvDoctorFix[] = [];

  for (const issue of duplicateIssues) {
    if (!issue.fixable) {
      continue;
    }

    const winner = issue.entries[issue.entries.length - 1];
    fixes.push({
      id: `dedupe:${issue.key}`,
      kind: 'dedupe',
      title: `Remove shadowed duplicate: ${issue.key}`,
      description: `Keeps the last definition at ${winner.file}:${winner.line}`,
      key: issue.key,
    });
  }

  for (const issue of pathIssues) {
    if (issue.kind !== 'missing-path' || !issue.fixable) {
      continue;
    }

    fixes.push({
      id: `path:${issue.entry.file}:${issue.entry.line}:${issue.segment}`,
      kind: 'remove-path-segment',
      title: `Remove missing PATH segment`,
      description: `${issue.segment}  ← ${issue.entry.file}:${issue.entry.line}`,
      file: issue.entry.file,
      line: issue.entry.line,
      segment: issue.segment,
    });
  }

  if (!effectiveMap.get('EDITOR')) {
    fixes.push({
      id: 'editor:set',
      kind: 'set-editor',
      title: `Set EDITOR to ${recommendedEditor}`,
      description: `Writes to ${preferredShellFile}`,
      file: preferredShellFile,
      value: recommendedEditor,
    });
  }

  return fixes;
}

/**
 * Loads shell config files, parses exports, and computes provenance data.
 */
export async function loadEnvSummary(): Promise<EnvSummary> {
  const shell = process.env.SHELL ?? '/bin/zsh';
  const shellName = shell.split('/').pop() ?? 'zsh';
  const preferredShellFile = getShellProfile(shellName).preferredFile;
  const files = await Promise.all(
    getShellFiles(shell).map(async (file) => ({
      ...file,
      exists: await pathExists(file.path),
    })),
  );
  const parsedLists = await Promise.all(files.filter((file) => file.exists).map(async (file) => parseEnvFile(file.path)));
  const entries = parsedLists.flat();
  const grouped = new Map<string, EnvEntry[]>();

  for (const entry of entries) {
    const current = grouped.get(entry.key) ?? [];
    current.push(entry);
    grouped.set(entry.key, current);
  }

  const effectiveMap = new Map<string, EnvEntry>();
  for (const [key, values] of grouped) {
    effectiveMap.set(key, values[values.length - 1]);
  }

  const duplicateIssues = Array.from(grouped.entries())
    .filter(([, values]) => values.length > 1)
    .map(([key, values]) => ({
      key,
      entries: values,
      fixable: isSafeDuplicate(entries, values, key),
    }));
  const duplicates = duplicateIssues.map((issue) => issue.key);
  const pathIssues = await collectPathIssues(entries, effectiveMap);
  const missingPathEntries = Array.from(
    new Set(pathIssues.filter((issue) => issue.kind === 'missing-path').map((issue) => issue.segment)),
  );
  const recommendedEditor = await detectRecommendedEditor();
  const doctorFixes = buildDoctorFixes({
    duplicateIssues,
    pathIssues,
    effectiveMap,
    preferredShellFile,
    recommendedEditor,
  });

  const health: EnvHealthItem[] = [
    ...duplicateIssues.map((issue) => ({
      status: 'warn' as const,
      message: `${issue.key} defined multiple times${issue.fixable ? ' (doctor fix available)' : ''}`,
    })),
    ...pathIssues.map((issue) =>
      issue.kind === 'missing-path'
        ? {
            status: 'warn' as const,
            message: `PATH includes a missing directory: ${issue.segment}  ← ${issue.entry.file}:${issue.entry.line}${issue.fixable ? ' (doctor fix available)' : ''}`,
          }
        : {
            status: 'info' as const,
            message: `PATH uses an unresolved reference: ${issue.segment}  ← ${issue.entry.file}:${issue.entry.line}`,
          },
    ),
    effectiveMap.get('EDITOR')
      ? {status: 'ok' as const, message: 'EDITOR is set'}
      : {status: 'warn' as const, message: `EDITOR is not set${doctorFixes.some((fix) => fix.kind === 'set-editor') ? ' (doctor fix available)' : ''}`},
    ...(effectiveMap.get('LANG')?.value === 'en_US.UTF-8'
      ? [{status: 'ok' as const, message: 'LANG is set to en_US.UTF-8'}]
      : []),
    ...(doctorFixes.length > 0
      ? [{status: 'info' as const, message: `Doctor fix has ${doctorFixes.length} safe remediation${doctorFixes.length === 1 ? '' : 's'} ready`}]
      : []),
  ];

  return {
    shell,
    files,
    preferredShellFile,
    recommendedEditor,
    entries,
    effectiveMap,
    duplicates,
    duplicateIssues,
    missingPathEntries,
    pathIssues,
    health,
    doctorFixes,
  };
}
