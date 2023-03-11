import store from '@/components/service/store';
import {bus} from '@/components/common/BaseComponent';

import lrcFonts from '@/assets/fonts/lrc/index';
import messages from '@/assets/locale/messages';
import pfsc from '@/assets/fonts/PingFang-Jian-ChangGuiTi-2.ttf';
import {getBinaryData} from '@/utils/common_utils';

export const fontList: Array<{name: string, blob: Blob}> = [];

export const defaultLrcStyles = {
  font: '苹方简体',
  defaultColor: '#2C3E50',
  pastColor: '#FF1E90',
  futureColor: '#1E90FF',
  strokeColor: '#FAFAD2'
};

export const defaultVisualStyles = {
  displayRatio: 1,
  preset: '',
  starPresets: new Set<string>(),
  onlyShowStarPresets: false,
  random: false,
  interval: 30,
  showFps: false,
  lrcMode: 'caption' as 'scroll' | 'caption' | 'mix',
  state: {
    show: true,
    pip: false,
    canvas: false,
    video: false
  }
};

export default class PlayerSettings {
  public static getLrcStyles() {
    let result;
    if (store.lrcStyles) {
      result = store.lrcStyles as typeof defaultLrcStyles;
      if (result.font.startsWith('custom: ')) {
        result.font = '';
      }
    } else {
      result = defaultLrcStyles;
    }
    return result;
  }
  
  public static getVisualStyles() {
    if (store.visualStyles instanceof Object) {
      const visualStyles = store.visualStyles as typeof defaultVisualStyles;
      visualStyles.starPresets = new Set(visualStyles.starPresets ?? []);
      return {...(visualStyles), state: defaultVisualStyles.state} as typeof defaultVisualStyles;
    } else {
      return defaultVisualStyles;
    }
  }

  public static async load() {
    bus.$watch('lrcStyles', value => store.lrcStyles = value, {deep: true});

    bus.$watch('visualStyles', value => {
      const v = {...value};
      v.starPresets = Array.from(value.starPresets);
      store.visualStyles = v;
    }, {deep: true});

    fontList.push({
      name: '苹方简体',
      blob: await getBinaryData(pfsc)
    });
    for (const lrcFont of lrcFonts) {
      fontList.push({
        name: lrcFont.name,
        blob: await getBinaryData(lrcFont.url)
      });
    }

    let error = false;
    const callback = async (value?: string, oldValue?: string) => {
      if (bus.lrcStyles.font.startsWith('custom: ')) {
        return;
      }
      if (error) {
        error = false;
        return;
      }
      const font = fontList.find(f => f.name == value);
      await PlayerSettings.loadFontFace(font?.blob, value).catch(() => {
        error = true;
        bus.lrcStyles.font = oldValue;
      });
    };
    bus.$watch('lrcStyles.font', callback);
    await callback(bus.lrcStyles.font);
  }
  
  public static async loadCustomFont(file: File) {
    PlayerSettings.loadFontFace(file, file.name)
      .then(() => bus.lrcStyles.font = 'custom: ' + file.name)
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
      init && bus.$message({message: messages['lrc.apply_font_failed'] + messages.colon + name, type: 'error'});
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
}
