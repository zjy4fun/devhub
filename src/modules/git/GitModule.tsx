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
      <Layout title="DevHub — Git Config" subtitle="📦 Git Config    ~/.gitconfig">
        <Text color="#58a6ff">Loading Git config...</Text>
      </Layout>
    );
  }

  const actions = [
    {label: 'Edit username/email', value: 'identity'},
    {label: 'Edit default editor', value: 'editor'},
    {label: 'Edit default branch name', value: 'branch'},
    {label: 'Set common aliases', value: 'alias'},
    {label: 'Set pull strategy', value: 'pull'},
    {label: 'View full config (raw)', value: 'raw'},
    {label: '← Back to main menu', value: 'back'},
  ] as const;

  const submitSingleChange = async (key: string, currentValue: string, nextValue: string) => {
    setPending(await prepareGitConfigChange(key, currentValue, nextValue));
    setView('confirm');
  };

  return (
    <Layout title="DevHub — Git Config" subtitle="📦 Git Config    ~/.gitconfig">
      <Text color="#6e7681">── Current Config Preview ──────────────────────</Text>
      <KeyValue label="Username" value={overview.userName} muted={overview.userName === '(not set)'} />
      <KeyValue label="Email" value={overview.userEmail} muted={overview.userEmail === '(not set)'} />
      <KeyValue label="Default Editor" value={overview.defaultEditor} muted={overview.defaultEditor === '(not set)'} />
      <KeyValue label="Default Branch" value={overview.defaultBranch} muted={overview.defaultBranch === '(not set)'} />
      <KeyValue label="Pull Strategy" value={overview.pullStrategy} muted={overview.pullStrategy === '(not set)'} />
      <KeyValue label="Credential Helper" value={overview.credentialHelper} muted={overview.credentialHelper === '(not set)'} />

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
              label={`Current username: ${overview.userName}`}
              defaultValue={summary.globalConfig.user?.name}
              placeholder="New Git username"
              onSubmit={(value) => void submitSingleChange('user.name', summary.globalConfig.user?.name ?? '', value)}
            />
            <EditableField
              label={`Current email: ${overview.userEmail}`}
              defaultValue={summary.globalConfig.user?.email}
              placeholder="New Git email"
              onSubmit={(value) => void submitSingleChange('user.email', summary.globalConfig.user?.email ?? '', value)}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit' && selectedAction === 'editor' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`Current default editor: ${overview.defaultEditor}`}
              defaultValue={summary.globalConfig.core?.editor}
              placeholder="e.g. code --wait"
              onSubmit={(value) => void submitSingleChange('core.editor', summary.globalConfig.core?.editor ?? '', value)}
            />
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit' && selectedAction === 'branch' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label={`Current default branch: ${overview.defaultBranch}`}
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
              label={`Current pull strategy: ${overview.pullStrategy}`}
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
              setMessage(result.ok ? result.stdout || 'Updated successfully.' : `Failed: ${result.stderr}`);
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
            <Text color={message.startsWith('Failed') ? '#f85149' : '#3fb950'}>{message}</Text>
          </Box>
        ) : null}
        {error ? <Text color="#f85149">{error}</Text> : null}
      </Box>
    </Layout>
  );
}
