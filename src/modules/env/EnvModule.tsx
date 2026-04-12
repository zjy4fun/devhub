import React, {useEffect, useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {ConfirmDialog} from '../../components/ConfirmDialog.js';
import {EditableField} from '../../components/EditableField.js';
import {BackButton} from '../../components/BackButton.js';
import {StatusBadge} from '../../components/StatusBadge.js';
import {prepareEnvChange, prepareEnvDoctorFix, type EnvPendingChange} from './env-actions.js';
import {loadEnvSummary, type EnvSummary} from './env-parser.js';
import {MutedText} from '../../components/MutedText.js';
import {THEME} from '../../theme.js';

type EnvView = 'menu' | 'search' | 'path' | 'doctor' | 'edit' | 'confirm' | 'raw';
type MessageTone = 'success' | 'error' | 'info';

/**
 * Masks sensitive values in default overview mode.
 */
function maskValue(key: string, value: string): string {
  if (!/(key|token|secret)/i.test(key)) {
    return value;
  }

  if (value.length <= 10) {
    return `${value.slice(0, 3)}***`;
  }

  return `${value.slice(0, 6)}***${value.slice(-3)}`;
}

/**
 * Environment variable inspection and editing screen.
 */
export function EnvModule({onBack}: {readonly onBack: () => void}) {
  const [summary, setSummary] = useState<EnvSummary | null>(null);
  const [view, setView] = useState<EnvView>('menu');
  const [pending, setPending] = useState<EnvPendingChange | null>(null);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<MessageTone>('success');
  const [query, setQuery] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(true);

  const showMessage = (text: string, tone: MessageTone = 'success') => {
    setMessage(text);
    setMessageTone(tone);
  };

  useInput((input, key) => {
    if (key.tab) {
      setShowSecrets((current) => !current);
    }
  });

  const refresh = async () => {
    setLoading(true);
    setSummary(await loadEnvSummary());
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const effectiveEntries = useMemo(
    () => (summary ? Array.from(summary.effectiveMap.values()).sort((left, right) => left.key.localeCompare(right.key)) : []),
    [summary],
  );
  const pathEntries = useMemo(
    () => (summary ? summary.entries.filter((entry) => entry.key === 'PATH') : []),
    [summary],
  );
  const pathIssueMap = useMemo(() => {
    if (!summary) {
      return new Map<string, EnvSummary['pathIssues'][number]>();
    }

    return new Map(summary.pathIssues.map((issue) => [`${issue.entry.file}:${issue.entry.line}:${issue.segment}`, issue]));
  }, [summary]);
  const searchMatches = useMemo(() => {
    if (!summary || !query) {
      return [];
    }

    return summary.entries.filter((entry) => entry.key.toLowerCase().includes(query.toLowerCase()));
  }, [summary, query]);

  if (loading || !summary) {
    return (
      <Layout title="DevHub — Environment Variables" subtitle="🔑 Environment Variable Management">
        <Text color={THEME.accent}>Loading environment variable config...</Text>
      </Layout>
    );
  }

  const messageColor = messageTone === 'error' ? THEME.danger : messageTone === 'info' ? THEME.accent : THEME.success;

  return (
    <Layout title="DevHub — Environment Variables" subtitle="🔑 Environment Variable Management">
      <MutedText>── Detected Shell Config Files ────────────</MutedText>
      {summary.files.map((file) => (
        <Text key={file.path} dimColor={!file.exists}>
          {`${file.exists ? '✓' : ' '} ${file.path}${file.note ? `  ${file.note}` : ''}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <MutedText>── Environment Overview ──────────────────────</MutedText>
        {effectiveEntries.slice(0, 8).map((entry) => (
          <Text key={`${entry.key}-${entry.file}-${entry.line}`}>
            {`${entry.key.padEnd(20)} = ${showSecrets ? entry.value : maskValue(entry.key, entry.value)}  ← ${entry.file}:${entry.line}`}
          </Text>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <MutedText>── Health Check ──────────────────────────</MutedText>
        {summary.health.length === 0 ? (
          <Box>
            <StatusBadge variant="ok" />
            <Text> No issues detected</Text>
          </Box>
        ) : (
          summary.health.map((item, index) => (
            <Box key={`${item.status}-${item.message}-${index}`}>
              <StatusBadge variant={item.status} />
              <Text>{` ${item.message}`}</Text>
            </Box>
          ))
        )}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <MutedText>── Actions ──────────────────────────────</MutedText>
        {view === 'menu' ? (
          <MenuList
            items={[
              {label: 'Search variables (trace by variable name)', value: 'search'},
              {label: 'View PATH details', value: 'path'},
              {
                label: 'Doctor fix (safe remediation)',
                value: 'doctor',
                description:
                  summary.doctorFixes.length > 0
                    ? `${summary.doctorFixes.length} fix${summary.doctorFixes.length === 1 ? '' : 'es'} available`
                    : 'No safe fixes available right now',
              },
              {label: 'Add a new environment variable', value: 'add'},
              {label: 'Edit an existing variable', value: 'edit'},
              {label: 'Check duplicate definitions', value: 'dupes'},
              {label: 'View raw files', value: 'raw'},
              {label: '← Back to main menu', value: 'back'},
            ]}
            onSelect={(value) => {
              if (value === 'back') {
                onBack();
                return;
              }

              if (value === 'dupes') {
                setQuery(summary.duplicateIssues[0]?.key ?? '');
                setView('search');
                return;
              }

              if (value === 'doctor') {
                if (summary.doctorFixes.length === 0) {
                  showMessage('No safe doctor fixes available. Review the warnings manually.', 'info');
                  return;
                }

                setView('doctor');
                return;
              }

              setView(value === 'add' || value === 'edit' ? 'edit' : (value as EnvView));
            }}
          />
        ) : null}

        {view === 'search' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField label="Enter variable name" placeholder="OPENAI_API_KEY" defaultValue={query} onSubmit={setQuery} />
            {searchMatches.map((entry) => (
              <Text key={`${entry.key}-${entry.file}-${entry.line}`}>
                {`${entry.key} = ${showSecrets ? entry.value : maskValue(entry.key, entry.value)}  ← ${entry.file}:${entry.line}`}
              </Text>
            ))}
            {query && searchMatches.length === 0 ? <MutedText>No matching variable found</MutedText> : null}
            <BackButton />
          </Box>
        ) : null}

        {view === 'path' ? (
          <Box flexDirection="column" gap={1}>
            {pathEntries.length === 0 ? <MutedText>No PATH exports found in the scanned files</MutedText> : null}
            {pathEntries.map((entry) => (
              <Box key={`${entry.file}-${entry.line}`} flexDirection="column">
                <MutedText>{`${entry.file}:${entry.line}`}</MutedText>
                {entry.value
                  .split(':')
                  .map((segment) => segment.trim())
                  .filter(Boolean)
                  .map((segment, index) => {
                    const issue = pathIssueMap.get(`${entry.file}:${entry.line}:${segment}`);
                    const color =
                      issue?.kind === 'missing-path'
                        ? THEME.danger
                        : issue?.kind === 'unresolved-path'
                          ? THEME.warning
                          : undefined;
                    const detail =
                      issue?.kind === 'missing-path' && issue.resolvedSegment && issue.resolvedSegment !== segment
                        ? `  → ${issue.resolvedSegment}`
                        : issue?.kind === 'unresolved-path'
                          ? '  (unresolved reference)'
                          : '';

                    return (
                      <Text key={`${entry.file}-${entry.line}-${segment}-${index}`} color={color}>
                        {`${segment}${detail}`}
                      </Text>
                    );
                  })}
              </Box>
            ))}
            <BackButton />
          </Box>
        ) : null}

        {view === 'doctor' ? (
          <Box flexDirection="column" gap={1}>
            <MutedText>Doctor fix only offers deterministic edits and still shows a diff before writing.</MutedText>
            <MenuList
              items={[
                ...summary.doctorFixes.map((fix) => ({
                  label: fix.title,
                  value: fix.id,
                  description: fix.description,
                })),
                {label: '← Back to actions', value: 'back'},
              ]}
              onSelect={async (value) => {
                if (value === 'back') {
                  setView('menu');
                  return;
                }

                try {
                  setPending(await prepareEnvDoctorFix(summary, value));
                  setView('confirm');
                } catch (error) {
                  showMessage(error instanceof Error ? error.message : 'Failed to prepare doctor fix.', 'error');
                  setView('menu');
                }
              }}
            />
          </Box>
        ) : null}

        {view === 'edit' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Enter file,key,value, e.g. ~/.zshrc,OPENAI_API_KEY,sk-..."
              placeholder="~/.zshrc,EDITOR,code --wait"
              onSubmit={async (value) => {
                const [filePath, key, nextValue] = value.split(',').map((part) => part.trim());
                if (!filePath || !key || !nextValue) {
                  showMessage('Please enter file, key, and value.', 'error');
                  return;
                }

                setPending(await prepareEnvChange(filePath, key, nextValue));
                setView('confirm');
              }}
            />
            <MutedText>After editing, re-source the shell file or restart the terminal.</MutedText>
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
              await pending.execute();
              showMessage('Environment variable config updated. Run source or reopen the terminal.');
              setPending(null);
              setView('menu');
              await refresh();
            }}
          />
        ) : null}

        {view === 'raw' ? (
          <Box flexDirection="column">
            {summary.files
              .filter((file) => file.exists)
              .map((file) => (
                <Text key={file.path}>{file.path}</Text>
              ))}
            <BackButton />
          </Box>
        ) : null}
      </Box>

      {message ? (
        <Box marginTop={1}>
          <Text color={messageColor}>{message}</Text>
        </Box>
      ) : null}
      <MutedText>Tab toggles sensitive values on/off</MutedText>
    </Layout>
  );
}
