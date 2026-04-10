declare module 'ini' {
  const ini: {
    parse(input: string): Record<string, unknown>;
  };

  export default ini;
}
