# DevHub TUI — 开发环境配置管理工具

## 项目 Prompt（交给 Claude Code 执行）

---

## 一、项目概述

请帮我创建一个名为 **devhub** 的 TUI（Terminal User Interface）工具，使用 TypeScript 技术栈。

这个工具的定位是：**开发者本地环境配置的统一管理入口**。开发者输入 `devhub` 命令后，进入一个交互式终端界面，可以快速查看、检查、修改常用的开发配置，同时提供常用开发工具的安装引导（含中国镜像源）。

核心理念：**不是又一个 dotfiles 同步工具，而是一个开发环境的"X光机+控制面板"**。帮开发者回答"我的配置到底是什么状态"和"我该改哪里"这两个问题。

---

## 二、技术栈

```
运行时：Node.js >= 18
语言：TypeScript（严格模式）
TUI 框架：Ink（React-based terminal UI）
UI 组件：@inkjs/ui（Select, TextInput, Spinner 等）
运行工具：tsx（开发时直接运行 .ts/.tsx，无需编译）
构建打包：tsup（最终发布为单文件 CLI）
包管理器：pnpm
```

### 项目初始化命令

```bash
mkdir devhub && cd devhub
pnpm init
pnpm add ink react @inkjs/ui ink-text-input ink-select-input ink-spinner
pnpm add ssh-config ini yaml zod chalk
pnpm add -D typescript tsx tsup @types/react @types/node
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### package.json 关键字段

```json
{
  "name": "devhub",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "devhub": "./dist/cli.js"
  },
  "scripts": {
    "dev": "tsx src/cli.tsx",
    "build": "tsup src/cli.tsx --format esm --dts --clean",
    "start": "node dist/cli.js"
  }
}
```

---

## 三、目录结构

```
devhub/
├── src/
│   ├── cli.tsx                    # 入口文件，渲染主应用
│   ├── app.tsx                    # 主应用组件（顶层路由）
│   │
│   ├── components/                # 通用 UI 组件
│   │   ├── Layout.tsx             # 统一布局框架（标题栏 + 内容区 + 状态栏）
│   │   ├── MenuList.tsx           # 通用菜单列表
│   │   ├── KeyValue.tsx           # 键值对展示组件
│   │   ├── StatusBadge.tsx        # 状态标识（✓ 正常 / ✗ 异常 / ⚠ 警告）
│   │   ├── EditableField.tsx      # 可编辑字段组件
│   │   ├── ConfirmDialog.tsx      # 确认对话框
│   │   └── BackButton.tsx         # 返回上级菜单
│   │
│   ├── modules/                   # 各功能模块
│   │   ├── git/
│   │   │   ├── GitModule.tsx      # Git 模块主页面
│   │   │   ├── git-parser.ts      # 解析 ~/.gitconfig
│   │   │   └── git-actions.ts     # 修改 git 配置的操作
│   │   │
│   │   ├── ssh/
│   │   │   ├── SSHModule.tsx      # SSH 模块主页面
│   │   │   ├── ssh-parser.ts      # 解析 ~/.ssh/config 和密钥文件
│   │   │   └── ssh-actions.ts     # SSH 相关操作
│   │   │
│   │   ├── env/
│   │   │   ├── EnvModule.tsx      # 环境变量模块主页面
│   │   │   ├── env-parser.ts      # 解析 shell rc 文件中的 export 语句
│   │   │   └── env-actions.ts     # 环境变量修改操作
│   │   │
│   │   ├── node/
│   │   │   ├── NodeModule.tsx     # Node.js 生态模块主页面
│   │   │   └── node-checker.ts    # 检测 node/npm/nvm/pnpm 等
│   │   │
│   │   └── tools/
│   │       ├── ToolsModule.tsx    # 常用工具安装引导页面
│   │       └── tool-registry.ts   # 工具列表和下载地址注册表
│   │
│   └── utils/
│       ├── file.ts                # 文件读写工具函数
│       ├── shell.ts               # 执行 shell 命令的封装
│       ├── platform.ts            # 平台检测（macOS/Linux/WSL）
│       └── china-mirror.ts        # 中国镜像源地址映射
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 四、主菜单设计

用户输入 `devhub` 后，进入主菜单。使用 Ink 的 Select 组件展示以下选项：

```
╭─────────────────────────────────────╮
│  🛠  DevHub — 开发环境配置管理        │
│  v0.1.0         macOS arm64          │
╰─────────────────────────────────────╯

  请选择要管理的配置：

  ❯  📦 Git 配置          ~/.gitconfig 管理
     🔐 SSH 配置          密钥与主机管理
     🔑 环境变量          Shell 变量溯源
     💚 Node.js 生态      Node/npm/nvm/pnpm
     📥 工具安装          常用开发工具 + 中国镜像

  ─────────────────────────
  ↑↓ 导航  ⏎ 进入  q 退出
```

