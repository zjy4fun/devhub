# 🛠 DevHub

> 开发环境配置的 X 光机 + 控制面板

**[📖 文档 & 演示](https://zjy4fun.github.io/devhub/)**

DevHub 是一个 TypeScript + Ink TUI 工具，帮助开发者从一个终端入口快速查看、检查、修改本地开发环境配置。

不是又一个 dotfiles 同步工具 — 而是帮你回答「**我的配置到底是什么状态**」和「**我该改哪里**」。

## 快速开始

```bash
npx @zjy4fun/devhub
```

```bash
pnpm add -g @zjy4fun/devhub
devhub
```

## 功能模块

### 📦 Git 配置
- 查看 `~/.gitconfig` 配置预览
- 健康检查：user.name/email、defaultBranch、autocrlf、GPG signing
- 引导式修改：用户名/邮箱、编辑器、默认分支、pull 策略、alias

### 🔐 SSH 配置
- 密钥扫描：类型、agent 状态、文件权限
- 主机配置：解析 `~/.ssh/config`，展示 Host → IdentityFile 映射
- 健康检查：目录权限 700、config 权限 600、私钥权限 600、引用文件一致性
- 操作：生成密钥、添加到 agent、编辑 Host、测试连接、一键修复权限

### 🔑 环境变量
- Shell 配置文件检测（zsh/bash/fish）
- 变量溯源：每个变量来自哪个文件的哪一行
- PATH 拆解分析：标注不存在的路径
- 重复定义检测、敏感值遮罩（Tab 切换显示）
- 修改后提醒 source

### 💚 Node.js 生态
- 检测 Node/npm/pnpm/yarn/bun/nvm/fnm
- Node 来源检测（nvm vs 系统安装）
- npm registry 一键切换（官方 / 淘宝镜像）
- 全局包列表、缓存清理

### 📥 工具安装引导
- 22+ 常用开发工具：nvm、pyenv、Homebrew、pnpm、fzf、ripgrep、bat、lazygit、Claude Code...
- 每个工具：检测是否安装 + 官方/镜像安装命令
- 复制到剪贴板 / 直接执行安装

## 🇨🇳 中国镜像

内置镜像源地址，含来源和验证日期：

| 工具 | 镜像 |
|------|------|
| npm | registry.npmmirror.com |
| Homebrew | mirrors.tuna.tsinghua.edu.cn |
| pip | pypi.tuna.tsinghua.edu.cn |
| rustup | rsproxy.cn |
| Go | golang.google.cn / goproxy.cn |
| nvm | gitee.com/mirrors/nvm |
| GitHub Release | ghproxy.com |

## 支持的配置文件

- `~/.gitconfig` / `.git/config`
- `~/.ssh/config` / `~/.ssh/*`
- `~/.zshenv` / `~/.zprofile` / `~/.zshrc` / `~/.zlogin`
- `~/.bash_profile` / `~/.bashrc` / `~/.profile`
- `~/.config/fish/config.fish`
- `.env`
- `~/.npmrc`

## 技术栈

- **TypeScript** (strict mode)
- **Ink** (React-based terminal UI)
- **@inkjs/ui** (Select, TextInput, Spinner)
- **tsup** (build)
- **zod** (schema validation)

## 开发

```bash
pnpm install
pnpm dev      # 开发模式运行
pnpm build    # 构建
pnpm start    # 运行构建产物
```

## License

MIT
