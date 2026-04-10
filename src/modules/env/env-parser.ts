import fs from 'node:fs/promises';
import path from 'node:path';
import {z} from 'zod';
import {expandHome, pathExists, readTextFile} from '../../utils/file.js';

const EnvEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
  file: z.string(),
  line: z.number().int().positive(),
});

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
 * Parsed environment summary.
 */
export interface EnvSummary {
  readonly shell: string;
  readonly files: readonly ShellFileInfo[];
  readonly entries: readonly z.infer<typeof EnvEntrySchema>[];
  readonly effectiveMap: ReadonlyMap<string, z.infer<typeof EnvEntrySchema>>;
  readonly duplicates: readonly string[];
  readonly missingPathEntries: readonly string[];
}

const EXPORT_PATTERN = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/;

/**
 * Returns candidate shell rc files in precedence order.
 */
export function getShellFiles(shellPath: string, cwd = process.cwd()): readonly ShellFileInfo[] {
  const shellName = shellPath.split('/').pop() ?? 'zsh';
  const files: string[] =
      shellName === 'bash'
        ? ['~/.bash_profile', '~/.bashrc', '~/.profile']
      : shellName === 'fish'
        ? ['~/.config/fish/config.fish']
        : ['~/.zshenv', '~/.zprofile', '~/.zshrc', '~/.zlogin'];

  return [
    ...files.map((filePath) => ({
      path: filePath,
      exists: false,
      current: filePath.includes(shellName),
      note: filePath.includes(shellName) ? '(当前 shell)' : undefined,
    })),
    {path: path.join(cwd, '.env'), exists: false, current: false, note: '(当前目录)'},
  ];
}

/**
 * Parses export statements from one shell file with line numbers.
 */
export async function parseEnvFile(filePath: string): Promise<z.infer<typeof EnvEntrySchema>[]> {
  const raw = await readTextFile(filePath);
  if (!raw) {
    return [];
  }

  return raw.split('\n').flatMap((line, index) => {
    const match = line.match(EXPORT_PATTERN);
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
 * Loads shell config files, parses exports, and computes provenance data.
 */
export async function loadEnvSummary(): Promise<EnvSummary> {
  const shell = process.env.SHELL ?? '/bin/zsh';
  const files = await Promise.all(
    getShellFiles(shell).map(async (file) => ({
      ...file,
      exists: await pathExists(file.path),
    })),
  );
  const parsedLists = await Promise.all(files.filter((file) => file.exists).map(async (file) => parseEnvFile(file.path)));
  const entries = parsedLists.flat();
  const grouped = new Map<string, z.infer<typeof EnvEntrySchema>[]>();

  for (const entry of entries) {
    const current = grouped.get(entry.key) ?? [];
    current.push(entry);
    grouped.set(entry.key, current);
  }

  const effectiveMap = new Map<string, z.infer<typeof EnvEntrySchema>>();
  for (const [key, values] of grouped) {
    effectiveMap.set(key, values[values.length - 1]);
  }

  const duplicates = Array.from(grouped.entries())
    .filter(([, values]) => values.length > 1)
    .map(([key]) => key);
  const pathValue = effectiveMap.get('PATH')?.value ?? process.env.PATH ?? '';
  const pathSegments = pathValue
    .split(':')
    .map((segment: string) => segment.trim())
    .filter(Boolean);
  const pathChecks = await Promise.all(
    pathSegments.map(async (segment) => {
      try {
        await fs.access(expandHome(segment));
        return {segment, missing: false};
      } catch {
        return {segment, missing: true};
      }
    }),
  );
  const missingPathEntries = pathChecks.filter((item) => item.missing).map((item) => item.segment);

  return {
    shell,
    files,
    entries,
    effectiveMap,
    duplicates,
    missingPathEntries,
  };
}
