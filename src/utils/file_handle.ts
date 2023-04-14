/* region DataTransfer */

import {bus} from '@/components/common/common';
import platform from '@/utils/platform';
import mime from 'mime-types';

export function readDataTransfer(dataTransfer: DataTransfer): Promise<Array<File | FileSystemHandle>> {
  const items = Array.from(dataTransfer.items).filter(item => item.kind === 'file');
  if (platform.hasFsApi) {
    return Promise.all(items.map(item => item.getAsFileSystemHandle()));
  } else {
    return Promise.all(items.map(readDataTransferItem)).then(res => res.flat());
  }
}

async function readDataTransferItem(dataTransferItem: DataTransferItem): Promise<Array<File>> {
  if ('webkitGetAsEntry' in dataTransferItem) {
    const entry = dataTransferItem.webkitGetAsEntry();
    if (entry.isDirectory) {
      return readDirectoryEntry(entry as FileSystemDirectoryEntry);
    }
  }
  return [dataTransferItem.getAsFile()];
}

function readEntry(entry: FileSystemEntry): Promise<Array<File>> {
  if (entry.isDirectory) {
    return readDirectoryEntry(entry as FileSystemDirectoryEntry);
  } else {
    return readFileEntry(entry as FileSystemFileEntry);
  }
}

async function readDirectoryEntry(entry: FileSystemDirectoryEntry): Promise<Array<File>> {
  const reader = entry.createReader();
  const files = new Array<File>();
  let hasMore = true;
  while (hasMore) {
    await new Promise<void>((resolve, reject) => {
      reader.readEntries(async entries => {
        const fs = await Promise.all(entries.map(readEntry));
        files.push(...fs.flat());
        resolve();
        hasMore = entries.length > 0;
      }, reject);
    });
  }
  return files;
}

function readFileEntry(entry: FileSystemFileEntry): Promise<Array<File>> {
  return new Promise<Array<File>>((resolve, reject) => {
    entry.file(file => {
      if (!file.path && !file.webkitRelativePath) {
        file.path = entry.fullPath;
      }
      resolve([file]);
    }, reject);
  });
}

/* endregion */

/* region FileSystemHandle */

function readHandle(handle: FileSystemHandle): Promise<Array<FileSystemHandle>> {
  if (handle.kind === 'directory') {
    return readDirectoryHandle(handle);
  } else {
    return Promise.resolve([handle]);
  }
}

export async function readDirectoryHandle(dir: FileSystemHandle): Promise<Array<FileSystemHandle>> {
  const files = new Array<FileSystemHandle>();
  await grantPermission(dir);
  for await (const handle of dir.values()) {
    files.push(...await readHandle(handle));
  }
  return files;
}

/* endregion */

/* File Picker */
export async function chooseFile(category: 'audio' | 'font') {
  const multiple = category !== 'font';
  if (window.isSecureContext && 'showOpenFilePicker' in window) {
    let types: ShowOpenFilePickerOptions['types'];
    if (category === 'audio') {
      types = [{
        description: '音频/歌词文件',
        accept: {
          'audio/*': [],
          '*/*': '.lrc'
        }
      }];
    } else {
      types = [{
        description: '字体文件',
        accept: {
          'font/*': ['.ttf', '.otf', '.woff', '.woff2']
        }
      }];
    }
    return window.showOpenFilePicker({
      multiple: category !== 'font',
      types,
      excludeAcceptAllOption: true
    });
  } else {
    let accept;
    if (category === 'audio') {
      accept = 'audio/*,.lrc';
    } else {
      accept = '.ttf,.otf,.woff,.woff2';
    }
    return chooseFileByInput(accept, multiple, false);
  }
}

export function chooseFolder() {
  if (window.isSecureContext && 'showDirectoryPicker' in window) {
    return window.showDirectoryPicker({id: 'music', mode: 'read', startIn: 'music'}).then(Array.of);
  } else {
    return chooseFileByInput('', false, true);
  }
}

let rejectFn: () => void;

function chooseFileByInput(accept: string, multiple: boolean, webkitDirectory: boolean) {
  rejectFn?.();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = platform.ios ? '' : accept;
  input.multiple = multiple;
  input.webkitdirectory = webkitDirectory;
  input.dispatchEvent(new MouseEvent('click'));
  return new Promise<Array<File>>((resolve, reject) => {
    input.addEventListener('change', () => {
      if (input.files.length) {
        resolve(Array.from(input.files));
      } else {
        reject(new Error('empty'));
        rejectFn = null;
      }
    });
    rejectFn = reject;
  });
}

