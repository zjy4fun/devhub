import fs from 'node:fs/promises';
import path from 'node:path';
import SSHConfig, {type Directive, type Section} from 'ssh-config';
import {z} from 'zod';
import {expandHome, pathExists, readTextFile, toOctalMode} from '../../utils/file.js';
import {runCommand} from '../../utils/shell.js';

const SshKeySchema = z.object({
  name: z.string(),
  path: z.string(),
  publicKeyPath: z.string().nullable(),
  type: z.string(),
  agentLoaded: z.boolean(),
  privateMode: z.string(),
  publicMode: z.string().nullable(),
});

const SshHostSchema = z.object({
  host: z.string(),
  hostname: z.string(),
  user: z.string(),
  port: z.string(),
  identityFile: z.string().nullable(),
});

/**
 * Health line used in SSH screen.
 */
export interface SSHHealthItem {
  readonly status: 'ok' | 'warn' | 'error';
  readonly message: string;
}

/**
 * Full SSH module data payload.
 */
export interface SSHSummary {
  readonly sshDir: string;
  readonly configPath: string;
  readonly configRaw: string;
  readonly keys: readonly z.infer<typeof SshKeySchema>[];
  readonly hosts: readonly z.infer<typeof SshHostSchema>[];
  readonly health: readonly SSHHealthItem[];
}

/**
 * Best-effort key type detection from filename and ssh-keygen output.
 */
async function detectKeyType(filePath: string): Promise<string> {
  const result = await runCommand('ssh-keygen', ['-lf', filePath]);
  if (result.ok && result.stdout) {
    const match = result.stdout.match(/\(([^)]+)\)$/);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  if (filePath.includes('ed25519')) {
    return 'ED25519';
  }

  if (filePath.includes('rsa')) {
    return 'RSA';
  }

  return 'Unknown';
}

/**
 * Parses host sections from an ssh-config file.
 */
function parseHosts(configText: string): z.infer<typeof SshHostSchema>[] {
  if (!configText.trim()) {
    return [];
  }

  const config = SSHConfig.parse(configText);
  const hosts: z.infer<typeof SshHostSchema>[] = [];

  for (const line of config) {
    if (line.type !== SSHConfig.DIRECTIVE) {
      continue;
    }

    const directive = line as Directive;
    if (directive.param.toLowerCase() !== 'host') {
      continue;
    }

    const section = line as Section;
    const hostValue =
      typeof directive.value === 'string'
        ? directive.value
        : directive.value.map((entry) => entry.val).join(', ');
    const resolved = section.config.reduce<Record<string, string>>((accumulator, item) => {
      if (item.type === SSHConfig.DIRECTIVE && typeof item.value === 'string') {
        accumulator[item.param.toLowerCase()] = item.value;
      }

      return accumulator;
    }, {});

    hosts.push(
      SshHostSchema.parse({
        host: hostValue,
        hostname: resolved.hostname ?? hostValue,
        user: resolved.user ?? 'git',
        port: resolved.port ?? '22',
        identityFile: resolved.identityfile ?? null,
      }),
    );
  }

  return hosts;
}

/**
 * Loads private keys, ssh-agent status, config, and permission checks.
 */
export async function loadSSHSummary(): Promise<SSHSummary> {
  const sshDir = expandHome('~/.ssh');
  const configPath = path.join(sshDir, 'config');
  const configRaw = (await readTextFile(configPath)) ?? '';
  const entries = (await pathExists(sshDir)) ? await fs.readdir(sshDir) : [];
  const agentList = await runCommand('ssh-add', ['-l']);
  const agentOutput = `${agentList.stdout}\n${agentList.stderr}`;

  const keyFiles = entries.filter((entry: string) => {
    if (['config', 'known_hosts', 'authorized_keys'].includes(entry) || entry.endsWith('.pub')) {
      return false;
    }

    return !entry.includes('.');
  });

  const keys = await Promise.all(
    keyFiles.map(async (entry: string) => {
      const privatePath = path.join(sshDir, entry);
      const publicKeyPath = (await pathExists(`${privatePath}.pub`)) ? `${privatePath}.pub` : null;
      const privateStat = await fs.stat(privatePath);
      const publicStat = publicKeyPath ? await fs.stat(publicKeyPath) : null;
      const key = SshKeySchema.parse({
        name: entry,
        path: privatePath,
        publicKeyPath,
        type: await detectKeyType(privatePath),
        agentLoaded: agentOutput.includes(entry),
        privateMode: toOctalMode(privateStat.mode),
        publicMode: publicStat ? toOctalMode(publicStat.mode) : null,
      });

      return key;
    }),
  );

  const hosts = parseHosts(configRaw);
  const sshDirMode = (await pathExists(sshDir)) ? toOctalMode((await fs.stat(sshDir)).mode) : 'missing';
  const configMode = (await pathExists(configPath)) ? toOctalMode((await fs.stat(configPath)).mode) : 'missing';
  const health: SSHHealthItem[] = [
    sshDirMode === '0700'
      ? {status: 'ok', message: '~/.ssh 目录权限 700'}
      : {status: 'warn', message: `~/.ssh 目录权限建议 700，当前 ${sshDirMode}`},
    configMode === '0600'
      ? {status: 'ok', message: 'config 文件权限 600'}
      : {status: 'warn', message: `config 文件权限建议 600，当前 ${configMode}`},
  ];

  for (const key of keys) {
    if (key.privateMode !== '0600') {
      health.push({status: 'error', message: `${key.name} 私钥权限应为 600，当前 ${key.privateMode}`});
    }

    if (!key.agentLoaded) {
      health.push({status: 'warn', message: `${key.name} 未加载到 ssh-agent`});
    }
  }

  for (const host of hosts) {
    if (!host.identityFile) {
      continue;
    }

    const resolvedIdentity = host.identityFile.startsWith('~/')
      ? expandHome(host.identityFile)
      : host.identityFile;
    if (!(await pathExists(resolvedIdentity))) {
      health.push({status: 'warn', message: `config 中引用了 ${host.identityFile}，但该文件不存在`});
    }
  }

  return {sshDir, configPath, configRaw, keys, hosts, health};
}
