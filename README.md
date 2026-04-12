# 🛠 DevHub

> X-ray machine and control panel for development environment config

**[📖 Docs & Demo](https://zjy4fun.github.io/devhub/)**

DevHub is a TypeScript + Ink TUI tool that helps developers inspect, check, and edit local development environment config from one terminal entry point.

It is not another dotfiles sync tool. It helps answer: "What state is my config in?" and "What should I change?"

## Quick Start

```bash
npx @zjy4fun/devhub
```

```bash
pnpm add -g @zjy4fun/devhub
devhub
```

## Feature Modules

### 📦 Git Config
- Preview `~/.gitconfig`
- Health checks: user.name/email, defaultBranch, autocrlf, GPG signing
- Guided edits: username/email, editor, default branch, pull strategy, aliases

### 🔐 SSH Config
- Key scan: type, agent status, file permissions
- Host config: parse `~/.ssh/config` and show Host → IdentityFile mapping
- Health checks: directory mode 700, config mode 600, private key mode 600, referenced file consistency
- Actions: generate keys, add to agent, edit host, test connections, repair permissions

### 🔑 Environment Variables
- Shell config detection (zsh/bash/fish)
- Variable provenance: which file and which line each variable came from
- PATH analysis: flag missing directories
- Duplicate definition detection, sensitive value masking (toggle with Tab)
- Doctor fix: safe remediations for shadowed duplicates, broken PATH segments, and missing `EDITOR`
- Reminder to source after editing

### 💚 Node.js Ecosystem
- Detect Node/npm/pnpm/yarn/bun/nvm/fnm
- Detect Node source (nvm vs system install)
- One-click npm registry switch (official / China mirror)
- Global package list, cache cleanup

### 📥 Tool Installation Guide
- 22+ common dev tools: nvm, pyenv, Homebrew, pnpm, fzf, ripgrep, bat, lazygit, Claude Code...
- Per tool: install detection plus official/mirror install commands
- Copy to clipboard or run directly

## 🇨🇳 China Mirrors

Built-in mirror URLs with source and verification date:

| Tool | Mirror |
|------|------|
| npm | registry.npmmirror.com |
| Homebrew | mirrors.tuna.tsinghua.edu.cn |
| pip | pypi.tuna.tsinghua.edu.cn |
| rustup | rsproxy.cn |
| Go | golang.google.cn / goproxy.cn |
| nvm | gitee.com/mirrors/nvm |
| GitHub Release | ghproxy.com |

## Supported Config Files

- `~/.gitconfig` / `.git/config`
- `~/.ssh/config` / `~/.ssh/*`
- `~/.zshenv` / `~/.zprofile` / `~/.zshrc` / `~/.zlogin`
- `~/.bash_profile` / `~/.bashrc` / `~/.profile`
- `~/.config/fish/config.fish`
- `.env`
- `~/.npmrc`

## Tech Stack

- **TypeScript** (strict mode)
- **Ink** (React-based terminal UI)
- **@inkjs/ui** (Select, TextInput, Spinner)
- **tsup** (build)
- **zod** (schema validation)

## Development

```bash
pnpm install
pnpm dev      # Run in development mode
pnpm build    # Build
pnpm start    # Run the built output
```

## License

MIT
