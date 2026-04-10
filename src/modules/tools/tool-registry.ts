import {CHINA_MIRRORS} from '../../utils/china-mirror.js';

/**
 * Tool metadata displayed in the install guide module.
 */
export interface Tool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'version-manager' | 'package-manager' | 'dev-tool';
  readonly detect: {
    readonly command: string;
    readonly versionRegex?: string;
  };
  readonly install: {
    readonly official: {
      readonly script?: string;
      readonly brew?: string;
      readonly apt?: string;
      readonly manual?: string;
    };
    readonly china?: {
      readonly script?: string;
      readonly mirror?: string;
      readonly note?: string;
    };
  };
  readonly postInstall?: readonly string[];
}

/**
 * Curated registry of commonly installed developer tools.
 */
export const TOOL_REGISTRY: readonly Tool[] = [
  {
    id: 'nvm',
    name: 'nvm',
    description: 'Node version manager',
    category: 'version-manager',
    detect: {command: 'nvm --version'},
    install: {
      official: {
        script: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash',
        brew: 'brew install nvm',
      },
      china: {
        script:
          'NVM_SOURCE=https://gitee.com/mirrors/nvm.git bash -c "$(curl -fsSL https://gitee.com/mirrors/nvm/raw/master/install.sh)"',
        mirror: CHINA_MIRRORS.nvm.mirror,
      },
    },
    postInstall: ['Reopen the terminal or source your shell rc file before using nvm.'],
  },
  {
    id: 'fnm',
    name: 'fnm',
    description: 'Fast Node version manager (Rust)',
    category: 'version-manager',
    detect: {command: 'fnm --version'},
    install: {
      official: {brew: 'brew install fnm'},
      china: {mirror: CHINA_MIRRORS.githubRelease.mirror, note: 'If GitHub Releases are slow, ghproxy can speed them up.'},
    },
  },
  {
    id: 'pyenv',
    name: 'pyenv',
    description: 'Python version manager',
    category: 'version-manager',
    detect: {command: 'pyenv --version'},
    install: {official: {brew: 'brew install pyenv'}},
  },
  {
    id: 'rbenv',
    name: 'rbenv',
    description: 'Ruby version manager',
    category: 'version-manager',
    detect: {command: 'rbenv --version'},
    install: {official: {brew: 'brew install rbenv'}},
  },
  {
    id: 'homebrew',
    name: 'Homebrew',
    description: 'macOS/Linux package manager',
    category: 'package-manager',
    detect: {command: 'brew --version'},
    install: {
      official: {script: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'},
      china: {mirror: CHINA_MIRRORS.homebrew.mirror, note: 'Consider pairing it with Tsinghua mirror settings for HOMEBREW_BREW_GIT_REMOTE.'},
    },
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    description: 'Efficient Node package manager',
    category: 'package-manager',
    detect: {command: 'pnpm -v'},
    install: {official: {brew: 'brew install pnpm', script: 'npm install -g pnpm'}},
  },
  {
    id: 'bun',
    name: 'bun',
    description: 'All-in-one JS runtime',
    category: 'package-manager',
    detect: {command: 'bun --version'},
    install: {official: {brew: 'brew install bun'}},
  },
  ...[
    ['git', 'Version control'],
    ['curl', 'HTTP client'],
    ['wget', 'File downloader'],
    ['jq', 'JSON processor'],
    ['fzf', 'Fuzzy finder'],
    ['ripgrep', 'Fast text search'],
    ['bat', 'Enhanced cat'],
    ['eza', 'Enhanced ls'],
    ['zoxide', 'Smart cd'],
    ['starship', 'Terminal prompt'],
    ['tmux', 'Terminal multiplexer'],
    ['neovim', 'Editor'],
    ['lazygit', 'Git TUI'],
    ['lazydocker', 'Docker TUI'],
    ['claude-code', 'AI coding assistant'],
  ].map(([id, description]) => {
    const BINARY_MAP: Record<string, string> = {
      'ripgrep': 'rg',
      'neovim': 'nvim',
      'claude-code': 'claude',
    };
    const binary = BINARY_MAP[id] ?? id;
    return {
      id,
      name: id === 'claude-code' ? 'Claude Code' : id,
      description,
      category: 'dev-tool' as const,
      detect: {command: `${binary} --version`},
      install: {official: {brew: `brew install ${id}`}},
    } satisfies Tool;
  }),
];
