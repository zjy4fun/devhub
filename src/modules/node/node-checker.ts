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
    return {name, version: '未安装', installed: false};
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
      ? {status: 'ok' as const, message: 'Node.js LTS 版本'}
      : {status: 'error' as const, message: 'Node.js 未安装或版本过低'},
    nvm.installed
      ? {status: 'ok' as const, message: 'nvm 已安装，管理 Node 版本'}
      : {status: 'warn' as const, message: 'nvm 未安装'},
    registry === CHINA_MIRRORS.npm.mirror
      ? {status: 'warn' as const, message: 'npm registry 为中国镜像（国际项目可能需要切换）'}
      : {status: 'ok' as const, message: 'npm registry 使用官方源'},
    yarn.installed ? {status: 'ok' as const, message: 'yarn 已安装'} : {status: 'error' as const, message: 'yarn 未安装'},
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
