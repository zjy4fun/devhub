import React, {useEffect, useState} from 'react';
import {Box, Text} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {StatusBadge} from '../../components/StatusBadge.js';
import {ConfirmDialog} from '../../components/ConfirmDialog.js';
import {EditableField} from '../../components/EditableField.js';
import {BackButton} from '../../components/BackButton.js';
import {addKeyToAgent, fixSshPermissions, generateSSHKey, prepareHostConfigAppend, testSSHHost, type SshPendingChange} from './ssh-actions.js';
import {loadSSHSummary, type SSHSummary} from './ssh-parser.js';

type SSHView = 'menu' | 'generate' | 'add-agent' | 'edit-host' | 'test' | 'confirm' | 'raw';

/**
 * SSH management screen.
 */
export function SSHModule({onBack}: {readonly onBack: () => void}) {
  const [summary, setSummary] = useState<SSHSummary | null>(null);
  const [view, setView] = useState<SSHView>('menu');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<SshPendingChange | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('');

  const refresh = async () => {
    setLoading(true);
    setSummary(await loadSSHSummary());
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  if (loading || !summary) {
    return (
      <Layout title="DevHub — SSH Config" subtitle="🔐 SSH Config    ~/.ssh/">
        <Text color="#58a6ff">Loading SSH config...</Text>
      </Layout>
    );
  }

  return (
    <Layout title="DevHub — SSH Config" subtitle="🔐 SSH Config    ~/.ssh/">
      <Text color="#6e7681">── Key List ──────────────────────────</Text>
      {summary.keys.length === 0 ? <Text color="#6e7681">No key files detected</Text> : null}
      {summary.keys.map((key, index) => (
        <Text key={`${key.name}-${key.path}-${index}`}>
          {`🔑 ${key.name}    ${key.type}  ${key.agentLoaded ? '✓ agent loaded' : '✗ agent not loaded'}  ${key.privateMode === '0600' ? '✓ mode 600' : `⚠ mode ${key.privateMode}`}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── Host Config ──────────────────────────</Text>
      {summary.hosts.length === 0 ? <Text color="#6e7681">No Host config detected</Text> : null}
        {summary.hosts.map((host, index) => (
          <Text key={`${host.host}-${host.hostname}-${index}`}>{`${host.host}     → ${host.user}@${host.hostname}:${host.port} (${host.identityFile ?? 'no IdentityFile'})`}</Text>
        ))}
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
              {label: 'Generate new key pair', value: 'generate'},
              {label: 'Add key to ssh-agent', value: 'add-agent'},
              {label: 'Edit host config', value: 'edit-host'},
              {label: 'Test host connection', value: 'test'},
              {label: 'Fix file permissions', value: 'fix'},
              {label: 'View full config (raw)', value: 'raw'},
              {label: '← Back to main menu', value: 'back'},
            ]}
            onSelect={async (value) => {
              if (value === 'back') {
                onBack();
                return;
              }

              if (value === 'fix') {
                const result = await fixSshPermissions(summary.keys.map((key) => key.name));
                setMessage(result.ok ? result.stdout : result.stderr);
                await refresh();
                return;
              }

              if (value === 'raw') {
                setView('raw');
                return;
              }

              setView(value as SSHView);
            }}
          />
        ) : null}

        {view === 'generate' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Enter email and new key filename in the format: email,fileName"
              placeholder="name@example.com,id_work"
              onSubmit={async (value) => {
                const [email, fileName] = value.split(',').map((part) => part.trim());
                if (!email || !fileName) {
                  setMessage('Please enter an email and key filename.');
                  return;
                }

                const result = await generateSSHKey(email, fileName);
                setMessage(result.ok ? result.stdout || 'Key generated.' : result.stderr);
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
              defaultValue={selectedKey}
              onSubmit={async (value) => {
                if (!value.trim()) {
                  setMessage('Please enter a key filename.');
                  return;
                }

                const result = await addKeyToAgent(value);
                setMessage(result.ok ? result.stdout || 'Added to ssh-agent.' : result.stderr);
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
                  setMessage('Please enter alias, hostname, user, and identityFile.');
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
                  setMessage('Please enter the Host alias to test.');
                  return;
                }

                const result = await testSSHHost(value);
                setMessage(result.ok ? result.stdout || result.stderr || 'Connection test complete.' : result.stderr);
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
              setMessage(result.ok ? result.stdout : result.stderr);
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
          <Text color={message.toLowerCase().includes('error') ? '#f85149' : '#3fb950'}>{message}</Text>
        </Box>
      ) : null}
    </Layout>
  );
}
