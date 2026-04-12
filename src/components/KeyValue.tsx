import React from 'react';
import {Box, Text} from 'ink';
import {MutedText} from './MutedText.js';

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
        <MutedText>{label}</MutedText>
      </Box>
      {muted ? <MutedText>{value}</MutedText> : <Text>{value}</Text>}
    </Box>
  );
}
