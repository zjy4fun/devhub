import {describe, it, expect} from 'vitest';
import os from 'node:os';
import {expandHome, createDiffPreview, toOctalMode} from './file.js';

describe('expandHome', () => {
  it('expands ~ to home directory', () => {
    expect(expandHome('~')).toBe(os.homedir());
  });

  it('expands ~/path to home/dir', () => {
    expect(expandHome('~/.gitconfig')).toBe(`${os.homedir()}/.gitconfig`);
  });

  it('returns absolute paths unchanged', () => {
    expect(expandHome('/usr/local/bin')).toBe('/usr/local/bin');
  });

  it('returns relative paths unchanged', () => {
    expect(expandHome('./src/index.ts')).toBe('./src/index.ts');
  });
});

describe('createDiffPreview', () => {
  it('shows removed lines with - prefix and added lines with + prefix', () => {
    const diff = createDiffPreview('old line', 'new line');
    expect(diff).toContain('--- before');
    expect(diff).toContain('- old line');
    expect(diff).toContain('+++ after');
    expect(diff).toContain('+ new line');
  });

  it('shows common lines without prefix', () => {
    const diff = createDiffPreview('same line', 'same line');
    expect(diff).not.toContain('- same line');
    expect(diff).not.toContain('+ same line');
  });

  it('handles empty before', () => {
    const diff = createDiffPreview('', 'new content');
    expect(diff).toContain('- (empty)');
    expect(diff).toContain('+ new content');
  });

  it('handles empty after', () => {
    const diff = createDiffPreview('old content', '');
    expect(diff).toContain('- old content');
    expect(diff).toContain('+ (empty)');
  });

  it('handles multi-line changes', () => {
    const before = 'line1\nline2\nline3';
    const after = 'line1\nmodified\nline3';
    const diff = createDiffPreview(before, after);
    expect(diff).toContain('- line2');
    expect(diff).toContain('+ modified');
  });
});

describe('toOctalMode', () => {
  it('converts numeric mode to octal string', () => {
    expect(toOctalMode(0o755)).toBe('0755');
    expect(toOctalMode(0o600)).toBe('0600');
    expect(toOctalMode(0o644)).toBe('0644');
    expect(toOctalMode(0o700)).toBe('0700');
  });

  it('returns unknown for non-numeric input', () => {
    expect(toOctalMode(undefined)).toBe('unknown');
    expect(toOctalMode(undefined)).toBe('unknown');
  });
});
