declare module 'gray-matter' {
  interface GrayMatterFile<T = any> {
    data: T;
    content: string;
    excerpt?: string;
    orig: Buffer | string;
    language: string;
    matter: string;
    stringify: (options?: any) => string;
  }

  interface Options {
    excerpt?: boolean | ((input: string) => string);
    excerpt_separator?: string;
    engines?: Record<string, any>;
    language?: string;
    delimiters?: string | [string, string];
    [key: string]: any;
  }

  type GrayMatterFn = <T = any>(
    input: Buffer | string,
    options?: Options
  ) => GrayMatterFile<T>;

  const grayMatter: GrayMatterFn & {
    stringify: (file: string | GrayMatterFile, options?: Options) => string;
    read: (filepath: string, options?: Options) => GrayMatterFile;
  };

  export = grayMatter;
}