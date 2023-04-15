import store from '@/components/service/store';
import {bus} from '@/components/common/common';

import lrcFonts from '@/assets/fonts/lrc/index';
import messages from '@/assets/locale/messages';
import pfsc from '@/assets/fonts/PingFang-Jian-ChangGuiTi-2.ttf';
import {getBinaryData, getFileBaseName, keyMappings} from '@/utils/common_utils';
import platform from '@/utils/platform';

type LrcMode = 'scroll' | 'caption' | 'mix';

export default class PlayerSettings {
  public static readonly fontList: Array<{name: string, blob: Blob}> = [];

  public static readonly defaultLrcStyles = {
    font: '苹方简体',
    customFont: null as File,
    defaultColor: '#2c3e50',
    pastColor: '#ff1e90',
    futureColor: '#1e90ff',
    strokeColor: '#fafad2'
  };

  public static readonly defaultVisualStyles = {
    displayRatio: 1,
    preset: '',
    starPresets: new Set<string>(),
    onlyShowStarPresets: false,
    random: false,
    interval: 30,
    showFps: false,
    overlay: true,
    lrcMode: 'caption' as LrcMode
  };
  
  public static readonly defaultVisualStates = {
    show: platform.wallpaper,
    pip: false,
    canvas: false,
    video: false,
    fullscreen: false,
    ftt: true
  };

  public static readonly defaultVisualActions = new Array<{
    name: string;
    tag?: string;
    enabled: boolean;
    value: boolean;
  }>();
  
  public static getLrcStyles() {
    let result;
    if (window.name === 'MusicLrcDesktop') {
      if (window.opener && window.opener.lrcStyles) {
        result = window.opener.lrcStyles;
      } else {
        result = {} as typeof this.defaultLrcStyles;
        for (const key in this.defaultLrcStyles) {
          Object.defineProperty(
            result,
            key,
            {get: () => store.lrcStyles && store.lrcStyles[key]}
          );
        }
      }
    } else {
      if (store.lrcStyles) {
        result = store.lrcStyles as typeof this.defaultLrcStyles;
      } else {
        result = JSON.parse(JSON.stringify(this.defaultLrcStyles));
      }
      store.lrcStyles = result;
    }
    return result;
  }

  public static getVisualStyles() {
    if (store.visualStyles instanceof Object) {
      const visualStyles = store.visualStyles as typeof this.defaultVisualStyles;
      visualStyles.starPresets = new Set(visualStyles.starPresets ?? []);
      return visualStyles as typeof this.defaultVisualStyles;
    } else {
      const visualStyles = JSON.parse(JSON.stringify(this.defaultVisualStyles));
      visualStyles.starPresets = new Set();
      return visualStyles;
    }
  }
  
  public static getVisualActions(): typeof this.defaultVisualActions {
    return [
      {
        name: '全屏模式',
        tag: '全屏',
        enabled: !platform.mobile && !platform.wallpaper,
        get value() {
          return bus.visualStates.fullscreen;
        },
        set value(v) {
          PlayerSettings.requestFullscreen();
        }
      },
      {
        name: '画中画模式',
        tag: '画中画',
        enabled: platform.pip,
        get value() {
          return bus.visualStates.pip;
        },
        set value(v) {
          bus.visualStates.pip = v;
        }
      },
      {
        name: '滚动歌词',
        tag: '滚动歌词',
        enabled: true,
        get value() {
          return bus.visualStyles.lrcMode !== 'caption';
        },
        set value(v) {
          PlayerSettings.changeLrcMode('scroll');
        }
      },
      {
        name: '3D歌词',
        tag: '3D歌词',
        enabled: true,
        get value() {
          return bus.visualStyles.lrcMode !== 'scroll';
        },
        set value(v) {
          PlayerSettings.changeLrcMode('caption');
        }
      },
      {
        name: '显示FPS',
        enabled: true,
        get value() {
          return bus.visualStyles.showFps;
        },
        set value(v) {
          bus.visualStyles.showFps = v;
        }
      },
      {
        name: '显示信息',
        enabled: !platform.wallpaper,
        get value() {
          return bus.visualStyles.overlay;
        },
        set value(v) {
          bus.visualStyles.overlay = v;
        }
      },
      {
        name: '使用FTT',
        enabled: true,
        get value() {
          return bus.visualStates.ftt;
        },
        set value(v) {
          bus.visualStates.ftt = v;
        }
      }
    ];
  }

