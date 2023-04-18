declare global {
  /* region 补充 */

  interface Window {
    showOpenFilePicker(options: ShowOpenFilePickerOptions): Promise<Array<FileSystemHandle>>;
    showDirectoryPicker(options: ShowDirectoryPickerOptions): Promise<FileSystemHandle>;
  }
  
  interface Navigator {
    userActivation: {
      isActive: boolean;
      hasBeenActive: boolean;
    };
  }

  interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
    isSameEntry(fileSystemHandle: FileSystemHandle): Promise<boolean>;
    remove(): Promise<undefined>;
    getFile(): Promise<File>;
    getDirectoryHandle(name: string, options: {create: true}): Promise<FileSystemHandle>;
    getFileHandle(name: string, options: {create: true}): Promise<FileSystemHandle>;
    createWritable(): Promise<FileSystemWritableFileStream>;
    values(): AsyncIterable<FileSystemHandle>;
    resolve(possibleDescendant: FileSystemHandle): Promise<Array<string>>;
    queryPermission(options: {mode: 'read' | 'readwrite'}): Promise<'prompt' | 'granted' | 'denied'>;
    requestPermission(options: {mode: 'read' | 'readwrite'}): Promise<'prompt' | 'granted' | 'denied'>;
  }

  interface FileSystemWritableFileStream {
    write(data: Blob): Promise<undefined>;
    close(): Promise<undefined>;
  }

  interface ShowOpenFilePickerOptions {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: Array<{
      description?: string;
      accept: Record<string, string | Array<string>>;
    }>;
  }

  interface ShowDirectoryPickerOptions {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: string;
  }

  interface DataTransferItem {
    getAsFileSystemHandle(): Promise<FileSystemHandle>;
  }

  class OffscreenCanvas extends HTMLCanvasElement {
    constructor(width: number, height: number);
  }
  
  /* endregion */
  
  /* region 自定义 */

  interface File {
    path: string;
  }
  
  interface Array<T> {
    shuffle(): void;
    remove(element: T): void;
    removeIf(predicate: (element: T) => boolean): void;
  }
  
  interface String {
    hash(): number;
  }
  
  /* endregion */
}

export {};