/* endregion */

/* region resolve */

export interface FileEntity {
  id: number;
  name: string;
  path: string;
  type: string;
  parentId?: number;
  parentHandle?: FileSystemHandle;
  size: number;
  timestamp: number;
  handle: FileSystemHandle;
  blob: Blob;
  show?: boolean;
}

export function resolveFiles(files: Array<File>): Array<FileEntity> {
  return files.map(resolveFile);
}

export function resolveFile(file: File): FileEntity {
  const path = file.path || file.webkitRelativePath || file.name;
  return {
    id: path.hash(),
    name: file.name,
    path,
    timestamp: file.lastModified,
    type: getFileType(path),
    size: file.size,
    handle: null,
    blob: file
  };
}

export async function resolveFileHandles(files: Array<FileSystemHandle>, parent?: FileEntity, playlist = false) {
  const promises = files.map(async handle => {
    if (handle.kind === 'directory') {
      return resolveDirectoryHandle(handle);
    } else {
      return resolveFileHandle(handle, parent, playlist);
    }
  });
  return Promise.all(promises);
}

export async function resolveFileHandle(handle: FileSystemHandle, parent: FileEntity, playlist: boolean): Promise<FileEntity> {
  await grantPermission(handle);
  const file = await handle.getFile();
  let id: number, path: string, paths: Array<string>;
  if (file.path || file.webkitRelativePath) {
    path = file.path || file.webkitRelativePath;
  } else if (paths = await parent?.handle.resolve(handle)) {
    path = parent.path + '/' + paths.join('/');
  } else {
    path = file.name;
  }

  if (playlist) {
    id = JSON.stringify([parent.id, path]).hash();
  } else {
    id = JSON.stringify([Date.now(), Math.random()]).hash();
  }
  return {
    id,
    name: file.name,
    path,
    parentId: parent?.id,
    parentHandle: parent?.handle,
    timestamp: file.lastModified,
    type: getFileType(path),
    size: file.size,
    handle,
    blob: null
  };
}

export function resolveDirectoryHandle(handle: FileSystemHandle): FileEntity {
  return {
    id: JSON.stringify([Date.now(), Math.random()]).hash(),
    name: handle.name,
    path: handle.name,
    timestamp: Date.now(),
    type: 'directory',
    size: 0,
    handle,
    blob: null,
    show: true
  };
}

export async function writeHandle(handle: FileSystemHandle, blob: Blob, parent: FileSystemHandle, paths: Array<string>) {
  let resHandle = handle;
  if (!handle) {
    resHandle = parent;
    for (let i = 0; i < paths.length; i++) {
      if (i < paths.length - 1) {
        resHandle = await resHandle.getDirectoryHandle(paths[i], {create: true});
      } else {
        resHandle = await resHandle.getFileHandle(paths[i], {create: true});
      }
    }
  }
  const stream = await resHandle.createWritable();
  await stream.write(blob);
  await stream.close();
}

function getFileType(path: string) {
  return path.match(/\.lrc$/i) ? 'text/lrc' : mime.lookup(path) || '';
}

export async function readAsBlob(file: FileEntity) {
  if (file?.blob) {
    return Promise.resolve(file.blob);
  } else if (file?.handle) {
    await grantPermission(file.parentHandle || file.handle);
    return file.handle.getFile();
  } else {
    return new Blob();
  }
}

let promise: Promise<void>;

export async function grantPermission(fileHandle: FileSystemHandle) {
  await promise;
  promise = (async () => {
    let granted = await fileHandle.queryPermission({mode: 'read'}) === 'granted';
    if (!granted && platform.wallpaper) {
      await bus.$alert('为了能播放上次选择的歌曲, 请设置CEF命令行为<br/>--enable-experimental-web-platform-features', {
        type: 'warning',
        dangerouslyUseHTMLString: true
      });
      throw new Error('Permission denied');
    }
    while (!granted) {
      if (!navigator.userActivation.isActive) {
        await bus.$alert(`请对“${fileHandle.name}”进行授权`, {type: 'warning'}).catch(() => 0);
      }
      await bus.$sleep(100);
      granted = await fileHandle.requestPermission({mode: 'read'}) === 'granted';
      await bus.$sleep(500);
    }
  })();
  await promise;
}

/* endregion */
