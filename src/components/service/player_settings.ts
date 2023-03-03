import store from '@/components/service/store';
import {bus} from '@/components/common/BaseComponent';

import lrcFonts from '@/assets/fonts/lrc/index';

export const fontList: Array<{name: string, blob: Blob}> = [];

export const defaultLrcStyles = {
  font: '',
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
    for (const lrcFont of lrcFonts) {
      fontList.push({
        name: lrcFont.name,
        blob: await (await fetch(lrcFont.url)).blob()
      });
    }
    bus.$watch('lrcStyles', value => {
      store.lrcStyles = value;
    }, {deep: true});
    bus.$watch('visualStyles', value => {
      const v = {...value};
      v.starPresets = Array.from(value.starPresets);
      store.visualStyles = v;
    }, {deep: true});
    let error = false;
    bus.$watch('lrcStyles.font', async (value, oldValue) => {
      if (bus.lrcStyles.font.startsWith('custom: ')) {
        return;
      }
      if (error) {
        error = false;
        return;
      }
      try {
        value ||= '苹方简体';
        bus.$toast('正在应用字体：' + value, true);
        await PlayerSettings.loadFontFace(fontList.find(f => f.name == value)?.blob);
        bus.$toast('应用字体成功：' + value);
      } catch (e) {
        bus.$toast('应用字体失败：' + value);
        error = true;
        bus.lrcStyles.font = oldValue;
      }
    });
    await PlayerSettings.loadFontFace(fontList.find(f => f.name == bus.lrcStyles.font)?.blob);
  }
  
  public static async loadCustomFont(file: File) {
    try {
      bus.$toast('正在应用字体：' + file.name, true);
      await PlayerSettings.loadFontFace(file);
      bus.lrcStyles.font = 'custom: ' + JSON.stringify(file);
      bus.$toast('应用字体成功：' + file.name);
    } catch (e) {
      bus.$toast('应用字体失败：' + file.name);
    }
  }

  private static async loadFontFace(blob?: Blob) {
    if (!blob) {
      document.fonts.forEach(f => f.family === 'LrcFont' && document.fonts.delete(f));
      return;
    }
    let fontFace = new FontFace('LrcFont', await blob.arrayBuffer());
    fontFace = await fontFace.load();
    document.fonts.forEach(f => f.family === 'LrcFont' && document.fonts.delete(f));
    document.fonts.add(fontFace);
  }
}
