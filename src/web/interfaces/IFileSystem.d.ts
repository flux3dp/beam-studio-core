export interface IFileSystem {
  exists(path: string): boolean;
  appendFile(filePath: string, data: Buffer | string): void;
  copyFile(src: string, dest: string): void;
  writeFile(filePath: string, data: Buffer | string): void;
  isFile(input: string): boolean;
  isDirectory(input: string): boolean;
  rename(oldPath: string, newPath: string): Promise<void>;
  mkdir(path: string, isRecursive: boolean): Promise<string>;
  writeStream(path: string, flags: string, data?: Buffer[]);
}
