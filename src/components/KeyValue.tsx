import React from 'react';
import {Box, Text} from 'ink';

/**
 * Displays a single aligned key/value row.
 */
export function KeyValue({
  label,
  value,
  muted,
}: {
  readonly label: string;
  readonly value: string;
  readonly muted?: boolean;
}) {
  return (
    <Box>
      <Box width={18}>
        <Text color="#c9d1d9">{label}</Text>
      </Box>
      <Text color={muted ? '#6e7681' : '#f0f6fc'}>{value}</Text>
    </Box>
  );
}