  public static async load() {
    bus.$watch('lrcStyles', value => store.lrcStyles = value, {deep: true});

    bus.$watch('visualStyles', value => {
      const v = {...value};
      v.starPresets = Array.from(value.starPresets);
      store.visualStyles = v;
    }, {deep: true});

    this.fontList.push({
      name: '苹方简体',
      blob: await getBinaryData(pfsc)
    });
    for (const lrcFont of lrcFonts) {
      this.fontList.push({
        name: lrcFont.name,
        blob: await getBinaryData(lrcFont.url)
      });
    }

    let error = false;
    bus.$watch('lrcStyles.font', callback);

    if (bus.lrcStyles.customFont) {
      this.loadCustomFont(bus.lrcStyles.customFont);
    } else {
      await callback(bus.lrcStyles.font);
    }

    async function callback(value?: string, oldValue?: string) {
      if (bus.lrcStyles.font.startsWith('custom: ')) {
        return;
      }
      bus.lrcStyles.customFont = null;
      if (error) {
        error = false;
        return;
      }
      const font = PlayerSettings.fontList.find(f => f.name === value) ?? PlayerSettings.fontList[0];
      try {
        await PlayerSettings.loadFontFace(font.blob, value);
      } catch {
        error = true;
        bus.lrcStyles.font = oldValue;
      }
    }
    
    document.addEventListener('fullscreenchange', () => {
      bus.visualStates.fullscreen = !!document.fullscreenElement;
    });
    
    keyMappings.add({type: 'keyup', code: 'F11', handler: this.requestFullscreen});
    keyMappings.add({type: 'keydown', code: 'F11', handler: () => 0});
  }

  public static loadCustomFont(file: File) {
    const name = getFileBaseName(file.name);
    PlayerSettings.loadFontFace(file, name)
      .then(() => {
        bus.lrcStyles.font = 'custom: ' + name;
        bus.lrcStyles.customFont = file;
      })
      .catch(() => 0);
  }

  private static async loadFontFace(blob: Blob, name: string) {
    let init;
    try {
      let fontFace = new FontFace('LrcFont', await blob.arrayBuffer());
      fontFace = await fontFace.load();
      document.fonts.forEach(f => init = f.family === 'LrcFont' && document.fonts.delete(f));
      document.fonts.add(fontFace);
      init && bus.$message({message: messages['lrc.apply_font_success'] + messages.colon + name, type: 'success'});
    } catch (e) {
      bus.$message({message: messages['lrc.apply_font_failed'] + messages.colon + name, type: 'error'});
      throw e;
    }
  }

  public static starPreset(key: string) {
    if (bus.visualStyles.starPresets.has(key)) {
      bus.visualStyles.starPresets.delete(key);
      bus.$message({message: messages['visual.preset.unstar'] + messages.colon + key, type: 'success'});
    } else {
      bus.visualStyles.starPresets.add(key);
      bus.$message({message: messages['visual.preset.star'] + messages.colon + key, type: 'success'});
    }
    // vue无法监听Set集合的变更的解决方案
    bus.visualStyles.starPresets = new Set<string>(Array.from(bus.visualStyles.starPresets));
  }
  
  public static requestFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }
  
  public static changeLrcMode(mode: typeof this.defaultVisualStyles.lrcMode) {
    const map = new Map<string, LrcMode>([
      ['caption->caption', 'scroll'],
      ['scroll->caption', 'mix'],
      ['mix->caption', 'scroll'],
      ['caption->scroll', 'mix'],
      ['scroll->scroll', 'caption'],
      ['mix->scroll', 'caption']
    ]);
    bus.visualStyles.lrcMode = map.get(`${bus.visualStyles.lrcMode}->${mode}`) ?? mode;
  }
}
