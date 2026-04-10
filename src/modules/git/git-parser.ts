import path from 'node:path';
import ini from 'ini';
import {z} from 'zod';
import {detectPlatform} from '../../utils/platform.js';
import {expandHome, pathExists, readTextFile} from '../../utils/file.js';

const GitConfigSchema = z.object({
  user: z.record(z.string(), z.string()).optional(),
  core: z.record(z.string(), z.string()).optional(),
  init: z.record(z.string(), z.string()).optional(),
  pull: z.record(z.string(), z.string()).optional(),
  credential: z.record(z.string(), z.string()).optional(),
  commit: z.record(z.string(), z.string()).optional(),
  gpg: z.record(z.string(), z.string()).optional(),
});

/**
 * Single health check line for module summaries.
 */
export interface HealthItem {
  readonly status: 'ok' | 'warn' | 'error' | 'info';
  readonly message: string;
}

/**
 * Parsed Git configuration summary used by the UI.
 */
export interface GitConfigSummary {
  readonly globalPath: string;
  readonly localPath: string;
  readonly globalRaw: string;
  readonly localRaw: string | null;
  readonly globalConfig: z.infer<typeof GitConfigSchema>;
  readonly localConfig: z.infer<typeof GitConfigSchema> | null;
  readonly preview: {
    readonly userName: string;
    readonly userEmail: string;
    readonly defaultEditor: string;
    readonly defaultBranch: string;
    readonly pullStrategy: string;
    readonly credentialHelper: string;
  };
  readonly health: readonly HealthItem[];
}

/**
 * Parses an INI Git config file into a validated object.
 */
export function parseGitConfig(raw: string): z.infer<typeof GitConfigSchema> {
  const parsed = ini.parse(raw) as Record<string, unknown>;
  return GitConfigSchema.parse(parsed);
}

/**
 * Loads global and local Git config files and computes UI health information.
 */
export async function loadGitConfig(cwd = process.cwd()): Promise<GitConfigSummary> {
  const globalPath = expandHome('~/.gitconfig');
  const localPath = path.join(cwd, '.git', 'config');
  const globalRaw = (await readTextFile(globalPath)) ?? '';
  const localRaw = await readTextFile(localPath);
  const globalConfig = parseGitConfig(globalRaw);
  const localConfig = localRaw ? parseGitConfig(localRaw) : null;
  const platform = detectPlatform();
  const preview = {
    userName: globalConfig.user?.name ?? '(not set)',
    userEmail: globalConfig.user?.email ?? '(not set)',
    defaultEditor: globalConfig.core?.editor ?? '(not set)',
    defaultBranch: globalConfig.init?.defaultBranch ?? '(not set)',
    pullStrategy: globalConfig.pull?.rebase ?? '(not set)',
    credentialHelper: globalConfig.credential?.helper ?? '(not set)',
  };

  const health: HealthItem[] = [
    globalConfig.user?.name
      ? {status: 'ok', message: 'user.name configured'}
      : {status: 'error', message: 'user.name not configured'},
    globalConfig.user?.email
      ? {status: 'ok', message: 'user.email configured'}
      : {status: 'error', message: 'user.email not configured'},
    globalConfig.init?.defaultBranch === 'main'
      ? {status: 'ok', message: 'init.defaultBranch = main'}
      : {status: 'warn', message: 'init.defaultBranch should be set to main'},
    globalConfig.core?.autocrlf
      ? {status: 'ok', message: `core.autocrlf = ${globalConfig.core.autocrlf}`}
      : {
          status: 'warn',
          message: `core.autocrlf not set (recommended: ${platform === 'Windows' ? 'true' : 'input'})`,
        },
    globalConfig.pull?.rebase
      ? {status: 'ok', message: `pull.rebase = ${globalConfig.pull.rebase}`}
      : {status: 'warn', message: 'pull.rebase not set'},
    globalConfig.commit?.gpgsign || globalConfig.gpg?.format || globalConfig.user?.signingkey
      ? {status: 'ok', message: 'Signing-related config detected'}
      : {status: 'warn', message: 'No GPG/SSH signing config detected'},
  ];

  if (await pathExists(localPath)) {
    health.push({status: 'info', message: `Local config detected: ${localPath}`});
  }

  return {
    globalPath,
    localPath,
    globalRaw,
    localRaw,
    globalConfig,
    localConfig,
    preview,
    health,
  };
}
