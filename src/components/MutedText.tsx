import React from 'react';
import {Text, type TextProps} from 'ink';

/**
 * Uses the terminal's default foreground color with reduced emphasis.
 */
export function MutedText(props: TextProps) {
  return <Text dimColor {...props} />;
}
