declare module 'ini' {
  interface IniStatic {
    parse(input: string): Record<string, Record<string, string> | string>;
    stringify(object: Record<string, unknown>, options?: { section?: string; whitespace?: boolean }): string;
    safe(val: string): string;
    unsafe(val: string): string;
  }

  const ini: IniStatic;
  export default ini;
}
