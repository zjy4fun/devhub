import os from 'node:os';

/**
 * Supported platform identifiers used across the UI and health checks.
 */
export type PlatformKind = 'macOS' | 'Linux' | 'Windows' | 'WSL';

/**
 * Returns whether the current process is running inside WSL.
 */
export function isWsl(): boolean {
  return process.platform === 'linux' && os.release().toLowerCase().includes('microsoft');
}

/**
 * Detects the current operating system for recommendation logic.
 */
export function detectPlatform(): PlatformKind {
  if (isWsl()) {
    return 'WSL';
  }

  if (process.platform === 'darwin') {
    return 'macOS';
  }

  if (process.platform === 'win32') {
    return 'Windows';
  }

  return 'Linux';
}

/**
 * Returns a short architecture label for the status bar.
 */
export function getArchLabel(): string {
  return process.arch;
}

/**
 * Builds a human-readable platform string for the header.
 */
export function getPlatformLabel(): string {
  return `${detectPlatform()} ${getArchLabel()}`;
}
