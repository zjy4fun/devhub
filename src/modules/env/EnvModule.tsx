import React, {useEffect, useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {ConfirmDialog} from '../../components/ConfirmDialog.js';
import {EditableField} from '../../components/EditableField.js';
import {BackButton} from '../../components/BackButton.js';
import {StatusBadge} from '../../components/StatusBadge.js';
import {prepareEnvChange, type EnvPendingChange} from './env-actions.js';
import {loadEnvSummary, type EnvSummary} from './env-parser.js';

type EnvView = 'menu' | 'search' | 'path' | 'edit' | 'confirm' | 'raw';

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
  const [query, setQuery] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(true);

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
  const searchMatches = useMemo(() => {
    if (!summary || !query) {
      return [];
    }

    return summary.entries.filter((entry) => entry.key.toLowerCase().includes(query.toLowerCase()));
  }, [summary, query]);

  if (loading || !summary) {
    return (
      <Layout title="DevHub — Environment Variables" subtitle="🔑 Environment Variable Management">
        <Text color="#58a6ff">Loading environment variable config...</Text>
      </Layout>
    );
  }

  return (
    <Layout title="DevHub — Environment Variables" subtitle="🔑 Environment Variable Management">
      <Text color="#6e7681">── Detected Shell Config Files ────────────</Text>
      {summary.files.map((file) => (
        <Text key={file.path} color={file.exists ? '#f0f6fc' : '#6e7681'}>
          {`${file.exists ? '✓' : ' '} ${file.path}${file.note ? `  ${file.note}` : ''}`}
        </Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── Environment Overview ──────────────────────</Text>
        {effectiveEntries.slice(0, 8).map((entry) => (
          <Text key={`${entry.key}-${entry.file}-${entry.line}`}>
            {`${entry.key.padEnd(20)} = ${showSecrets ? entry.value : maskValue(entry.key, entry.value)}  ← ${entry.file}:${entry.line}`}
          </Text>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── Health Check ──────────────────────────</Text>
        {summary.duplicates.map((key) => (
          <Box key={`duplicate-${key}`}>
            <StatusBadge variant="warn" />
            <Text>{` ${key} defined multiple times`}</Text>
          </Box>
        ))}
        {summary.missingPathEntries.map((entry) => (
          <Box key={`missing-path-${entry}`}>
            <StatusBadge variant="warn" />
            <Text>{` PATH includes a missing directory: ${entry}`}</Text>
          </Box>
        ))}
        {summary.effectiveMap.get('EDITOR') ? (
          <Box>
            <StatusBadge variant="ok" />
            <Text> EDITOR is set</Text>
          </Box>
        ) : (
          <Box>
            <StatusBadge variant="warn" />
            <Text> EDITOR is not set</Text>
          </Box>
        )}
        {summary.effectiveMap.get('LANG')?.value === 'en_US.UTF-8' ? (
          <Box>
            <StatusBadge variant="ok" />
            <Text> LANG is set to en_US.UTF-8</Text>
          </Box>
        ) : null}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color="#6e7681">── Actions ──────────────────────────────</Text>
        {view === 'menu' ? (
          <MenuList
            items={[
              {label: 'Search variables (trace by variable name)', value: 'search'},
              {label: 'View PATH details', value: 'path'},
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
                setQuery(summary.duplicates[0] ?? '');
                setView('search');
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
            {query && searchMatches.length === 0 ? <Text color="#6e7681">No matching variable found</Text> : null}
            <BackButton />
          </Box>
        ) : null}

        {view === 'path' ? (
          <Box flexDirection="column">
            {(summary.effectiveMap.get('PATH')?.value ?? process.env.PATH ?? '')
              .split(':')
              .filter(Boolean)
              .map((segment: string, index) => (
                <Text key={`${segment}-${index}`} color={summary.missingPathEntries.includes(segment) ? '#f85149' : '#f0f6fc'}>
                  {segment}
                </Text>
              ))}
            <BackButton />
          </Box>
        ) : null}

        {view === 'edit' ? (
          <Box flexDirection="column" gap={1}>
            <EditableField
              label="Enter file,key,value, e.g. ~/.zshrc,OPENAI_API_KEY,sk-..."
              placeholder="~/.zshrc,EDITOR,code"
              onSubmit={async (value) => {
                const [filePath, key, nextValue] = value.split(',').map((part) => part.trim());
                if (!filePath || !key || !nextValue) {
                  setMessage('Please enter file, key, and value.');
                  return;
                }

                setPending(await prepareEnvChange(filePath, key, nextValue));
                setView('confirm');
              }}
            />
            <Text color="#6e7681">After editing, re-source the shell file or restart the terminal.</Text>
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
              setMessage('Environment variable file updated. Run source or reopen the terminal.');
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
          <Text color="#3fb950">{message}</Text>
        </Box>
      ) : null}
      <Text color="#6e7681">Tab toggles sensitive values on/off</Text>
    </Layout>
  );
}