---

## 五、各模块详细需求

### 模块 1：Git 配置（📦）

**进入后展示的信息：**

```
📦 Git 配置    ~/.gitconfig

── 当前配置预览 ──────────────────────
  用户名        zjy4fun
  邮箱          zjy4fun@gmail.com
  默认编辑器    code --wait
  默认分支      main
  pull 策略     rebase
  凭证存储      store

── 健康检查 ──────────────────────────
  ✓ user.name 已配置
  ✓ user.email 已配置
  ✓ init.defaultBranch = main
  ⚠ core.autocrlf 未设置（建议设为 input）
  ⚠ 未检测到 GPG signing 配置

── 操作 ──────────────────────────────
  ❯ 修改用户名/邮箱
    修改默认编辑器
    修改默认分支名
    配置常用 alias
    配置 pull 策略
    查看完整配置（raw）
    ← 返回主菜单
```

**解析逻辑：**
- 读取并解析 `~/.gitconfig`（INI 格式），使用 `ini` 包
- 同时检查当前目录是否有 `.git/config`（local config），如果有也展示

**修改逻辑：**
- 修改时调用 `git config --global <key> <value>`，不直接写文件
- 修改前展示当前值和新值，确认后执行

**健康检查规则：**
- `user.name` 和 `user.email` 必须存在，否则标红
- `init.defaultBranch` 建议为 `main`
- `core.autocrlf` 建议设置（macOS/Linux 建议 `input`，Windows 建议 `true`）
- `pull.rebase` 建议设置
- 检查是否配置了 GPG/SSH signing（可选提醒）

---

### 模块 2：SSH 配置（🔐）

**进入后展示的信息：**

```
🔐 SSH 配置    ~/.ssh/

── 密钥列表 ──────────────────────────
  🔑 id_ed25519    ED25519  ✓ agent已加载  ✓ 权限600
  🔑 id_rsa        RSA-4096 ✗ agent未加载  ✓ 权限600
  🔑 id_work       ED25519  ✗ agent未加载  ⚠ 权限644（不安全！）

── 主机配置 ──────────────────────────
  github.com     → git@github.com (id_ed25519)
  dev-server     → root@192.168.1.100:22 (id_rsa)
  prod-server    → deploy@10.0.0.50:2222 (id_work)

── 健康检查 ──────────────────────────
  ✓ ~/.ssh 目录权限 700
  ✓ config 文件权限 600
  ✗ id_work 私钥权限应为 600，当前 644
  ✗ id_rsa 未加载到 ssh-agent
  ⚠ config 中引用了 id_old，但该文件不存在

── 操作 ──────────────────────────────
  ❯ 生成新密钥对
    添加密钥到 ssh-agent
    编辑主机配置
    测试主机连接
    修复文件权限
    查看完整 config（raw）
    ← 返回主菜单
```

**解析逻辑：**
- 使用 `ssh-config` npm 包解析 `~/.ssh/config`
- 扫描 `~/.ssh/` 目录下的密钥文件（排除 known_hosts、config、authorized_keys）
- 通过 `ssh-add -l` 检查 agent 中已加载的密钥
- 通过 `fs.stat` 检查文件权限

**关联检查（核心差异化功能）：**
- config 中引用的 IdentityFile 是否真实存在
- 密钥文件权限是否安全（私钥必须 600，公钥建议 644）
- `~/.ssh` 目录权限是否为 700
- config 文件权限是否为 600

**操作：**
- 生成密钥：调用 `ssh-keygen -t ed25519 -C "email"`，提供交互式输入
- 添加到 agent：调用 `ssh-add <keyfile>`
- 测试连接：调用 `ssh -T <host>` 并展示结果
- 修复权限：`chmod 600` / `chmod 700` 一键修复

---

### 模块 3：环境变量（🔑）

**进入后展示的信息：**

```
🔑 环境变量管理

── 检测到的 Shell 配置文件 ────────────
  ✓ ~/.zshrc              (当前 shell)
  ✓ ~/.zshenv
    ~/.bashrc             (存在但非当前 shell)
    ~/.config/fish/config.fish  (不存在)
    .env (当前目录)       (存在)

── 环境变量概览 ──────────────────────
  ANTHROPIC_API_KEY    = sk-ant-***     ← ~/.zshrc:42
  OPENAI_API_KEY       = sk-***         ← ~/.zshrc:43
  PATH                 = (26 个条目)    ← 多处来源
  EDITOR               = code           ← ~/.zshrc:10
  NVM_DIR              = ~/.nvm         ← ~/.zshrc:55
  HOMEBREW_NO_AUTO...  = 1              ← ~/.zshrc:8

── 健康检查 ──────────────────────────
  ⚠ ANTHROPIC_API_KEY 在 ~/.zshrc 和 .env 中重复定义
  ⚠ PATH 中包含不存在的目录: /usr/local/go/bin
  ✓ EDITOR 已设置
  ✓ LANG 已设置为 en_US.UTF-8

── 操作 ──────────────────────────────
  ❯ 搜索变量（输入变量名溯源）
    查看 PATH 详情
    添加新环境变量
    修改已有变量
    检查重复定义
    查看原始文件
    ← 返回主菜单
```

