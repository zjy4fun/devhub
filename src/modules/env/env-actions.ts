import {createDiffPreview, readTextFile, writeTextFile} from '../../utils/file.js';
import {sanitizeInput} from '../../utils/shell.js';

/**
 * Pending environment file write shown in a confirmation dialog.
 */
export interface EnvPendingChange {
  readonly title: string;
  readonly diff: string;
  readonly execute: () => Promise<void>;
}

/**
 * Builds an add-or-update export operation for a shell file.
 */
export async function prepareEnvChange(filePath: string, key: string, value: string): Promise<EnvPendingChange> {
  const current = (await readTextFile(filePath)) ?? '';
  const safeKey = sanitizeInput(key);
  const safeValue = sanitizeInput(value);
  const nextLine = `export ${safeKey}="${safeValue}"`;
  const lines = current.split('\n');
  const existingIndex = lines.findIndex((line) => line.trim().startsWith(`export ${safeKey}=`));
  let next = current;

  if (existingIndex >= 0) {
    lines[existingIndex] = nextLine;
    next = lines.join('\n');
  } else {
    next = `${current}${current.endsWith('\n') || current.length === 0 ? '' : '\n'}${nextLine}\n`;
  }

  return {
    title: `确认更新环境变量 ${safeKey}`,
    diff: createDiffPreview(current, next),
    execute: async () => {
      await writeTextFile(filePath, next);
    },
  };
}
