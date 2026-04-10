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
      <Layout title="DevHub — SSH 配置" subtitle="🔐 SSH 配置    ~/.ssh/">
        <Text color="#58a6ff">加载 SSH 配置中...</Text>
      </Layout>
    );
  }

  return (
    <Layout title="DevHub — SSH 配置" subtitle="🔐 SSH 配置    ~/.ssh/">
      <Text color="#6e7681">── 密钥列表 ──────────────────────────</Text>
      {summary.keys.length === 0 ? <Text color="#6e7681">未检测到密钥文件</Text> : null}
      {summary.keys.map((key, index) => (
        <Text key={`${key.name}-${key.path}-${index}`}>
          {`🔑 ${key.name}    ${key.type}  ${key.agentLoaded ? '✓ agent已加载' : '✗ agent未加载'}  ${key.privateMode === '0600' ? '✓ 权限600' : `⚠ 权限${key.privateMode}`}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── 主机配置 ──────────────────────────</Text>
      {summary.hosts.length === 0 ? <Text color="#6e7681">未检测到 Host 配置</Text> : null}
        {summary.hosts.map((host, index) => (
          <Text key={`${host.host}-${host.hostname}-${index}`}>{`${host.host}     → ${host.user}@${host.hostname}:${host.port} (${host.identityFile ?? 'no IdentityFile'})`}</Text>
        ))}
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
              {label: '生成新密钥对', value: 'generate'},
              {label: '添加密钥到 ssh-agent', value: 'add-agent'},
              {label: '编辑主机配置', value: 'edit-host'},
              {label: '测试主机连接', value: 'test'},
              {label: '修复文件权限', value: 'fix'},
              {label: '查看完整 config（raw）', value: 'raw'},
              {label: '← 返回主菜单', value: 'back'},
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
              label="输入邮箱与新密钥文件名，格式：email,fileName"
              placeholder="name@example.com,id_work"
              onSubmit={async (value) => {
                const [email, fileName] = value.split(',').map((part) => part.trim());
                if (!email || !fileName) {
                  setMessage('请输入邮箱和密钥文件名。');
                  return;
                }

                const result = await generateSSHKey(email, fileName);
                setMessage(result.ok ? result.stdout || '密钥已生成。' : result.stderr);
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
              label="输入要添加到 agent 的密钥文件名"
              placeholder="id_ed25519"
              defaultValue={selectedKey}
              onSubmit={async (value) => {
                if (!value.trim()) {
                  setMessage('请输入密钥文件名。');
                  return;
                }

                const result = await addKeyToAgent(value);
                setMessage(result.ok ? result.stdout || '已添加到 ssh-agent。' : result.stderr);
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
              label="输入主机配置，格式：alias,hostname,user,identityFile"
              placeholder="github-work,github.com,git,~/.ssh/id_work"
              onSubmit={async (value) => {
                const [alias, hostName, user, identityFile] = value.split(',').map((part) => part.trim());
                if (!alias || !hostName || !user || !identityFile) {
                  setMessage('请输入 alias、hostname、user 和 identityFile。');
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
              label="输入要测试的 Host 别名"
              placeholder="github.com"
              onSubmit={async (value) => {
                if (!value.trim()) {
                  setMessage('请输入要测试的 Host 别名。');
                  return;
                }

                const result = await testSSHHost(value);
                setMessage(result.ok ? result.stdout || result.stderr || '连接测试完成。' : result.stderr);
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
