import fs from 'node:fs/promises';
import {accessSync, constants as fsConstants} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Expands a leading home directory shortcut.
 */
export function expandHome(inputPath: string): string {
  if (inputPath === '~') {
    return os.homedir();
  }

  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }

  return inputPath;
}

/**
 * Returns whether a file exists.
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(expandHome(targetPath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads a UTF-8 text file if it exists.
 */
export async function readTextFile(targetPath: string): Promise<string | null> {
  try {
    return await fs.readFile(expandHome(targetPath), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

/**
 * Ensures a file or directory can be read and written before modification.
 */
export async function assertWritable(targetPath: string): Promise<void> {
  const resolved = expandHome(targetPath);
  accessSync(resolved, fsConstants.R_OK | fsConstants.W_OK);
}

/**
 * Writes UTF-8 text after checking write permissions on the existing file or parent directory.
 */
export async function writeTextFile(targetPath: string, content: string): Promise<void> {
  const resolved = expandHome(targetPath);
  const parentDir = path.dirname(resolved);

  try {
    await assertWritable(resolved);
  } catch {
    accessSync(parentDir, fsConstants.R_OK | fsConstants.W_OK);
  }

  await fs.writeFile(resolved, content, 'utf8');
}

/**
 * Produces an inline before/after diff preview suitable for confirmation dialogs.
 */
export function createDiffPreview(before: string, after: string): string {
  return [`--- before`, before || '(empty)', `+++ after`, after || '(empty)'].join('\n');
}

/**
 * Converts a possibly relative path to an absolute path with home expansion.
 */
export function resolvePath(targetPath: string): string {
  return path.resolve(expandHome(targetPath));
}

/**
 * Returns a POSIX-like mode string if a stat mode is available.
 */
export function toOctalMode(mode?: number): string {
  if (typeof mode !== 'number') {
    return 'unknown';
  }

  return `0${(mode & 0o777).toString(8)}`;
}
