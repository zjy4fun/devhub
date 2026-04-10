import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Normalized shell command result used by checker and action layers.
 */
export interface ShellResult {
  readonly ok: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly code: number | null;
  readonly command: string;
}

/**
 * Sanitizes user-provided command fragments before shell execution.
 */
export function sanitizeInput(value: string): string {
  return value.replace(/\0/g, '').replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Executes a command with a timeout and structured error capture.
 */
export async function runCommand(
  command: string,
  args: readonly string[] = [],
  timeoutMs = 5_000,
): Promise<ShellResult> {
  const safeCommand = sanitizeInput(command);
  const safeArgs = args.map((arg) => sanitizeInput(arg));

  try {
    const result = await execFileAsync(safeCommand, safeArgs, {
      timeout: timeoutMs,
      encoding: 'utf8',
      env: process.env,
    });

    return {
      ok: true,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
      code: 0,
      command: [safeCommand, ...safeArgs].join(' '),
    };
  } catch (error) {
    const commandError = error as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number;
    };

    return {
      ok: false,
      stdout: commandError.stdout?.trim() ?? '',
      stderr: commandError.stderr?.trim() ?? commandError.message,
      code: typeof commandError.code === 'number' ? commandError.code : null,
      command: [safeCommand, ...safeArgs].join(' '),
    };
  }
}
