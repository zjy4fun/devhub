import React from 'react';
import {Box, Text, useInput} from 'ink';

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
    <Box flexDirection="column" borderStyle="round" borderColor="#bc8cff" paddingX={1}>
      <Text color="#bc8cff">{title}</Text>
      <Box marginTop={1}>
        <Text>{diff}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="#d29922">按 `y` / `Enter` 确认，按 `n` / `Esc` 取消</Text>
      </Box>
    </Box>
  );
}
