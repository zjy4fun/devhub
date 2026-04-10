import React from 'react';
import {Text} from 'ink';

/**
 * Badge variants used across health check lists.
 */
export type StatusVariant = 'ok' | 'warn' | 'error' | 'info';

const COLORS: Record<StatusVariant, string> = {
  ok: '#3fb950',
  warn: '#d29922',
  error: '#f85149',
  info: '#58a6ff',
};

const LABELS: Record<StatusVariant, string> = {
  ok: '✓',
  warn: '⚠',
  error: '✗',
  info: '•',
};

/**
 * Renders a compact colored status badge.
 */
export function StatusBadge({variant, label}: {readonly variant: StatusVariant; readonly label?: string}) {
  return <Text color={COLORS[variant]}>{label ?? LABELS[variant]}</Text>;
}
