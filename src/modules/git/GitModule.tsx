import React, {useEffect, useMemo, useState} from 'react';
import {Box, Text} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {KeyValue} from '../../components/KeyValue.js';
import {StatusBadge} from '../../components/StatusBadge.js';
import {ConfirmDialog} from '../../components/ConfirmDialog.js';
import {EditableField} from '../../components/EditableField.js';
import {BackButton} from '../../components/BackButton.js';
import {executeGitChange, getGitRawConfig, prepareGitAliasChange, prepareGitConfigChange, type GitPendingChange} from './git-actions.js';
import {loadGitConfig, type GitConfigSummary} from './git-parser.js';

type GitView = 'menu' | 'edit' | 'confirm' | 'raw';
type GitAction = 'identity' | 'editor' | 'branch' | 'alias' | 'pull' | 'raw';

/**
 * Git configuration page with preview, health checks, and guided edits.
 */
export function GitModule({onBack}: {readonly onBack: () => void}) {
  const [summary, setSummary] = useState<GitConfigSummary | null>(null);
  const [view, setView] = useState<GitView>('menu');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<GitPendingChange | null>(null);
  const [selectedAction, setSelectedAction] = useState<GitAction>('identity');
  const [message, setMessage] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const nextSummary = await loadGitConfig();
    setSummary(nextSummary);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const overview = useMemo(() => summary?.preview, [summary]);

  if (loading || !summary || !overview) {
    return (
      <Layout title="DevHub — Git 配置" subtitle="📦 Git 配置    ~/.gitconfig">
        <Text color="#58a6ff">加载 Git 配置中...</Text>
      </Layout>
    );
  }

  const actions = [
    {label: '修改用户名/邮箱', value: 'identity'},
    {label: '修改默认编辑器', value: 'editor'},
    {label: '修改默认分支名', value: 'branch'},
    {label: '配置常用 alias', value: 'alias'},
    {label: '配置 pull 策略', value: 'pull'},
    {label: '查看完整配置（raw）', value: 'raw'},
    {label: '← 返回主菜单', value: 'back'},
  ] as const;

  const submitSingleChange = async (key: string, currentValue: string, nextValue: string) => {
    setPending(await prepareGitConfigChange(key, currentValue, nextValue));
    setView('confirm');
  };

  return (
    <Layout title="DevHub — Git 配置" subtitle="📦 Git 配置    ~/.gitconfig">
      <Text color="#6e7681">── 当前配置预览 ──────────────────────</Text>
      <KeyValue label="用户名" value={overview.userName} muted={overview.userName === '(未设置)'} />
      <KeyValue label="邮箱" value={overview.userEmail} muted={overview.userEmail === '(未设置)'} />
      <KeyValue label="默认编辑器" value={overview.defaultEditor} muted={overview.defaultEditor === '(未设置)'} />
      <KeyValue label="默认分支" value={overview.defaultBranch} muted={overview.defaultBranch === '(未设置)'} />
      <KeyValue label="pull 策略" value={overview.pullStrategy} muted={overview.pullStrategy === '(未设置)'} />
      <KeyValue label="凭证存储" value={overview.credentialHelper} muted={overview.credentialHelper === '(未设置)'} />

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
            items={actions}
            onSelect={async (value) => {
              if (value === 'back') {
                onBack();
                return;
              }

              if (value === 'alias') {
                setPending(prepareGitAliasChange());
                setSelectedAction('alias');
                setView('confirm');
                return;
              }

              if (value === 'raw') {
                setRawText(
                  [`# Global: ${summary.globalPath}`, await getGitRawConfig(summary.globalPath), '', summary.localRaw ? `# Local: ${summary.localPath}\n${summary.localRaw}` : '# Local: not found'].join('\n'),
                );
                setView('raw');
                return;
              }

              setSelectedAction(value as GitAction);
              setView('edit');
            }}
          />
        ) : null}

        {view === 'edit' && selectedAction === 'identity' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`当前用户名: ${overview.userName}`}
              defaultValue={summary.globalConfig.user?.name}
              placeholder="新的 Git 用户名"
              onSubmit={(value) => void submitSingleChange('user.name', summary.globalConfig.user?.name ?? '', value)}
            />
            <EditableField
              label={`当前邮箱: ${overview.userEmail}`}
              defaultValue={summary.globalConfig.user?.email}
              placeholder="新的 Git 邮箱"
              onSubmit={(value) => void submitSingleChange('user.email', summary.globalConfig.user?.email ?? '', value)}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit' && selectedAction === 'editor' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`当前默认编辑器: ${overview.defaultEditor}`}
              defaultValue={summary.globalConfig.core?.editor}
              placeholder="例如 code --wait"
              onSubmit={(value) => void submitSingleChange('core.editor', summary.globalConfig.core?.editor ?? '', value)}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit' && selectedAction === 'branch' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`当前默认分支: ${overview.defaultBranch}`}
              defaultValue={summary.globalConfig.init?.defaultBranch ?? 'main'}
              placeholder="main"
              onSubmit={(value) => void submitSingleChange('init.defaultBranch', summary.globalConfig.init?.defaultBranch ?? '', value)}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit' && selectedAction === 'pull' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`当前 pull 策略: ${overview.pullStrategy}`}
              defaultValue={summary.globalConfig.pull?.rebase ?? 'true'}
              placeholder="true / false / merges"
              onSubmit={(value) => void submitSingleChange('pull.rebase', summary.globalConfig.pull?.rebase ?? '', value)}
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
              const result = await executeGitChange(pending);
              setMessage(result.ok ? result.stdout || '更新成功。' : `执行失败: ${result.stderr}`);
              setPending(null);
              setView('menu');
              await refresh();
            }}
          />
        ) : null}

        {view === 'raw' ? (
          <Box flexDirection="column">
            <Text>{rawText}</Text>
            <BackButton />
          </Box>
        ) : null}

        {message ? (
          <Box marginTop={1}>
            <Text color={message.startsWith('执行失败') ? '#f85149' : '#3fb950'}>{message}</Text>
          </Box>
        ) : null}
        {error ? <Text color="#f85149">{error}</Text> : null}
      </Box>
    </Layout>
  );
}
