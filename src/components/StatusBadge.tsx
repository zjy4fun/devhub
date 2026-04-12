import React from 'react';
import {Text} from 'ink';
import {THEME} from '../theme.js';

/**
 * Badge variants used across health check lists.
 */
export type StatusVariant = 'ok' | 'warn' | 'error' | 'info';

const COLORS: Record<StatusVariant, string> = {
  ok: THEME.success,
  warn: THEME.warning,
  error: THEME.danger,
  info: THEME.accent,
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
