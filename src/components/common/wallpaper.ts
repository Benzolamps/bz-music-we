import {bus} from "@/components/common/common";
import platform from '@/utils/platform';

interface WallpaperProperties {
  fps: number;
  language: string;
  taskbar_position: 'bottom' | 'top' | 'left' | 'right';
  taskbar_length: number;
  clipboard: string;
}

interface WallpaperPropertyListener {
  applyGeneralProperties(props: Record<string, string>): void;
  applyUserProperties(props: Record<string, {value: string}>): void;
}

const wallpaperPropertiesName = 'wallpaperProperties';
const wallpaperPropertyListenerName = 'wallpaperPropertyListener';

const wallpaperProperties: WallpaperProperties = window.top[wallpaperPropertiesName] ??= {
  fps: 0,
  language: '',
  clipboard: '',
  taskbar_position: 'bottom',
  taskbar_length: 0
};

if (window.top === window && platform.wallpaper) {
  const wallpaperPropertyListener: WallpaperPropertyListener = {
    applyGeneralProperties(props) {
      for (const key in props) {
        wallpaperProperties[key] = props[key];
      }
    },
    applyUserProperties(props) {
      for (const key in props) {
        wallpaperProperties[key] = props[key].value;
      }
    }
  };
  
  window[wallpaperPropertyListenerName] = wallpaperPropertyListener;
  console.log('Wallpaper Engine初始化完毕', wallpaperProperties, wallpaperPropertyListener);
}

export default wallpaperProperties;
