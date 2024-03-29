﻿import '@/assets/icons';
import wallpaperProperties from '@/components/common/wallpaper';
import AnimationRunner from '@/utils/animation_runner';
import Vue, {VNode} from 'vue';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import platform from '@/utils/platform';
import view from '@/utils/view';
import {attrSeparator, sleep} from '@/utils/common_utils';
import Toast from '@/components/common/Toast.vue';
import PlayerSettings from '@/components/service/player_settings';
import LrcContext from '@/components/service/lrc_context';
import MusicVisualCore from '@/components/visual/core';
import messages, {LanguageKeys} from '@/assets/locale/messages';

class BaseComponentStaticData {
  public readonly window = window;
  public readonly platform = platform;
  public readonly view = view;
  public readonly attrSeparator = attrSeparator;
  public readonly messages = messages;
  public readonly wallpaperProperties = wallpaperProperties;
  public page: 'MusicPlayer' | 'MusicLrcEditor' = 'MusicPlayer';
  public $toast: Toast['utilType'] = null;
  public musicStorage: MusicStorage = null;
  public musicService: MusicService = null;
  public musicVisualCore: MusicVisualCore = null;
  public lrcContext: LrcContext = null;
  public lrcStyles = PlayerSettings.defaultLrcStyles;
  public visualStyles = PlayerSettings.defaultVisualStyles;
  public visualStates = PlayerSettings.defaultVisualStates;
  public visualActions = PlayerSettings.defaultVisualActions;

  public readonly animationRunner = new AnimationRunner();
  public readonly audioContext = new AudioContext();
  public readonly inputAttrs = {
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: 'false'
  };
}

/**
 * 组件基类
 */
class BaseComponent extends Vue {
  private static readonly staticData = Vue.observable(new BaseComponentStaticData());

  static {
    const properties = Object.getOwnPropertyDescriptors(this.staticData);
    Object.defineProperties(this.prototype, properties);
  }

  public get language(): LanguageKeys {
    const nativeLanguage = this.wallpaperProperties.language || navigator.language;
    if (nativeLanguage.match(/(^en$)|(^en-)/)) {
      return 'en';
    } else if (nativeLanguage.match(/(^zh$)|(^zh-)/)) {
      return 'zh';
    }
    return 'en';
  }

  private _abortSignal: AbortSignal = null;

  public get abortSignal() {
    return this._abortSignal ??= (() => {
      const abortController = new AbortController();
      this.$once('hook:beforeDestroy', () => abortController.abort());
      return abortController.signal;
    })();
  }

  public $sleep(timeout: number) {
    return sleep(timeout);
  }
}

interface BaseComponent extends BaseComponentStaticData {
  beforeCreate(): void;
  created(): void;
  beforeMount(): void;
  mounted(): void;
  beforeDestroy(): void;
  destroyed(): void;
  render(): VNode;
}

export default BaseComponent;
