#!/usr/bin/env node
import React from 'react';
import {readFileSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {render} from 'ink';
import {App} from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_VERSION = (JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {version: string}).version;

const HELP_TEXT = `
DevHub — Developer Environment Configuration Manager
=====================================================

A terminal UI (TUI) tool that inspects, health-checks, and manages your local
developer environment from a single entry point.

USAGE
  devhub              Launch the interactive TUI
  devhub --help       Show this help message
  devhub --version    Show version number

INSTALL
  npx @zjy4fun/devhub                Run without installing
  pnpm add -g @zjy4fun/devhub        Install globally
  npm  install -g @zjy4fun/devhub     Install globally (npm)

MODULES
  DevHub organizes configuration management into five modules,
  each accessible from the main menu:

  📦 Git Config ─────────────────────────────────────────────
     Reads:    ~/.gitconfig, .git/config (local)
     Shows:    user.name, user.email, default editor, default branch,
               pull strategy, credential helper
     Checks:   user.name/email set, init.defaultBranch = main,
               core.autocrlf configured, pull.rebase set,
               GPG/SSH signing detected
     Actions:  Edit username/email, editor, default branch,
               set common aliases (st/co/br/lg), set pull strategy,
               view raw config
     Writes:   via \`git config --global <key> <value>\` (never edits files directly)

  🔐 SSH Config ─────────────────────────────────────────────
     Reads:    ~/.ssh/config, ~/.ssh/* (key files)
     Shows:    Key list (type, agent status, file permissions),
               Host config (host → user@hostname:port + IdentityFile)
     Checks:   ~/.ssh dir mode 700, config mode 600, private key mode 600,
               keys loaded in ssh-agent, IdentityFile references exist
     Actions:  Generate new key pair (ed25519), add key to ssh-agent,
               add/edit Host config block, test host connection (ssh -T),
               fix file permissions (chmod batch), view raw config
     Writes:   ssh-keygen, ssh-add, chmod, append to ~/.ssh/config

  🔑 Environment Variables ──────────────────────────────────
     Reads:    Shell rc files based on current $SHELL:
               zsh:  ~/.zshenv → ~/.zprofile → ~/.zshrc → ~/.zlogin
               bash: ~/.bash_profile → ~/.bashrc → ~/.profile
               fish: ~/.config/fish/config.fish
               Also: .env in current directory
     Shows:    Detected shell files (with existence status),
               effective variable values with source file:line,
               sensitive values masked (Tab to toggle)
     Checks:   Duplicate variable definitions across files,
               PATH segments that point to non-existent directories
               or use unresolved references,
               EDITOR set, LANG = en_US.UTF-8
     Actions:  Search/trace any variable by name (provenance),
               view PATH breakdown, run doctor fix for safe remediations,
               add/edit variables, check duplicate definitions,
               view raw files
     Writes:   Modifies export lines in shell rc files (with diff preview)

  💚 Node.js Ecosystem ──────────────────────────────────────
     Reads:    node, npm, pnpm, yarn, bun, nvm, fnm (version probes),
               \`which node\` (source detection), \`npm config get registry\`,
               ~/.npmrc
     Shows:    Binary versions and install status,
               Node source (nvm vs system), npm registry, npm config
     Checks:   Node.js >= 18, nvm installed, npm registry source,
               yarn installed
     Actions:  Switch npm registry (official ↔ China mirror),
               install Node via nvm, install pnpm/yarn/bun,
               view globally installed packages, clear npm cache
     Writes:   \`npm config set registry <url>\`,
               \`npm install -g <pkg>\`, \`npm cache clean --force\`

  📥 Tool Installation ──────────────────────────────────────
     Shows:    22+ common developer tools with install status
     Tools:    nvm, fnm, pyenv, rbenv, Homebrew, pnpm, bun,
               git, curl, wget, jq, fzf, ripgrep, bat, eza,
               zoxide, starship, tmux, neovim, lazygit, lazydocker,
               Claude Code
     Each:     Detection command, official install (script/brew/apt),
               China mirror install when available
     Actions:  Copy install command to clipboard,
               run install directly (official or China mirror)
     Mirrors:  npm (npmmirror.com), Homebrew (Tsinghua),
               pip (Tsinghua), rustup (rsproxy.cn),
               Go (golang.google.cn / goproxy.cn),
               nvm (Gitee), GitHub Release (ghproxy.com)

KEYBOARD SHORTCUTS
  ↑ / ↓ or j / k    Navigate menu items
  Enter              Select / confirm
  q or Esc           Go back / quit
  /                  Search in menu lists
  Tab                Toggle sensitive value visibility (env module)
  Ctrl+C             Force quit

CONFIG FILES MANAGED
  ~/.gitconfig                          Git global config
  .git/config                           Git local config (read-only)
  ~/.ssh/config                         SSH client config
  ~/.ssh/id_*                           SSH key files
  ~/.zshrc, ~/.zshenv, ~/.zprofile      Zsh shell configs
  ~/.bash_profile, ~/.bashrc            Bash shell configs
  ~/.config/fish/config.fish            Fish shell config
  .env                                  Local environment file
  ~/.npmrc                              npm configuration

SAFETY
  - All file modifications show a before/after diff preview
  - User must confirm (y/Enter) before any write operation
  - Git config changes use \`git config\` commands, never direct file edits
  - Sensitive values (API keys, tokens) are masked by default
  - SSH permission fixes use standard chmod (700/600/644)

REQUIREMENTS
  Node.js >= 18
  Terminal with TTY support (raw mode required for interactive UI)

EXAMPLES
  # Launch the TUI
  devhub

  # For AI agents: the tool is fully interactive (TUI).
  # To use DevHub data programmatically, read the config files directly:
  #   git config --global --list
  #   cat ~/.ssh/config
  #   ssh-add -l
  #   npm config get registry
  #   node -v && npm -v && pnpm -v

LINKS
  Homepage:   https://zjy4fun.github.io/devhub/
  GitHub:     https://github.com/zjy4fun/devhub
  npm:        https://www.npmjs.com/package/@zjy4fun/devhub

LICENSE
  MIT
`.trimStart();

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
