import React, { useState, useCallback } from 'react';
import { useApp, useInput } from 'ink';
import { Layout } from './components/Layout.js';
import { MenuList } from './components/MenuList.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { GitModule } from './modules/git/GitModule.js';
import { SSHModule } from './modules/ssh/SSHModule.js';
import { EnvModule } from './modules/env/EnvModule.js';
import { NodeModule } from './modules/node/NodeModule.js';
import { ToolsModule } from './modules/tools/ToolsModule.js';
import { MutedText } from './components/MutedText.js';

type Route = 'main' | 'git' | 'ssh' | 'env' | 'node' | 'tools';

const MODULE_ROUTES: Record<string, React.ComponentType<{ readonly onBack: () => void }>> = {
  git: GitModule,
  ssh: SSHModule,
  env: EnvModule,
  node: NodeModule,
  tools: ToolsModule,
};

/**
 * Root application component handling top-level routing.
 */
export function App() {
  const [route, setRoute] = useState<Route>('main');
  const { exit } = useApp();

  const goBack = useCallback(() => setRoute('main'), []);

  useInput((input, key) => {
    if (route === 'main' && (input === 'q' || key.escape)) {
      exit();
      return;
    }

    if (route !== 'main' && (input === 'q' || key.escape)) {
      setRoute('main');
    }
  });

  if (route !== 'main') {
    const ModuleComponent = MODULE_ROUTES[route];
    if (ModuleComponent) {
      return (
        <ErrorBoundary>
          <ModuleComponent onBack={goBack} />
        </ErrorBoundary>
      );
    }
  }

  return (
    <Layout title="DevHub — Development Environment Manager" subtitle="Select a module to manage:">
      <MenuList
        items={[
          { label: '📦 Git Config', value: 'git', description: 'Manage ~/.gitconfig' },
          { label: '🔐 SSH Config', value: 'ssh', description: 'SSH key & host management' },
          { label: '🔑 Environment Variables', value: 'env', description: 'Shell variable provenance' },
          { label: '💚 Node.js Ecosystem', value: 'node', description: 'Node/npm/nvm/pnpm' },
          { label: '📥 Tool Installation', value: 'tools', description: 'Common dev tools + China mirrors' },
        ]}
        onSelect={(value) => setRoute(value as Route)}
      />
      <MutedText>↑↓ Navigate ⏎ Open q Quit</MutedText>
    </Layout>
  );
}
