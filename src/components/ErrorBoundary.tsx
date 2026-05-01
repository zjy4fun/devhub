import React from 'react';
import {Box, Text} from 'ink';
import {THEME} from '../theme.js';

interface Props {
  readonly children: React.ReactNode;
  readonly onReset?: () => void;
}

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
}

/**
 * Ink-compatible error boundary that prevents a single module crash
 * from taking down the entire TUI.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[DevHub ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box flexDirection="column" paddingX={1}>
          <Box flexDirection="column" borderStyle="round" borderColor={THEME.danger} paddingX={1}>
            <Text color={THEME.danger}>⚠ Something went wrong</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color={THEME.danger}>{this.state.error?.message ?? 'Unknown error'}</Text>
            <Box marginTop={1}>
              <Text dimColor>Press `r` to retry, or `q` / `Esc` to go back.</Text>
            </Box>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
