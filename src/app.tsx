import React, {useState} from 'react';
import {Text, useApp, useInput} from 'ink';
import {Layout} from './components/Layout.js';
import {MenuList} from './components/MenuList.js';
import {GitModule} from './modules/git/GitModule.js';
import {SSHModule} from './modules/ssh/SSHModule.js';
import {EnvModule} from './modules/env/EnvModule.js';
import {NodeModule} from './modules/node/NodeModule.js';
import {ToolsModule} from './modules/tools/ToolsModule.js';
import {MutedText} from './components/MutedText.js';

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
    <Layout title="DevHub — Development Environment Manager" subtitle="Select a module to manage:">
      <MenuList
        items={[
          {label: '📦 Git Config', value: 'git', description: 'Manage ~/.gitconfig'},
          {label: '🔐 SSH Config', value: 'ssh', description: 'SSH key & host management'},
          {label: '🔑 Environment Variables', value: 'env', description: 'Shell variable provenance'},
          {label: '💚 Node.js Ecosystem', value: 'node', description: 'Node/npm/nvm/pnpm'},
          {label: '📥 Tool Installation', value: 'tools', description: 'Common dev tools + China mirrors'},
        ]}
        onSelect={(value) => setRoute(value as Route)}
      />
      <MutedText>↑↓ Navigate  ⏎ Open  q Quit</MutedText>
    </Layout>
  );
}
