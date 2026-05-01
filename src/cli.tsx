#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';
import { PKG_VERSION } from './version.js';
import { HELP_TEXT } from './help-text.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(HELP_TEXT);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  process.stdout.write(`${PKG_VERSION}\n`);
  process.exit(0);
}

render(<App />);
