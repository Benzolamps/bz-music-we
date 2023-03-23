import '@/assets/icons';
import SvgIcon from '@/components/common/SvgIcon.vue';
import AnimationRunner from '@/utils/animation_runner';
import Vue from 'vue';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import {attrSeparator, formatDelta, formatFileSize, sleep} from '@/utils/common_utils';
import {VNode} from 'vue';
import Toast from '@/components/common/Toast.vue';
import PlayerSettings from '@/components/service/player_settings';
import LrcContext from '@/components/service/lrc_context';
import MusicVisualCore from '@/components/visual/core';
import wallpaperProperties from '@/utils/env';
import messages from '@/assets/locale/messages';

class BaseComponentStaticData {
  public readonly window = window;
  public readonly attrSeparator = attrSeparator;
  public readonly messages = messages;
  public readonly wallpaperProperties = wallpaperProperties;
  public $toast: Toast['show'] = null;
  public musicStorage: MusicStorage = null;
  public musicService: MusicService = null;
  public musicVisualCore: MusicVisualCore = null;
  public lrcContext: LrcContext = null;
  public lrcStyles = PlayerSettings.defaultLrcStyles;
  public visualStyles = PlayerSettings.defaultVisualStyles;
  public readonly animationRunner = new AnimationRunner();
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

  private _abortSignal: AbortSignal = null;

  public get abortSignal(): AbortSignal {
    return this._abortSignal ??= (() => {
      const abortController = new AbortController();
      this.$once('hook:beforeDestroy', () => abortController.abort());
      return abortController.signal;
    })();
  }

  public beforeCreate() {}
  public created() {}
  public beforeMount() {}
  public mounted() {}
  public beforeDestroy() {}
  public destroyed() {}
  public render() : VNode | void {}

  public $sleep(timeout: number) {
    return sleep(timeout);
  }
}

interface BaseComponent extends BaseComponentStaticData {}

export default BaseComponent;
