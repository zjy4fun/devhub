import React from 'react';
import {readFileSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {Box, Text} from 'ink';
import {getPlatformLabel} from '../utils/platform.js';
import {MutedText} from './MutedText.js';
import {THEME} from '../theme.js';

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
      <Box flexDirection="column" borderStyle="round" borderColor={THEME.accent} paddingX={1}>
        <Text color={THEME.accent}>{`🛠  ${title}`}</Text>
        <MutedText>{`v${version}         ${getPlatformLabel()}`}</MutedText>
      </Box>
      {subtitle ? (
        <Box marginTop={1}>
          <Text>{subtitle}</Text>
        </Box>
      ) : null}
      <Box flexDirection="column" marginTop={1}>
        {children}
      </Box>
      <Box marginTop={1}>
        {footer ?? <MutedText>q Quit  Esc Back  Ctrl+C Force exit</MutedText>}
      </Box>
    </Box>
  );
}
