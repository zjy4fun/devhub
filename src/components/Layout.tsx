import React from 'react';
import {readFileSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {Box, Text} from 'ink';
import {getPlatformLabel} from '../utils/platform.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const {version} = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {version: string};

/**
 * Shared application layout with header, content, and footer instructions.
 */
export function Layout({
  title,
  subtitle,
  children,
  footer,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
}) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Box flexDirection="column" borderStyle="round" borderColor="#58a6ff" paddingX={1}>
        <Text color="#58a6ff">{`🛠  ${title}`}</Text>
        <Text color="#6e7681">{`v${version}         ${getPlatformLabel()}`}</Text>
      </Box>
      {subtitle ? (
        <Box marginTop={1}>
          <Text color="#f0f6fc">{subtitle}</Text>
        </Box>
      ) : null}
      <Box flexDirection="column" marginTop={1}>
        {children}
      </Box>
      <Box marginTop={1}>
        {footer ?? <Text color="#6e7681">q Quit  Esc Back  Ctrl+C Force exit</Text>}
      </Box>
    </Box>
  );
}
