import React from 'react';
import {Box, Text, useInput} from 'ink';
import {THEME} from '../theme.js';

/**
 * Confirmation dialog that requires explicit user approval.
 */
export function ConfirmDialog({
  title,
  diff,
  onConfirm,
  onCancel,
}: {
  readonly title: string;
  readonly diff: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  useInput((input, key) => {
    if (input.toLowerCase() === 'y' || key.return) {
      onConfirm();
    }

    if (input.toLowerCase() === 'n' || key.escape) {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={THEME.selected} paddingX={1}>
      <Text color={THEME.selected}>{title}</Text>
      <Box marginTop={1}>
        <Text>{diff}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={THEME.warning}>Press `y` / `Enter` to confirm, `n` / `Esc` to cancel</Text>
      </Box>
    </Box>
  );
}
