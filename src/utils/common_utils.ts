import pfsc from '@/assets/fonts/PingFang-Jian-ChangGuiTi-2.ttf';
import jbm from '@/assets/fonts/JetBrainsMono-Regular.ttf';
import {bus} from '@/components/common/common';

export const attrSeparator = '\u3000';

Array.prototype.shuffle = function () {
  let i = this.length;
  while (i) {
    const j = Math.floor(Math.random() * i--);
    [this[j], this[i]] = [this[i], this[j]];
  }
};

export async function loadBasicFonts() {
  let blob = await getBinaryData(pfsc);
  let fontFace = new FontFace('PingFang SC', await blob.arrayBuffer());
  fontFace = await fontFace.load();
  document.fonts.add(fontFace);
  blob = await getBinaryData(jbm);
  fontFace = new FontFace('JetBrains Mono', await blob.arrayBuffer());
  fontFace = await fontFace.load();
  document.fonts.add(fontFace);
}

export function getFileBaseName(fileName: string) {
  let result = fileName;
  result = result.replace(/.*\//, '');
  result = result.replace(/\.[^.]*$/, '');
  return result;
}


export interface KeyMapping {
  code?: string | RegExp;
  type?: keyof DocumentEventMap | string;
  target?: EventTarget;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler?: () => void;
}

export const keyMappings = new Set<KeyMapping>();

export function registerEvents() {
  const signal = bus.abortSignal;

  const args: [(ev: Event) => void, AddEventListenerOptions] = [
    event => {
      if (event.type !== 'mousedown' || !(event instanceof MouseEvent) || event.button === 1 || event.button === 2) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    {capture: true, signal}
  ];
  document.addEventListener('drag', ...args);
  document.addEventListener('drop', ...args);
  document.addEventListener('dragenter', ...args);
  document.addEventListener('dragover', ...args);
  document.addEventListener('dragstart', ...args);
  document.addEventListener('contextmenu', ...args);
  document.addEventListener('mousedown', ...args);
  document.addEventListener('dblclick', ...args);

  const keyArgs: [(ev: KeyboardEvent) => void, AddEventListenerOptions] = [
    event => {
      let result = false;
      keyMappings.forEach(value => {
        if ((value.code === event.code || value.code instanceof RegExp && event.code.match(value.code))
          && value.type === event.type
          && (!value.target || event.composedPath().includes(value.target))
          && !!value.ctrlKey === event.ctrlKey
          && !!value.shiftKey === event.shiftKey
          && !!value.altKey === event.altKey
        ) {
          result = true;
          value.handler?.call(null);
        }
      });
      if (result) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    {capture: true, signal}
  ];
  document.addEventListener('keydown', ...keyArgs);
  document.addEventListener('keyup', ...keyArgs);
}

export function sleep(timeout: number) {
  return new Promise<void>(handler => window.setTimeout(handler, timeout));
}

export function formatFileSize(value: number) {
  if (value === 0) {
    return '0 bytes';
  }
  const k = 1024;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(value) / Math.log(k));
  return (value / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * 格式化时长
 * @param delta {number} 秒数
 * @returns {string}
 */
export function formatDelta(delta: number) {
  let h = delta;
  const s = (h % 60).toFixed(2);
  h = Math.floor(h / 60);
  const m = h % 60;
  h = Math.floor(h / 60);
  let str = '';
  if (h > 0) {
    str += (h < 10 ? '0' + h : h) + ':';
  }
  str += (m < 10 ? '0' + m : m) + ':';
  str += parseDelta(s) < 10 ? '0' + s : s;
  return str;
}

export function parseDelta(delta: string) {
  const parts = delta.split(':');
  let s = parseFloat(parts.pop());
  const m = parseInt(parts.pop());
  const h = parseInt(parts.pop());
  if (m) {
    s += m * 60;
  }
  if (h) {
    s += h * 60;
  }
  return s;
}

export function getTextData(url: string) {
  return fetch(url).then(res => res.text());
}

export function getBinaryData(url: string) {
  return fetch(url).then(res => res.blob());
}

export function getAbsoluteUrl(url: string) {
  return new URL(url, location.origin).toString();
}
