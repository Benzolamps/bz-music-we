import '@/assets/icons';
import SvgIcon from '@/components/common/SvgIcon.vue';
import AnimationRunner from '@/utils/animation_runner';
import {Vue} from 'vue-property-decorator';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import {attrSeparator, formatDelta, formatFileSize, sleep} from '@/utils/common_utils';
import {VNode} from 'vue';
import Toast from '@/components/common/Toast.vue';
import PlayerSettings from '@/components/service/player_settings';
import store from '@/components/service/store';
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
  public readonly inputAttrs = {
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: 'false'
  };
  public readonly isAdmin = (store.userName as string)?.startsWith('user') === false;
}

/**
 * 组件基类
 */
export default class BaseComponent extends Vue {
  private static readonly staticData = Vue.observable(new BaseComponentStaticData());

  static {
    Vue.component('SvgIcon', SvgIcon);
    Vue.filter('fileSize', formatFileSize);
    Vue.filter('delta', formatDelta);
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

export default interface BaseComponent extends BaseComponentStaticData {}

export const bus = new BaseComponent();
