import path from 'node:path';
import {createDiffPreview, expandHome, readTextFile, writeTextFile} from '../../utils/file.js';
import {pathExists} from '../../utils/file.js';
import {runCommand, sanitizeInput} from '../../utils/shell.js';

/**
 * Preview of a filesystem-based SSH config change.
 */
export interface SshPendingChange {
  readonly title: string;
  readonly diff: string;
  readonly execute: () => Promise<{ok: boolean; stdout: string; stderr: string}>;
}

/**
 * Prepares a new SSH host config block append operation.
 */
export async function prepareHostConfigAppend(hostAlias: string, hostName: string, user: string, identityFile: string): Promise<SshPendingChange> {
  const configPath = expandHome('~/.ssh/config');
  const current = (await readTextFile(configPath)) ?? '';
  const block = ['', `Host ${sanitizeInput(hostAlias)}`, `  HostName ${sanitizeInput(hostName)}`, `  User ${sanitizeInput(user)}`, '  Port 22', `  IdentityFile ${sanitizeInput(identityFile)}`, ''].join('\n');
  const next = current.endsWith('\n') || current.length === 0 ? `${current}${block}` : `${current}\n${block}`;
  return {
    title: 'Confirm SSH host config update',
    diff: createDiffPreview(current, next),
    execute: async () => {
      await writeTextFile(configPath, next);
      return {ok: true, stdout: 'SSH config updated.', stderr: ''};
    },
  };
}

/**
 * Adds a key to the local ssh-agent.
 */
export async function addKeyToAgent(keyName: string) {
  return runCommand('ssh-add', [path.join(expandHome('~/.ssh'), sanitizeInput(keyName))], 10_000);
}

/**
 * Tests host connectivity using `ssh -T`.
 */
export async function testSSHHost(host: string) {
  return runCommand('ssh', ['-T', sanitizeInput(host)], 10_000);
}

/**
 * Generates a new SSH key with sane defaults.
 */
export async function generateSSHKey(email: string, fileName: string) {
  const target = path.join(expandHome('~/.ssh'), sanitizeInput(fileName));
  return runCommand('ssh-keygen', ['-t', 'ed25519', '-C', sanitizeInput(email), '-f', target, '-N', ''], 20_000);
}

/**
 * Fixes standard SSH permissions in one action.
 */
export async function fixSshPermissions(keyFiles: readonly string[]) {
  const results = [await runCommand('chmod', ['700', expandHome('~/.ssh')]), await runCommand('chmod', ['600', expandHome('~/.ssh/config')])];
  for (const keyFile of keyFiles) {
    const privatePath = path.join(expandHome('~/.ssh'), keyFile);
    const publicPath = `${privatePath}.pub`;
    if (await pathExists(privatePath)) {
      results.push(await runCommand('chmod', ['600', privatePath]));
    }

    if (await pathExists(publicPath)) {
      results.push(await runCommand('chmod', ['644', publicPath]));
    }
  }

  const failed = results.find((result) => !result.ok);
  if (failed) {
    return failed;
  }

  return {ok: true, stdout: 'SSH permissions repaired.', stderr: '', code: 0, command: 'chmod batch'};
}
