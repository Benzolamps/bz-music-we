﻿import {bus} from '@/components/common/common';

export const attrSeparator = '\u3000';

String.prototype.hash = function () {
  let h = 5381;
  let index = this.length;
  while (index) {
    h = h * 33 ^ this.charCodeAt(--index);
  }
  return h >>> 0;
};

export function randomHash() {
  return JSON.stringify([Date.now(), Math.random()]).hash();
}

Array.prototype.shuffle = function () {
  let i = this.length;
  while (i) {
    const j = Math.floor(Math.random() * i--);
    [this[j], this[i]] = [this[i], this[j]];
  }
};

Array.prototype.remove = function (element) {
  let index = 0;
  while ((index = this.indexOf(element)) >= 0) {
    this.splice(index, 1);
  }
};

Array.prototype.removeIf = function (predicate) {
  let i = this.length;
  while (i--) {
    if (predicate(this[i])) {
      this.splice(i, 1);
    }
  }
};

export function getFileBaseName(fileName: string) {
  let result = fileName;
  result = result.replace(/.*\//, '');
  result = result.replace(/\.[^.]*$/, '');
  return result;
}

export interface KeyMapping {
  code?: string | RegExp;
  type?: keyof DocumentEventMap | string;
  triggerInEditor?: boolean;
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
  document.addEventListener('dragenter', ...args);
  document.addEventListener('dragover', ...args);
  document.addEventListener('dragstart', ...args);
  document.addEventListener('contextmenu', ...args);
  document.addEventListener('mousedown', ...args);
  document.addEventListener('dblclick', ...args);

  const keyArgs: [(ev: KeyboardEvent) => void, AddEventListenerOptions] = [
    event => {
      const activeElement = document.activeElement as HTMLElement;
      const focusInput = activeElement?.tagName === 'INPUT' || activeElement.isContentEditable;
      let result = false;
      for (const value of keyMappings) {
        if ((value.code === event.code || value.code instanceof RegExp && value.code.test(event.code))
          && value.type === event.type
          && (!value.target || event.composedPath().includes(value.target))
          && !!value.ctrlKey === event.ctrlKey
          && !!value.shiftKey === event.shiftKey
          && !!value.altKey === event.altKey
          && (value.triggerInEditor || !focusInput)
        ) {
          result = true;
          value.handler?.();
        }
      }
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
export function formatDelta(delta: number): string {
  const hours = Math.floor(delta / 3600); // 计算小时数
  const minutes = Math.floor(delta % 3600 / 60); // 计算分钟数
  const seconds = delta % 60; // 计算秒数
  const timeArr = new Array<string>(); // 初始化时间数组
  if (hours > 0) {
    timeArr.push(hours.toString().padStart(2, '0')); // 将小时数添加到时间数组中
  }
  timeArr.push(minutes.toString().padStart(2, '0')); // 将分钟数添加到时间数组中
  timeArr.push(seconds.toFixed(2).padStart(5, '0')); // 将秒数添加到时间数组中，并保留两位小数
  return timeArr.join(':'); // 将时间数组中的元素用冒号连接，并返回时间字符串
}

export function parseDelta(delta: string) {
  return delta.split(':').map(Number).reduce((a, b) => 60 * a + b, 0);
}

const remoteUrl = process.env.VUE_APP_REMOTE_URL;

export function getTextData(url: string) {
  const fetchUrl = remoteUrl ? new URL(url, remoteUrl).toString() : url;
  return fetch(fetchUrl).then(res => res.text());
}

export function getBinaryData(url: string) {
  const fetchUrl = remoteUrl ? new URL(url, remoteUrl).toString() : url;
  return fetch(fetchUrl).then(res => res.blob());
}

export async function safeGetBlobText(blob: Blob) {
  const replacementChar = '\uFFFD';
  if (!blob) {
    return '';
  }
  const textUtf8 = await blob.text();
  const countUtf8 = textUtf8.split(replacementChar).length - 1;
  if (countUtf8 === 0) {
    return textUtf8;
  }
  console.warn(`UTF-8 decode contains ${replacementChar}, try GBK`);
  const textDecoder = new TextDecoder('GBK');
  const textGbk = textDecoder.decode(await blob.arrayBuffer());
  const countGbk = textGbk.split(replacementChar).length - 1;
  countGbk > 0 && console.warn(`GBK decode contains ${replacementChar}`);
  return countGbk < countUtf8 ? textGbk : textUtf8;
}
