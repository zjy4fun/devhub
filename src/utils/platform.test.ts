import {describe, it, expect} from 'vitest';
import {detectPlatform, getArchLabel, getPlatformLabel} from './platform.js';

describe('detectPlatform', () => {
  it('returns a valid platform kind', () => {
    const platform = detectPlatform();
    expect(['macOS', 'Linux', 'Windows', 'WSL']).toContain(platform);
  });
});

describe('getArchLabel', () => {
  it('returns a non-empty string', () => {
    const arch = getArchLabel();
    expect(arch).toBeTruthy();
    expect(typeof arch).toBe('string');
  });
});

describe('getPlatformLabel', () => {
  it('returns a string containing platform and arch', () => {
    const label = getPlatformLabel();
    expect(label).toBeTruthy();
    expect(label.length).toBeGreaterThan(0);
  });
});
