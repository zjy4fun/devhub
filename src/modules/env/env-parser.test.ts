import {describe, it, expect} from 'vitest';
import {getShellFiles} from './env-parser.js';

describe('getShellFiles', () => {
  it('returns zsh files for zsh shell', () => {
    const files = getShellFiles('/bin/zsh');
    expect(files.map((f) => f.path)).toContain('~/.zshrc');
    expect(files.map((f) => f.path)).toContain('~/.zshenv');
    expect(files.map((f) => f.path)).toContain('~/.zprofile');
    expect(files.map((f) => f.path)).toContain('~/.zlogin');
  });

  it('returns bash files for bash shell', () => {
    const files = getShellFiles('/bin/bash');
    expect(files.map((f) => f.path)).toContain('~/.bash_profile');
    expect(files.map((f) => f.path)).toContain('~/.bashrc');
    expect(files.map((f) => f.path)).toContain('~/.profile');
  });

  it('returns fish files for fish shell', () => {
    const files = getShellFiles('/usr/local/bin/fish');
    expect(files.map((f) => f.path)).toContain('~/.config/fish/config.fish');
    expect(files).toHaveLength(2); // fish config + .env
  });

  it('always includes .env in current directory', () => {
    const files = getShellFiles('/bin/zsh', '/home/test/project');
    const envFile = files.find((f) => f.path.includes('.env'));
    expect(envFile).toBeDefined();
    expect(envFile?.note).toBe('(current directory)');
  });

  it('defaults to zsh for unknown shells', () => {
    const files = getShellFiles('/bin/unknown');
    expect(files.map((f) => f.path)).toContain('~/.zshrc');
  });

  it('marks the preferred shell file as current', () => {
    const zshFiles = getShellFiles('/bin/zsh');
    const currentFile = zshFiles.find((f) => f.current);
    expect(currentFile?.path).toBe('~/.zshrc');

    const bashFiles = getShellFiles('/bin/bash');
    const bashCurrent = bashFiles.find((f) => f.current);
    expect(bashCurrent?.path).toBe('~/.bashrc');
  });
});
