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

const wallpaperProperties: WallpaperProperties = {
  fps: 0,
  language: '',
  clipboard: '',
  taskbar_position: 'bottom',
  taskbar_length: 0
};

if (platform.wallpaper) {
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
  
  Object.defineProperty(window, 'wallpaperPropertyListener', {get: () => wallpaperPropertyListener});
  console.log('Wallpaper Engine初始化完毕', wallpaperProperties, wallpaperPropertyListener);
}

export default wallpaperProperties;