**解析逻辑：**
- 检测当前 shell 类型：`$SHELL` 或 `$0`
- 按优先级扫描配置文件：
  - zsh: `~/.zshenv` → `~/.zprofile` → `~/.zshrc` → `~/.zlogin`
  - bash: `~/.bash_profile` → `~/.bashrc` → `~/.profile`
  - fish: `~/.config/fish/config.fish`
- 用正则提取 `export KEY=VALUE` 和 `export KEY="VALUE"` 语句
- 记录每个变量的来源文件和行号

**核心功能——变量溯源：**
- 用户输入一个变量名（如 `ANTHROPIC_API_KEY`）
- 工具展示：该变量在哪些文件的哪一行出现、每处的值是什么、最终生效的是哪个（后定义覆盖先定义）
- 对于 PATH 变量，拆分展示每个路径条目，标注哪些路径实际不存在

**修改逻辑：**
- 定位到正确的文件和行号
- 展示修改前后的 diff
- 确认后写入文件
- 提醒用户 `source ~/.zshrc` 或重新打开终端

---

### 模块 4：Node.js 生态（💚）

**进入后展示的信息：**

```
💚 Node.js 生态

── 环境检测 ──────────────────────────
  Node.js     v20.11.0    ✓ (via nvm)
  npm         10.2.4      ✓
  pnpm        8.15.4      ✓
  yarn        未安装
  nvm         0.39.7      ✓
  fnm         未安装
  bun         1.0.25      ✓

── npm 配置 ──────────────────────────
  registry    https://registry.npmmirror.com  (中国镜像)
  prefix      ~/.npm-global
  cache       ~/.npm

── 健康检查 ──────────────────────────
  ✓ Node.js LTS 版本
  ✓ nvm 已安装，管理 Node 版本
  ⚠ npm registry 为中国镜像（国际项目可能需要切换）
  ✗ yarn 未安装

── 操作 ──────────────────────────────
  ❯ 切换 npm registry（官方/淘宝镜像一键切换）
    安装/更新 Node.js（通过 nvm）
    安装包管理器（pnpm/yarn/bun）
    查看全局安装的包
    清理 npm 缓存
    ← 返回主菜单
```

**检测逻辑：**
- 逐一执行 `node -v`、`npm -v`、`pnpm -v`、`yarn -v`、`bun -v`、`nvm --version`、`fnm --version`
- 检测 Node 是通过 nvm 还是系统安装：检查 `which node` 路径是否包含 `.nvm`
- 读取 `npm config get registry` 获取当前源
- 读取 `~/.npmrc` 获取完整 npm 配置

**操作：**
- registry 切换：`npm config set registry <url>`
  - 官方：`https://registry.npmjs.org/`
  - 淘宝镜像：`https://registry.npmmirror.com/`
- 安装 Node：引导用户通过 nvm 安装（`nvm install --lts`）
- 安装包管理器：`npm install -g pnpm` / `npm install -g yarn`

---

### 模块 5：工具安装引导（📥）

**进入后展示的信息：**

```
📥 常用开发工具安装

  选择要安装的工具：

  ── 版本管理 ──
  ❯ nvm          Node 版本管理器
    fnm          快速 Node 版本管理器（Rust）
    pyenv        Python 版本管理器
    rbenv        Ruby 版本管理器

  ── 包管理器 ──
    Homebrew     macOS/Linux 包管理器
    pnpm         高效的 Node 包管理器
    bun          All-in-one JS 运行时

  ── 开发工具 ──
    git          版本控制
    curl         HTTP 客户端
    wget         文件下载工具
    jq           JSON 处理器
    fzf          模糊搜索
    ripgrep      高速文本搜索
    bat          增强版 cat
    eza          增强版 ls
    zoxide       智能 cd
    starship     终端提示符
    tmux         终端复用器
    neovim       编辑器
    lazygit      Git TUI
    lazydocker   Docker TUI
    Claude Code  AI 编程助手
```

**每个工具选中后展示：**

```
📥 nvm — Node Version Manager

  状态: ✗ 未安装

  ── 安装方式 ────────────────────────
  官方安装脚本:
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

  🇨🇳 中国镜像:
    NVM_SOURCE=https://gitee.com/mirrors/nvm.git bash -c "$(curl -fsSL https://gitee.com/mirrors/nvm/raw/master/install.sh)"

  Homebrew:
    brew install nvm

  ── 操作 ────────────────────────────
  ❯ 复制安装命令到剪贴板
    直接执行安装（官方）
    直接执行安装（中国镜像）
    ← 返回工具列表
```

