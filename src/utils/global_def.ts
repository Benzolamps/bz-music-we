﻿import {defaultLrcStyles} from '@/components/service/player_settings';

declare global {
  interface Window {
    lrcStyles: typeof defaultLrcStyles;
    wallpaperProperties: WallpaperProperties;
    wallpaperPropertyListener: WallpaperPropertyListener;
  }

  interface Navigator {
    userActivation: {
      hasBeenActive: boolean;
      isActive: boolean;
    };
  }

  interface Array<T> {
    shuffle(): void;
  }

  interface HTMLAudioElement {
    preservesPitch: boolean;
  }

  class OffscreenCanvas extends HTMLCanvasElement {
    constructor(width: number, height: number);
  }

  interface WallpaperProperties {
    fps: number;
    language: string;
    taskbar_position: 'bottom' | 'top' | 'left' | 'right';
    taskbar_length: number;
  }

  interface WallpaperPropertyListener {
    applyGeneralProperties(props: Record<string, string>): void;
    applyUserProperties(props: Record<string, {value: string}>): void;
  }
}
