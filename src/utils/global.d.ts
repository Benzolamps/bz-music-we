import {LanguageKeys} from "@/assets/locale/messages";

declare global {
  interface Window {
    wallpaperProperties: WallpaperProperties;
    wallpaperPropertyListener: WallpaperPropertyListener;
  }

  interface Array<T> {
    shuffle(): void;
  }

  class OffscreenCanvas extends HTMLCanvasElement {
    constructor(width: number, height: number);
  }

  interface WallpaperProperties {
    fps: number;
    language: LanguageKeys;
    taskbar_position: 'bottom' | 'top' | 'left' | 'right';
    taskbar_length: number;
  }

  interface WallpaperPropertyListener {
    applyGeneralProperties(props: Record<string, string>): void;
    applyUserProperties(props: Record<string, {value: string}>): void;
  }
}

export {};
