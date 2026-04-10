/**
 * Mirror metadata used by Node and Tools modules.
 *
 * Source notes and verification date:
 * - nvm mirror: Gitee mirrors/nvm repository, verified 2026-04-10
 * - Homebrew mirror: Tsinghua Tuna Homebrew help pages and git mirror host, verified 2026-04-10
 * - npm registry mirror: npmmirror.com registry endpoint, verified 2026-04-10
 * - pip mirror: Tsinghua Tuna PyPI mirror, verified 2026-04-10
 * - rustup acceleration: rsproxy.cn docs, verified 2026-04-10
 * - Go download acceleration: golang.google.cn and goproxy.cn, verified 2026-04-10
 * - Docker mirrors: vendor-specific mirrors vary by provider; generic entry kept informational, verified 2026-04-10
 * - GitHub release acceleration: ghproxy.com family widely used; availability may vary, verified 2026-04-10
 */
export const CHINA_MIRRORS = {
  nvm: {
    official: 'https://github.com/nvm-sh/nvm',
    mirror: 'https://gitee.com/mirrors/nvm',
    deprecated: false,
  },
  homebrew: {
    official: 'https://brew.sh',
    mirror: 'https://mirrors.tuna.tsinghua.edu.cn/git/homebrew',
    deprecated: false,
  },
  npm: {
    official: 'https://registry.npmjs.org/',
    mirror: 'https://registry.npmmirror.com/',
    deprecated: false,
  },
  pip: {
    official: 'https://pypi.org/simple',
    mirror: 'https://pypi.tuna.tsinghua.edu.cn/simple',
    deprecated: false,
  },
  rustup: {
    official: 'https://rustup.rs',
    mirror: 'https://rsproxy.cn',
    deprecated: false,
  },
  go: {
    official: 'https://go.dev/dl/',
    mirror: 'https://golang.google.cn/dl/',
    alternateMirror: 'https://goproxy.cn',
    deprecated: false,
  },
  docker: {
    official: 'https://www.docker.com/',
    mirror: 'Vendor-specific registry mirrors are commonly required; configure by cloud vendor or local daemon mirror.',
    deprecated: false,
  },
  githubRelease: {
    official: 'https://github.com/',
    mirror: 'https://ghproxy.com',
    alternateMirror: 'https://mirror.ghproxy.com',
    deprecated: false,
  },
} as const;
