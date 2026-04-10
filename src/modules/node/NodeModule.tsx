import React, {useEffect, useState} from 'react';
import {Box, Text} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {StatusBadge} from '../../components/StatusBadge.js';
import {EditableField} from '../../components/EditableField.js';
import {loadNodeSummary, type NodeSummary} from './node-checker.js';
import {runCommand} from '../../utils/shell.js';
import {CHINA_MIRRORS} from '../../utils/china-mirror.js';
import {BackButton} from '../../components/BackButton.js';

type NodeView = 'menu' | 'registry' | 'install' | 'packages' | 'raw';

/**
 * Node ecosystem management screen.
 */
export function NodeModule({onBack}: {readonly onBack: () => void}) {
  const [summary, setSummary] = useState<NodeSummary | null>(null);
  const [view, setView] = useState<NodeView>('menu');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [globalPackages, setGlobalPackages] = useState('');

  const refresh = async () => {
    setLoading(true);
    setSummary(await loadNodeSummary());
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  if (loading || !summary) {
    return (
      <Layout title="DevHub — Node.js 生态" subtitle="💚 Node.js 生态">
        <Text color="#58a6ff">检测 Node.js 生态中...</Text>
      </Layout>
    );
  }

  return (
    <Layout title="DevHub — Node.js 生态" subtitle="💚 Node.js 生态">
      <Text color="#6e7681">── 环境检测 ──────────────────────────</Text>
      {summary.binaries.map((binary, index) => (
        <Text key={`${binary.name}-${index}`}>
          {`${binary.name.padEnd(12)} ${binary.version.padEnd(12)} ${binary.installed ? '✓' : '✗'}${binary.detail ? ` (${binary.detail})` : ''}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── npm 配置 ──────────────────────────</Text>
        <Text>{`registry    ${summary.registry}`}</Text>
        <Text>{`prefix      ${process.env.npm_config_prefix ?? '~/.npm-global'}`}</Text>
        <Text>{`cache       ${process.env.npm_config_cache ?? '~/.npm'}`}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── 健康检查 ──────────────────────────</Text>
        {summary.health.map((item, index) => (
          <Box key={`${item.status}-${item.message}-${index}`}>
            <StatusBadge variant={item.status} />
            <Text>{` ${item.message}`}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── 操作 ──────────────────────────────</Text>
        {view === 'menu' ? (
          <MenuList
            items={[
              {label: '切换 npm registry（官方/淘宝镜像一键切换）', value: 'registry'},
              {label: '安装/更新 Node.js（通过 nvm）', value: 'install'},
              {label: '安装包管理器（pnpm/yarn/bun）', value: 'pkg-manager'},
              {label: '查看全局安装的包', value: 'packages'},
              {label: '清理 npm 缓存', value: 'cache'},
              {label: '← 返回主菜单', value: 'back'},
            ]}
            onSelect={async (value) => {
              if (value === 'back') {
                onBack();
                return;
              }

              if (value === 'cache') {
                const result = await runCommand('npm', ['cache', 'clean', '--force'], 15_000);
                setMessage(result.ok ? result.stdout || 'npm cache 已清理。' : result.stderr);
                await refresh();
                return;
              }

              if (value === 'packages') {
                const result = await runCommand('npm', ['ls', '-g', '--depth=0'], 15_000);
                setGlobalPackages(result.ok ? result.stdout : result.stderr);
                setView('packages');
                return;
              }

              setView(value === 'pkg-manager' ? 'install' : (value as NodeView));
            }}
          />
        ) : null}

        {view === 'registry' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="输入 official 或 china"
              placeholder="official"
              onSubmit={async (value) => {
                const registry = value.trim() === 'china' ? CHINA_MIRRORS.npm.mirror : CHINA_MIRRORS.npm.official;
                const result = await runCommand('npm', ['config', 'set', 'registry', registry], 10_000);
                setMessage(result.ok ? `npm registry 已切换到 ${registry}` : result.stderr);
                setView('menu');
                await refresh();
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'install' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="输入命令类型：lts / pnpm / yarn / bun"
              placeholder="lts"
              onSubmit={async (value) => {
                let result;
                switch (value.trim()) {
                  case 'lts':
                    result = await runCommand('bash', ['-lc', 'source ~/.nvm/nvm.sh && nvm install --lts'], 120_000);
                    break;
                  case 'pnpm':
                    result = await runCommand('npm', ['install', '-g', 'pnpm'], 120_000);
                    break;
                  case 'yarn':
                    result = await runCommand('npm', ['install', '-g', 'yarn'], 120_000);
                    break;
                  case 'bun':
                    result = await runCommand('npm', ['install', '-g', 'bun'], 120_000);
                    break;
                  default:
                    result = {ok: false, stdout: '', stderr: '不支持的安装目标。', code: 1, command: value};
                }

                setMessage(result.ok ? result.stdout || '操作完成。' : result.stderr);
                setView('menu');
                await refresh();
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'packages' ? (
          <Box flexDirection="column">
            <Text>{globalPackages || '(无输出)'}</Text>
            <BackButton />
          </Box>
        ) : null}
      </Box>

      {message ? (
        <Box marginTop={1}>
          <Text color={message === '不支持的安装目标。' ? '#f85149' : '#3fb950'}>{message}</Text>
        </Box>
      ) : null}
    </Layout>
  );
}
