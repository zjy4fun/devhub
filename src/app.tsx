import React, {useEffect, useState} from 'react';
import {Text, useApp, useInput} from 'ink';
import {Layout} from './components/Layout.js';
import {MenuList} from './components/MenuList.js';
import {GitModule} from './modules/git/GitModule.js';
import {SSHModule} from './modules/ssh/SSHModule.js';
import {EnvModule} from './modules/env/EnvModule.js';
import {NodeModule} from './modules/node/NodeModule.js';
import {ToolsModule} from './modules/tools/ToolsModule.js';

type Route = 'main' | 'git' | 'ssh' | 'env' | 'node' | 'tools';

/**
 * Root application component handling top-level routing.
 */
export function App() {
  const [route, setRoute] = useState<Route>('main');
  const {exit} = useApp();

  useInput((input, key) => {
    if (route === 'main' && (input === 'q' || key.escape)) {
      exit();
      return;
    }

    if (route !== 'main' && (input === 'q' || key.escape)) {
      setRoute('main');
    }
  });

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    process.stdout.write('\x1Bc');
  }, [route]);

  if (route === 'git') {
    return <GitModule onBack={() => setRoute('main')} />;
  }

  if (route === 'ssh') {
    return <SSHModule onBack={() => setRoute('main')} />;
  }

  if (route === 'env') {
    return <EnvModule onBack={() => setRoute('main')} />;
  }

  if (route === 'node') {
    return <NodeModule onBack={() => setRoute('main')} />;
  }

  if (route === 'tools') {
    return <ToolsModule onBack={() => setRoute('main')} />;
  }

  return (
    <Layout title="DevHub — 开发环境配置管理" subtitle="请选择要管理的配置：">
      <MenuList
        items={[
          {label: '📦 Git 配置', value: 'git', description: '~/.gitconfig 管理'},
          {label: '🔐 SSH 配置', value: 'ssh', description: '密钥与主机管理'},
          {label: '🔑 环境变量', value: 'env', description: 'Shell 变量溯源'},
          {label: '💚 Node.js 生态', value: 'node', description: 'Node/npm/nvm/pnpm'},
          {label: '📥 工具安装', value: 'tools', description: '常用开发工具 + 中国镜像'},
        ]}
        onSelect={(value) => setRoute(value as Route)}
      />
      <Text color="#6e7681">↑↓ 导航  ⏎ 进入  q 退出</Text>
    </Layout>
  );
}
