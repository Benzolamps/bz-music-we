import {Music} from '@/components/service/music';
import {getBinaryData} from '@/utils/common_utils';
import blazorZip from '@/assets/zip/bz-music-blazor.zip';
import JSZip from 'jszip';
import mime from 'mime-types';

declare const DotNet: {
  invokeMethodAsync(asm: 'bz-music-blazor', method: 'readMetadata', fileName: string, data: Uint8Array): Promise<Music>;
};

declare const Blazor: {
  start(options: {
    loadBootResource: (type: string, file: string) => Promise<Response> | string;
  }): Promise<void>;
};

export default async function readMetadata(file: File) {
  const buffer = await file.arrayBuffer();
  return DotNet.invokeMethodAsync(
    'bz-music-blazor',
    'readMetadata',
    file.name,
    new Uint8Array(buffer)
  );
}

export async function initBlazor() {
  const zipBlob = await getBinaryData(blazorZip);
  const zip = await JSZip.loadAsync(zipBlob);
  const zipEntries = Object.entries(zip.files);
  const zipPromises = zipEntries.map(async ([key, value]) => [key, await value.async('blob')] as const);
  const zipResult = Object.fromEntries(await Promise.all(zipPromises));
  const jsBlob = zipResult['blazor.webassembly.js'];
  const script = document.createElement('script');
  script.src = URL.createObjectURL(jsBlob);
  script.setAttribute('autostart', 'false');
  document.body.append(script);
  await new Promise((resolve, reject) => {
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
  });
  await Blazor.start({
    loadBootResource(type, file) {
      const blob = new Blob([zipResult[file]], {type: mime.lookup(file) || ''});
      if (type === 'dotnetjs') {
        return URL.createObjectURL(blob);
      } else {
        return Promise.resolve(new Response(blob));
      }
    }
  });
}
