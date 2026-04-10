import {createDiffPreview, readTextFile} from '../../utils/file.js';
import {runCommand, sanitizeInput} from '../../utils/shell.js';

/**
 * Represents a pending `git config --global` update before confirmation.
 */
export interface GitPendingChange {
  readonly title: string;
  readonly command: readonly string[];
  readonly diff: string;
}

/**
 * Builds a write action preview for a single Git config key.
 */
export async function prepareGitConfigChange(key: string, currentValue: string, nextValue: string): Promise<GitPendingChange> {
  const safeKey = sanitizeInput(key);
  const safeValue = sanitizeInput(nextValue);
  return {
    title: `Confirm update ${safeKey}`,
    command: ['config', '--global', safeKey, safeValue],
    diff: createDiffPreview(`${safeKey}=${currentValue}`, `${safeKey}=${safeValue}`),
  };
}

/**
 * Builds a multi-command preview, used for common aliases.
 */
export function prepareGitAliasChange(): GitPendingChange {
  const before = '[alias]\n# no standard aliases detected';
  const after = ['[alias]', '  st = status -sb', '  co = checkout', '  br = branch', '  lg = log --oneline --graph --decorate'].join('\n');
  return {
    title: 'Confirm common aliases',
    command: ['alias-batch'],
    diff: createDiffPreview(before, after),
  };
}

/**
 * Executes a prepared Git config change.
 */
export async function executeGitChange(change: GitPendingChange) {
  if (change.command[0] === 'alias-batch') {
    const commands = [
      ['config', '--global', 'alias.st', 'status -sb'],
      ['config', '--global', 'alias.co', 'checkout'],
      ['config', '--global', 'alias.br', 'branch'],
      ['config', '--global', 'alias.lg', 'log --oneline --graph --decorate'],
    ] as const;

    for (const command of commands) {
      const result = await runCommand('git', command);
      if (!result.ok) {
        return result;
      }
    }

    return {ok: true, stdout: 'Git aliases updated.', stderr: '', code: 0, command: 'git alias batch'};
  }

  return runCommand('git', change.command);
}

/**
 * Reads the raw Git config file content for display.
 */
export async function getGitRawConfig(targetPath: string): Promise<string> {
  return (await readTextFile(targetPath)) ?? '(file not found)';
}
