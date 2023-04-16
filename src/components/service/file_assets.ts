import messages from '@/assets/locale/messages';
import {bus} from '@/components/common/common';
import db from '@/utils/db';
import {chooseFolder, FileEntity, readAsBlob, readDirectoryHandle, resolveDirectoryHandle, resolveFileHandles, resolveFiles} from '@/utils/file_handle';
import platform from '@/utils/platform';

const files = new Array<FileEntity>();

export async function loadFileAssets() {
  if (platform.wallpaper || !platform.static) {
    return;
  }

  files.length = 0;

  if (await db.table('files').count() > 0) {
    files.push(...await db.table('files').toArray());
    return;
  }
  
  while (!files.length) {
    await bus.$alert(messages['file.assets']);
    try {
      const res = await chooseFolder();
      if (res.some(f => f instanceof File)) {
        files.push(...resolveFiles(res as Array<File>));
      } else {
        const dirHandle = res[0] as FileSystemHandle;
        const handles = await readDirectoryHandle(dirHandle);
        const dirEntity = await resolveDirectoryHandle(dirHandle);
        files.push(...await resolveFileHandles(handles, dirEntity));
      }
    } catch (e) {
      console.dir(e);
    }
  }
  for (const file of files) {
    file.blob = await readAsBlob(file);
    delete file.handle;
    delete file.parentId;
    delete file.parentHandle;
    file.path = file.path.substring(file.path.indexOf('/') + 1);
  }
  await db.table('files').clear();
  await db.table('files').bulkPut(files);
}

export async function clearFileAssets() {
  await db.table('files').clear();
}

export default files;
