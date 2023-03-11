export const attrSeparator = '\u3000';

declare global {
  interface Array<T> {
    shuffle(): void;
  }
}

Array.prototype.shuffle = function () {
  let i = this.length;
  while (i) {
    const j = Math.floor(Math.random() * i--);
    [this[j], this[i]] = [this[i], this[j]];
  }
};

export function sleep(timeout: number) {
  return new Promise<void>(handler => setTimeout(handler, timeout));
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
  const s = (delta % 60).toFixed(2);
  delta = Math.floor(delta / 60);
  const m = delta % 60;
  delta = Math.floor(delta / 60);
  const h = delta;
  let str = '';
  if (h > 0) {
    str += (h < 10 ? ('0' + h) : h) + ':';
  }
  str += (m < 10 ? ('0' + m) : m) + ':';
  str += (parseDelta(s) < 10 ? ('0' + s) : s);
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

export async function getTextData(url: string) {
  return await (await fetch(url)).text();
}

export async function getBinaryData(url: string) {
  return await (await fetch(url)).blob();
}
