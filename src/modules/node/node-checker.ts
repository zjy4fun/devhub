import {readTextFile} from '../../utils/file.js';
import {runCommand} from '../../utils/shell.js';
import {CHINA_MIRRORS} from '../../utils/china-mirror.js';

/**
 * Single tool version probe result.
 */
export interface BinaryStatus {
  readonly name: string;
  readonly version: string;
  readonly installed: boolean;
  readonly detail?: string;
}

/**
 * Node ecosystem summary consumed by the UI.
 */
export interface NodeSummary {
  readonly binaries: readonly BinaryStatus[];
  readonly nodeSource: string;
  readonly registry: string;
  readonly npmrc: string;
  readonly health: readonly {status: 'ok' | 'warn' | 'error'; message: string}[];
}

/**
 * Checks one executable and returns version information.
 */
async function detectBinary(name: string, args: readonly string[]): Promise<BinaryStatus> {
  const result = await runCommand(name, args);
  if (!result.ok) {
    return {name, version: 'Not installed', installed: false};
  }

  const version = (result.stdout || result.stderr).split('\n')[0];
  return {name, version, installed: true};
}

/**
 * Detects Node ecosystem tools, npm config, and health signals.
 */
export async function loadNodeSummary(): Promise<NodeSummary> {
  const [node, npm, pnpm, yarn, nvm, fnm, bun, whichNode, registryResult, npmrc] = await Promise.all([
    detectBinary('node', ['-v']),
    detectBinary('npm', ['-v']),
    detectBinary('pnpm', ['-v']),
    detectBinary('yarn', ['-v']),
    detectBinary('nvm', ['--version']),
    detectBinary('fnm', ['--version']),
    detectBinary('bun', ['-v']),
    runCommand('which', ['node']),
    runCommand('npm', ['config', 'get', 'registry']),
    readTextFile('~/.npmrc'),
  ]);
  const registry = registryResult.ok ? registryResult.stdout : CHINA_MIRRORS.npm.official;
  const nodeSource = whichNode.ok && whichNode.stdout.includes('.nvm') ? 'via nvm' : 'system';
  const majorMatch = node.version.match(/^v(\d+)\./);
  const nodeMajor = majorMatch ? Number(majorMatch[1]) : null;
  const health = [
    node.installed && nodeMajor !== null && nodeMajor >= 18
      ? {status: 'ok' as const, message: 'Node.js LTS version'}
      : {status: 'error' as const, message: 'Node.js not installed or too old'},
    nvm.installed
      ? {status: 'ok' as const, message: 'nvm installed, managing Node versions'}
      : {status: 'warn' as const, message: 'nvm not installed'},
    registry === CHINA_MIRRORS.npm.mirror
      ? {status: 'warn' as const, message: 'npm registry is using a China mirror (international projects may need a switch)'}
      : {status: 'ok' as const, message: 'npm registry uses the official source'},
    yarn.installed ? {status: 'ok' as const, message: 'yarn installed'} : {status: 'error' as const, message: 'yarn not installed'},
  ];

  return {
    binaries: [
      {...node, detail: nodeSource},
      npm,
      pnpm,
      yarn,
      nvm,
      fnm,
      bun,
    ],
    nodeSource,
    registry,
    npmrc: npmrc ?? '',
    health,
  };
}
