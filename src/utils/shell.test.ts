import {describe, it, expect} from 'vitest';
import {sanitizeInput} from './shell.js';

describe('sanitizeInput', () => {
  it('removes null bytes', () => {
    expect(sanitizeInput('hello\x00world')).toBe('helloworld');
  });

  it('removes newlines and replaces with space', () => {
    expect(sanitizeInput('line1\nline2\r\nline3')).toBe('line1 line2 line3');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('preserves normal strings', () => {
    expect(sanitizeInput('user.name')).toBe('user.name');
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles strings with only control characters', () => {
    expect(sanitizeInput('\x00\r\n')).toBe('');
  });
});
