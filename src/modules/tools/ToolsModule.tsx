import React, {useMemo, useState} from 'react';
import {Box, Text} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {EditableField} from '../../components/EditableField.js';
import {runCommand} from '../../utils/shell.js';
import {TOOL_REGISTRY, type Tool} from './tool-registry.js';
import {BackButton} from '../../components/BackButton.js';
import {MutedText} from '../../components/MutedText.js';
import {THEME} from '../../theme.js';

type ToolView = 'list' | 'detail' | 'execute';

/**
 * Developer tools install guide and executor.
 */
export function ToolsModule({onBack}: {readonly onBack: () => void}) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [view, setView] = useState<ToolView>('list');
  const [message, setMessage] = useState('');

  const items = useMemo(
    () =>
      TOOL_REGISTRY.map((tool) => ({
        label: `${tool.name}          ${tool.description}`,
        value: tool.id,
      })),
    [],
  );

  return (
    <Layout title="DevHub — Tool Installation" subtitle="📥 Common Developer Tool Installation">
      {view === 'list' ? (
        <MenuList
          items={[...items, {label: '← Back to main menu', value: 'back'}]}
          onSelect={(value) => {
            if (value === 'back') {
              onBack();
              return;
            }

            const nextTool = TOOL_REGISTRY.find((tool) => tool.id === value) ?? null;
            setSelectedTool(nextTool);
            setView('detail');
          }}
        />
      ) : null}

      {view === 'detail' && selectedTool ? (
        <Box flexDirection="column">
          <Text>{`📥 ${selectedTool.name} — ${selectedTool.description}`}</Text>
          <Box marginTop={1} flexDirection="column">
            <Text>Status: probe command ` {selectedTool.detect.command} `</Text>
            <MutedText>── Installation Methods ────────────────────────</MutedText>
            {selectedTool.install.official.script ? <Text>{`Official install script: ${selectedTool.install.official.script}`}</Text> : null}
            {selectedTool.install.official.brew ? <Text>{`Homebrew: ${selectedTool.install.official.brew}`}</Text> : null}
            {selectedTool.install.official.apt ? <Text>{`apt: ${selectedTool.install.official.apt}`}</Text> : null}
            {selectedTool.install.china?.script ? <Text>{`China mirror: ${selectedTool.install.china.script}`}</Text> : null}
            {selectedTool.install.china?.mirror ? <Text>{`Mirror URL: ${selectedTool.install.china.mirror}`}</Text> : null}
            {selectedTool.install.china?.note ? <Text color={THEME.warning}>{selectedTool.install.china.note}</Text> : null}
          </Box>
          <Box marginTop={1} flexDirection="column">
            <MutedText>── Actions ────────────────────────────</MutedText>
            <MenuList
              items={[
                {label: 'Copy install command to clipboard', value: 'copy'},
                {label: 'Run install directly (official)', value: 'official'},
                ...(selectedTool.install.china?.script || selectedTool.install.china?.mirror
                  ? [{label: 'Run install directly (China mirror)', value: 'china'}]
                  : []),
                {label: '← Back to tool list', value: 'back'},
              ]}
              onSelect={async (value) => {
                if (value === 'back') {
                  setView('list');
                  return;
                }

                const officialCommand =
                  selectedTool.install.official.script ?? selectedTool.install.official.brew ?? selectedTool.install.official.apt ?? '';
                const chinaCommand = selectedTool.install.china?.script ?? selectedTool.install.china?.mirror ?? '';
                const command = value === 'china' ? chinaCommand : officialCommand || chinaCommand;

                if (!command) {
                  setMessage('This tool does not have a matching install command.');
                  return;
                }

                if (value === 'copy') {
                  const copyShell =
                    process.platform === 'darwin'
                      ? `printf %s ${JSON.stringify(command)} | pbcopy`
                      : `printf %s ${JSON.stringify(command)} | (xclip -selection clipboard || wl-copy)`;
                  const copyResult = await runCommand('bash', ['-lc', copyShell], 4_000);
                  setMessage(copyResult.ok ? 'Install command copied to clipboard.' : `Copy failed, please copy manually: ${command}`);
                  return;
                }

                const result = await runCommand('bash', ['-lc', command], 120_000);
                setMessage(result.ok ? result.stdout || 'Install command finished.' : result.stderr);
                setView('execute');
              }}
            />
          </Box>
        </Box>
      ) : null}

      {view === 'execute' ? (
        <Box flexDirection="column">
          <Text>{message || '(no output)'}</Text>
          <BackButton />
        </Box>
      ) : null}

      {message && view !== 'execute' ? (
        <Box marginTop={1}>
          <Text color={message.includes('failed') ? THEME.danger : THEME.success}>{message}</Text>
        </Box>
      ) : null}
    </Layout>
  );
}
