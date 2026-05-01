import { describe, it, expect } from 'vitest';
import { parseGitConfig } from './git-parser.js';

describe('parseGitConfig', () => {
  it('parses a standard gitconfig with user section', () => {
    const raw = `[user]
\tname = John Doe
\temail = john@example.com
[core]
\teditor = code --wait
\tautocrlf = input
[init]
\tdefaultBranch = main
`;
    const result = parseGitConfig(raw);
    expect(result.user?.name).toBe('John Doe');
    expect(result.core?.editor).toBe('code --wait');
    expect(result.init?.defaultBranch).toBe('main');
  });

  it('handles empty input', () => {
    const result = parseGitConfig('');
    expect(result.user).toBeUndefined();
    expect(result.core).toBeUndefined();
  });

  it('parses pull and credential sections', () => {
    const raw = `[pull]
\trebase = true
[credential]
\thelper = store
`;
    const result = parseGitConfig(raw);
    expect(result.pull?.rebase).toBe('true');
    expect(result.credential?.helper).toBe('store');
  });

  it('parses GPG signing config', () => {
    const raw = `[commit]
\tgpgsign = true
[gpg]
\tformat = ssh
[user]
\tsigningkey = /Users/test/.ssh/id_ed25519.pub
`;
    const result = parseGitConfig(raw);
    expect(result.commit?.gpgsign).toBe('true');
    expect(result.gpg?.format).toBe('ssh');
    expect(result.user?.signingkey).toBe('/Users/test/.ssh/id_ed25519.pub');
  });
});
