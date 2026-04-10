# DevHub

DevHub is a TypeScript + Ink TUI for inspecting and managing local developer environment configuration from one terminal entrypoint. It focuses on answering two questions quickly: what is configured now, and where should it be changed.

## Screenshot

`[screenshot placeholder]`

## Install

```bash
npx devhub
```

```bash
pnpm add -g devhub
```

## Features

- Git config inspection, health checks, and guided updates
- SSH key, host, permission, and agent management
- Shell environment variable tracing and editing
- Node.js ecosystem detection and npm registry switching
- Tool installation guidance with China mirror options

## Supported Config Files

- `~/.gitconfig`
- `.git/config`
- `~/.ssh/config`
- `~/.zshenv`
- `~/.zprofile`
- `~/.zshrc`
- `~/.zlogin`
- `~/.bash_profile`
- `~/.bashrc`
- `~/.profile`
- `~/.config/fish/config.fish`
- `.env`
- `~/.npmrc`

## China Mirrors

DevHub includes a curated registry of mirror endpoints and alternative install commands for users in mainland China. Mirror metadata is documented in code comments with source notes and verification dates so it can be maintained over time.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

## Contributing

`[contribution guide placeholder]`

## License

MIT License
