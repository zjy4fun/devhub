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
    description: 'Node 版本管理器',
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
    postInstall: ['重开终端或 source shell rc 文件后再使用 nvm。'],
  },
  {
    id: 'fnm',
    name: 'fnm',
    description: '快速 Node 版本管理器（Rust）',
    category: 'version-manager',
    detect: {command: 'fnm --version'},
    install: {
      official: {brew: 'brew install fnm'},
      china: {mirror: CHINA_MIRRORS.githubRelease.mirror, note: '如 GitHub Release 较慢，可通过 ghproxy 加速。'},
    },
  },
  {
    id: 'pyenv',
    name: 'pyenv',
    description: 'Python 版本管理器',
    category: 'version-manager',
    detect: {command: 'pyenv --version'},
    install: {official: {brew: 'brew install pyenv'}},
  },
  {
    id: 'rbenv',
    name: 'rbenv',
    description: 'Ruby 版本管理器',
    category: 'version-manager',
    detect: {command: 'rbenv --version'},
    install: {official: {brew: 'brew install rbenv'}},
  },
  {
    id: 'homebrew',
    name: 'Homebrew',
    description: 'macOS/Linux 包管理器',
    category: 'package-manager',
    detect: {command: 'brew --version'},
    install: {
      official: {script: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'},
      china: {mirror: CHINA_MIRRORS.homebrew.mirror, note: '建议结合清华镜像配置 HOMEBREW_BREW_GIT_REMOTE。'},
    },
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    description: '高效的 Node 包管理器',
    category: 'package-manager',
    detect: {command: 'pnpm -v'},
    install: {official: {brew: 'brew install pnpm', script: 'npm install -g pnpm'}},
  },
  {
    id: 'bun',
    name: 'bun',
    description: 'All-in-one JS 运行时',
    category: 'package-manager',
    detect: {command: 'bun --version'},
    install: {official: {brew: 'brew install bun'}},
  },
  ...[
    ['git', '版本控制'],
    ['curl', 'HTTP 客户端'],
    ['wget', '文件下载工具'],
    ['jq', 'JSON 处理器'],
    ['fzf', '模糊搜索'],
    ['ripgrep', '高速文本搜索'],
    ['bat', '增强版 cat'],
    ['eza', '增强版 ls'],
    ['zoxide', '智能 cd'],
    ['starship', '终端提示符'],
    ['tmux', '终端复用器'],
    ['neovim', '编辑器'],
    ['lazygit', 'Git TUI'],
    ['lazydocker', 'Docker TUI'],
    ['claude-code', 'AI 编程助手'],
  ].map(
    ([id, description]) =>
      ({
        id,
        name: id === 'claude-code' ? 'Claude Code' : id,
        description,
        category: 'dev-tool',
        detect: {command: `${id === 'claude-code' ? 'claude' : id} --version`},
        install: {official: {brew: `brew install ${id}`}},
      }) satisfies Tool,
  ),
];
