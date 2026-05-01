import React, { useCallback, useState } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { Layout } from '../../components/Layout.js';
import { MenuList } from '../../components/MenuList.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { ConfirmDialog } from '../../components/ConfirmDialog.js';
import { EditableField } from '../../components/EditableField.js';
import { BackButton } from '../../components/BackButton.js';
import { useModule } from '../../hooks/useModule.js';
import {
  addKeyToAgent,
  fixSshPermissions,
  generateSSHKey,
  prepareHostConfigAppend,
  testSSHHost,
  type SshPendingChange,
} from './ssh-actions.js';
import { loadSSHSummary, type SSHSummary } from './ssh-parser.js';
import { MutedText } from '../../components/MutedText.js';
import { THEME } from '../../theme.js';

type SSHView = 'menu' | 'generate-email' | 'generate-name' | 'add-agent' | 'edit-host' | 'test' | 'confirm' | 'raw';

/**
 * SSH management screen.
 */
export function SSHModule({ onBack }: { readonly onBack: () => void }) {
  const loader = useCallback(() => loadSSHSummary(), []);
  const { data: summary, loading, message, showMessage, refresh } = useModule<SSHSummary>(loader);
  const [view, setView] = useState<SSHView>('menu');
  const [pending, setPending] = useState<SshPendingChange | null>(null);
  const [generateEmail, setGenerateEmail] = useState('');

  if (loading || !summary) {
    return (
      <Layout title="DevHub — SSH Config" subtitle="🔐 SSH Config    ~/.ssh/">
        <Box>
          <Spinner />
          <Text> Loading SSH config...</Text>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="DevHub — SSH Config" subtitle="🔐 SSH Config    ~/.ssh/">
      <MutedText>── Key List ──────────────────────────</MutedText>
      {summary.keys.length === 0 ? <MutedText>No key files detected</MutedText> : null}
      {summary.keys.map((key, index) => (
        <Text key={`${key.name}-${key.path}-${index}`}>
          {`🔑 ${key.name}    ${key.type}  ${key.agentLoaded ? '✓ agent loaded' : '✗ agent not loaded'}  ${key.privateMode === '0600' ? '✓ mode 600' : `⚠ mode ${key.privateMode}`}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <MutedText>── Host Config ──────────────────────────</MutedText>
        {summary.hosts.length === 0 ? <MutedText>No Host config detected</MutedText> : null}
        {summary.hosts.map((host, index) => (
          <Text
            key={`${host.host}-${host.hostname}-${index}`}
          >{`${host.host}     → ${host.user}@${host.hostname}:${host.port} (${host.identityFile ?? 'no IdentityFile'})`}</Text>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <MutedText>── Health Check ──────────────────────────</MutedText>
        {summary.health.map((item, index) => (
          <Box key={`${item.status}-${item.message}-${index}`}>
            <StatusBadge variant={item.status} />
            <Text>{` ${item.message}`}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <MutedText>── Actions ──────────────────────────────</MutedText>
        {view === 'menu' ? (
          <MenuList
            items={[
              { label: 'Generate new key pair', value: 'generate' },
              { label: 'Add key to ssh-agent', value: 'add-agent' },
              { label: 'Edit host config', value: 'edit-host' },
              { label: 'Test host connection', value: 'test' },
              { label: 'Fix file permissions', value: 'fix' },
              { label: 'View full config (raw)', value: 'raw' },
              { label: '← Back to main menu', value: 'back' },
            ]}
            onSelect={async (value) => {
              if (value === 'back') {
                onBack();
                return;
              }

              if (value === 'fix') {
                const result = await fixSshPermissions(summary.keys.map((key) => key.name));
                showMessage(result.ok ? result.stdout : result.stderr, result.ok ? 'success' : 'error');
                await refresh();
                return;
              }

              if (value === 'raw') {
                setView('raw');
                return;
              }

              if (value === 'generate') {
                setView('generate-email');
                return;
              }

              setView(value as SSHView);
            }}
          />
        ) : null}

        {view === 'generate-email' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Step 1/2: Enter email for the key"
              placeholder="name@example.com"
              onSubmit={(value) => {
                if (!value.trim()) {
                  showMessage('Please enter an email address.', 'error');
                  return;
                }

                setGenerateEmail(value.trim());
                setView('generate-name');
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'generate-name' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`Step 2/2: Enter key filename (email: ${generateEmail})`}
              placeholder="id_work"
              onSubmit={async (value) => {
                if (!value.trim()) {
                  showMessage('Please enter a key filename.', 'error');
                  return;
                }

                const result = await generateSSHKey(generateEmail, value.trim());
                showMessage(
                  result.ok ? result.stdout || 'Key generated.' : result.stderr,
                  result.ok ? 'success' : 'error',
                );
                setView('menu');
                await refresh();
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'add-agent' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Enter the key filename to add to the agent"
              placeholder="id_ed25519"
              onSubmit={async (value) => {
                if (!value.trim()) {
                  showMessage('Please enter a key filename.', 'error');
                  return;
                }

                const result = await addKeyToAgent(value);
                showMessage(
                  result.ok ? result.stdout || 'Added to ssh-agent.' : result.stderr,
                  result.ok ? 'success' : 'error',
                );
                setView('menu');
                await refresh();
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit-host' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Enter host config in the format: alias,hostname,user,identityFile"
              placeholder="github-work,github.com,git,~/.ssh/id_work"
              onSubmit={async (value) => {
                const [alias, hostName, user, identityFile] = value.split(',').map((part) => part.trim());
                if (!alias || !hostName || !user || !identityFile) {
                  showMessage('Please enter alias, hostname, user, and identityFile.', 'error');
                  return;
                }

                setPending(await prepareHostConfigAppend(alias, hostName, user, identityFile));
                setView('confirm');
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'test' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Enter the Host alias to test"
              placeholder="github.com"
              onSubmit={async (value) => {
                if (!value.trim()) {
                  showMessage('Please enter the Host alias to test.', 'error');
                  return;
                }

                const result = await testSSHHost(value);
                showMessage(
                  result.ok ? result.stdout || result.stderr || 'Connection test complete.' : result.stderr,
                  result.ok ? 'success' : 'error',
                );
                setView('menu');
              }}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'confirm' && pending ? (
          <ConfirmDialog
            title={pending.title}
            diff={pending.diff}
            onCancel={() => {
              setPending(null);
              setView('menu');
            }}
            onConfirm={async () => {
              const result = await pending.execute();
              showMessage(result.ok ? result.stdout : result.stderr, result.ok ? 'success' : 'error');
              setPending(null);
              setView('menu');
              await refresh();
            }}
          />
        ) : null}

        {view === 'raw' ? (
          <Box flexDirection="column">
            <Text>{summary.configRaw || '(config not found)'}</Text>
            <BackButton />
          </Box>
        ) : null}
      </Box>

      {message ? (
        <Box marginTop={1}>
          <Text color={message.toLowerCase().includes('error') ? THEME.danger : THEME.success}>{message}</Text>
        </Box>
      ) : null}
    </Layout>
  );
}
