import React, {useMemo, useState} from 'react';
import {Box, Text} from 'ink';
import {Layout} from '../../components/Layout.js';
import {MenuList} from '../../components/MenuList.js';
import {EditableField} from '../../components/EditableField.js';
import {runCommand} from '../../utils/shell.js';
import {TOOL_REGISTRY, type Tool} from './tool-registry.js';
import {BackButton} from '../../components/BackButton.js';

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
    <Layout title="DevHub — 工具安装" subtitle="📥 常用开发工具安装">
      {view === 'list' ? (
        <MenuList
          items={[...items, {label: '← 返回主菜单', value: 'back'}]}
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
            <Text>状态: 检测命令 ` {selectedTool.detect.command} `</Text>
            <Text color="#6e7681">── 安装方式 ────────────────────────</Text>
            {selectedTool.install.official.script ? <Text>{`官方安装脚本: ${selectedTool.install.official.script}`}</Text> : null}
            {selectedTool.install.official.brew ? <Text>{`Homebrew: ${selectedTool.install.official.brew}`}</Text> : null}
            {selectedTool.install.official.apt ? <Text>{`apt: ${selectedTool.install.official.apt}`}</Text> : null}
            {selectedTool.install.china?.script ? <Text>{`中国镜像: ${selectedTool.install.china.script}`}</Text> : null}
            {selectedTool.install.china?.mirror ? <Text>{`镜像地址: ${selectedTool.install.china.mirror}`}</Text> : null}
            {selectedTool.install.china?.note ? <Text color="#d29922">{selectedTool.install.china.note}</Text> : null}
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color="#6e7681">── 操作 ────────────────────────────</Text>
            <MenuList
              items={[
                {label: '复制安装命令到剪贴板', value: 'copy'},
                {label: '直接执行安装（官方）', value: 'official'},
                {label: '直接执行安装（中国镜像）', value: 'china'},
                {label: '← 返回工具列表', value: 'back'},
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
                  setMessage('该工具缺少对应安装命令。');
                  return;
                }

                if (value === 'copy') {
                  const copyShell =
                    process.platform === 'darwin'
                      ? `printf %s ${JSON.stringify(command)} | pbcopy`
                      : `printf %s ${JSON.stringify(command)} | (xclip -selection clipboard || wl-copy)`;
                  const copyResult = await runCommand('bash', ['-lc', copyShell], 4_000);
                  setMessage(copyResult.ok ? '安装命令已复制到剪贴板。' : `复制失败，请手动复制: ${command}`);
                  return;
                }

                const result = await runCommand('bash', ['-lc', command], 120_000);
                setMessage(result.ok ? result.stdout || '安装命令执行完成。' : result.stderr);
                setView('execute');
              }}
            />
          </Box>
        </Box>
      ) : null}

      {view === 'execute' ? (
        <Box flexDirection="column">
          <Text>{message || '(无输出)'}</Text>
          <BackButton />
        </Box>
      ) : null}

      {message && view !== 'execute' ? (
        <Box marginTop={1}>
          <Text color={message.includes('失败') ? '#f85149' : '#3fb950'}>{message}</Text>
        </Box>
      ) : null}
    </Layout>
  );
}
