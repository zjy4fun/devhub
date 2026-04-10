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
      <Layout title="DevHub — Node.js Ecosystem" subtitle="💚 Node.js Ecosystem">
        <Text color="#58a6ff">Loading Node.js ecosystem...</Text>
      </Layout>
    );
  }

  return (
    <Layout title="DevHub — Node.js Ecosystem" subtitle="💚 Node.js Ecosystem">
      <Text color="#6e7681">── Environment Check ──────────────────────────</Text>
      {summary.binaries.map((binary, index) => (
        <Text key={`${binary.name}-${index}`}>
          {`${binary.name.padEnd(12)} ${binary.version.padEnd(12)} ${binary.installed ? '✓' : '✗'}${binary.detail ? ` (${binary.detail})` : ''}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── npm Config ──────────────────────────</Text>
        <Text>{`registry    ${summary.registry}`}</Text>
        <Text>{`prefix      ${process.env.npm_config_prefix ?? '~/.npm-global'}`}</Text>
        <Text>{`cache       ${process.env.npm_config_cache ?? '~/.npm'}`}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── Health Check ──────────────────────────</Text>
        {summary.health.map((item, index) => (
          <Box key={`${item.status}-${item.message}-${index}`}>
            <StatusBadge variant={item.status} />
            <Text>{` ${item.message}`}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── Actions ──────────────────────────────</Text>
        {view === 'menu' ? (
          <MenuList
            items={[
              {label: 'Switch npm registry (official/China mirror)', value: 'registry'},
              {label: 'Install/update Node.js (via nvm)', value: 'install'},
              {label: 'Install package managers (pnpm/yarn/bun)', value: 'pkg-manager'},
              {label: 'View globally installed packages', value: 'packages'},
              {label: 'Clear npm cache', value: 'cache'},
              {label: '← Back to main menu', value: 'back'},
            ]}
            onSelect={async (value) => {
              if (value === 'back') {
                onBack();
                return;
              }

              if (value === 'cache') {
                const result = await runCommand('npm', ['cache', 'clean', '--force'], 15_000);
                setMessage(result.ok ? result.stdout || 'npm cache cleared.' : result.stderr);
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
              label="Enter official or china"
              placeholder="official"
              onSubmit={async (value) => {
                const registry = value.trim() === 'china' ? CHINA_MIRRORS.npm.mirror : CHINA_MIRRORS.npm.official;
                const result = await runCommand('npm', ['config', 'set', 'registry', registry], 10_000);
                setMessage(result.ok ? `npm registry switched to ${registry}` : result.stderr);
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
              label="Enter install target: lts / pnpm / yarn / bun"
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
                    result = {ok: false, stdout: '', stderr: 'Unsupported install target.', code: 1, command: value};
                }

                setMessage(result.ok ? result.stdout || 'Operation complete.' : result.stderr);
                setView('menu');
                await refresh();
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'packages' ? (
          <Box flexDirection="column">
            <Text>{globalPackages || '(no output)'}</Text>
            <BackButton />
          </Box>
        ) : null}
      </Box>

      {message ? (
        <Box marginTop={1}>
          <Text color={message === 'Unsupported install target.' ? '#f85149' : '#3fb950'}>{message}</Text>
        </Box>
      ) : null}
    </Layout>
  );
}