**工具注册表结构（tool-registry.ts）：**

```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'version-manager' | 'package-manager' | 'dev-tool';
  // 检测是否已安装
  detect: {
    command: string;       // 如 "nvm --version"
    versionRegex?: string; // 提取版本号的正则
  };
  // 安装方式
  install: {
    official: {
      script?: string;     // curl 安装脚本
      brew?: string;       // Homebrew 命令
      apt?: string;        // apt 命令
      manual?: string;     // 手动安装说明
    };
    china?: {
      script?: string;     // 中国镜像安装脚本
      mirror?: string;     // 镜像地址
      note?: string;       // 额外说明
    };
  };
  // 安装后配置提示
  postInstall?: string[];
}
```

**中国镜像地址映射（china-mirror.ts）：**

请收集以下工具的中国镜像/加速地址，写入 `china-mirror.ts`：

| 工具 | 官方地址 | 中国镜像 |
|------|---------|---------|
| nvm | github.com/nvm-sh/nvm | gitee.com/mirrors/nvm |
| Homebrew | brew.sh | mirrors.tuna.tsinghua.edu.cn/git/homebrew |
| npm registry | registry.npmjs.org | registry.npmmirror.com |
| pip | pypi.org | pypi.tuna.tsinghua.edu.cn |
| rustup | rustup.rs | rsproxy.cn |
| Go | go.dev/dl | golang.google.cn/dl 或 goproxy.cn |
| Docker | docker.com | 各大云厂商镜像 |
| GitHub Release 加速 | github.com | ghproxy.com 或 mirror.ghproxy.com |

请在代码中注释标明镜像来源和最后验证日期，方便后续维护。如果某些镜像已失效，请标注为 `deprecated` 并搜索最新可用的替代方案。

---

## 六、通用交互规范

### 导航
- `↑` `↓` 或 `j` `k`：在列表中移动
- `Enter`：进入/确认
- `q` 或 `Esc`：退出当前页面/返回上级
- `Ctrl+C`：强制退出
- `/`：在列表页触发搜索

### 颜色规范
- 绿色（`#3fb950`）：正常/通过
- 黄色（`#d29922`）：警告/建议
- 红色（`#f85149`）：错误/缺失
- 蓝色（`#58a6ff`）：信息/链接
- 灰色（`#6e7681`）：次要信息
- 紫色（`#bc8cff`）：高亮关键词

### 敏感信息处理
- API Key、Token 等敏感值默认显示为 `sk-ant-***...***`（首6尾3）
- 提供 `Tab` 键切换显示/隐藏完整值
- 在修改操作中显示完整值

### 操作确认
- 任何写入文件的操作都必须先展示 diff（修改前 vs 修改后）
- 需要用户按 `y` 确认后才执行
- 执行后展示结果并提示是否需要 source

### 错误处理
- 文件不存在：展示提示并提供创建选项
- 权限不足：提示并提供 sudo 执行选项
- 命令执行失败：展示完整错误输出

---

## 七、实现优先级

请按以下顺序实现，每完成一个阶段确认后再继续：

### Phase 1：骨架 + Git 模块
1. 项目初始化（package.json、tsconfig、目录结构）
2. 主应用框架（Layout 组件、主菜单导航）
3. Git 模块完整实现（解析、展示、健康检查、修改）

### Phase 2：SSH 模块
4. SSH config 解析 + 密钥扫描
5. 健康检查（权限、agent、引用一致性）
6. 操作功能（生成密钥、修复权限、测试连接）

### Phase 3：环境变量模块
7. Shell 配置文件检测 + 变量提取
8. 变量溯源功能
9. PATH 拆解分析
10. 变量修改功能

### Phase 4：Node.js 生态 + 工具安装
11. Node 生态检测
12. npm registry 切换
13. 工具注册表 + 安装引导
14. 中国镜像集成

---

## 八、代码质量要求

- 所有函数和组件添加 JSDoc 注释
- 解析器模块必须有清晰的类型定义（使用 zod schema）
- shell 命令执行必须有 timeout（默认 5 秒）
- 文件操作前必须检查权限
- 所有用户输入必须做 sanitize
- 保持组件职责单一，解析逻辑与 UI 渲染分离
- 每个模块的 parser 和 actions 可独立测试

---

## 九、README 内容

生成一份 README.md，包含：
- 项目介绍和截图占位符
- 安装方式（`npx devhub` 或 `pnpm add -g devhub`）
- 功能列表
- 支持的配置文件
- 中国镜像说明
- 贡献指南占位符
- MIT License
