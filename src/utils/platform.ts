/**
 * 平台键
 */
export type PlatformKeys = 'ios' | 'android' | 'windows' | 'unknown';

/**
 * 平台定义
 */
export interface Platform extends Readonly<Partial<Record<PlatformKeys, boolean>>> {
  readonly key: PlatformKeys;
  readonly name: string;
  readonly mobile: boolean;
  readonly wallpaper?: boolean;
  readonly standalone?: boolean;
  readonly static?: boolean;
  readonly hasFsApi?: boolean;
}

/**
 * 平台列表
 */
export const platforms = (() => {
  const client_standalone: Omit<Platform, 'key' | 'name' | 'mobile'> = {
    wallpaper: Object.keys(window).some(k => k.match(/^wallpaper/)),
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    static: location.protocol === 'file:',
    hasFsApi: window.isSecureContext
      && 'FileSystemHandle' in window
      && 'showOpenFilePicker' in window
      && 'showDirectoryPicker' in window
      && 'getAsFileSystemHandle' in DataTransferItem.prototype
  };

  const platforms: Record<PlatformKeys, Platform> = {
    ios: {key: 'ios', name: 'iOS', mobile: true, ...client_standalone},
    android: {key: 'android', name: 'Android', mobile: true, ...client_standalone},
    windows: {key: 'windows', name: 'Windows', mobile: false, ...client_standalone},
    unknown: {key: 'unknown', name: 'Unknown', mobile: false, ...client_standalone}
  };

  for (const key in platforms) {
    const p = platforms[key] as Platform;
    p[key] = true;
    platforms[key] = Object.freeze(p);
  }

  return Object.freeze(platforms);
})();

/**
 * 平台
 */
export default (function () {
  let platform: Platform;
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    platform = platforms.ios;
  } else if (/(Android)/i.test(navigator.userAgent)) {
    platform = platforms.android;
  } else if (/(Windows)/i.test(navigator.userAgent)) {
    platform = platforms.windows;
  } else {
    platform = platforms.unknown;
  }
  console.log('平台信息', platform);
  return platform;
})();
