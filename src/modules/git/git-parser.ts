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
    userName: globalConfig.user?.name ?? '(未设置)',
    userEmail: globalConfig.user?.email ?? '(未设置)',
    defaultEditor: globalConfig.core?.editor ?? '(未设置)',
    defaultBranch: globalConfig.init?.defaultBranch ?? '(未设置)',
    pullStrategy: globalConfig.pull?.rebase ?? '(未设置)',
    credentialHelper: globalConfig.credential?.helper ?? '(未设置)',
  };

  const health: HealthItem[] = [
    globalConfig.user?.name
      ? {status: 'ok', message: 'user.name 已配置'}
      : {status: 'error', message: 'user.name 未配置'},
    globalConfig.user?.email
      ? {status: 'ok', message: 'user.email 已配置'}
      : {status: 'error', message: 'user.email 未配置'},
    globalConfig.init?.defaultBranch === 'main'
      ? {status: 'ok', message: 'init.defaultBranch = main'}
      : {status: 'warn', message: 'init.defaultBranch 建议设置为 main'},
    globalConfig.core?.autocrlf
      ? {status: 'ok', message: `core.autocrlf = ${globalConfig.core.autocrlf}`}
      : {
          status: 'warn',
          message: `core.autocrlf 未设置（建议 ${platform === 'Windows' ? 'true' : 'input'}）`,
        },
    globalConfig.pull?.rebase
      ? {status: 'ok', message: `pull.rebase = ${globalConfig.pull.rebase}`}
      : {status: 'warn', message: 'pull.rebase 未设置'},
    globalConfig.commit?.gpgsign || globalConfig.gpg?.format || globalConfig.user?.signingkey
      ? {status: 'ok', message: '检测到 signing 相关配置'}
      : {status: 'warn', message: '未检测到 GPG/SSH signing 配置'},
  ];

  if (await pathExists(localPath)) {
    health.push({status: 'info', message: `检测到 local config: ${localPath}`});
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
