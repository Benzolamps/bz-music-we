import {Vue} from 'vue-property-decorator';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import {attrSeparator, formatDelta, formatFileSize, sleep} from '@/utils/common_utils';
import {VNode} from 'vue';
import Toast from '@/components/common/Toast.vue';
import {defaultLrcStyles, defaultVisualStyles} from '@/components/service/player_settings';
import store from '@/components/service/store';
import LrcContext from '@/components/service/lrc_context';
import MusicVisualCore from '@/components/visual/core';
import wallpaperProperties from '@/utils/env';
import messages from '@/assets/locale/messages';

/**
 * 组件基类
 */
export default class BaseComponent extends Vue {
  protected readonly attrSeparator = attrSeparator;

  private static _musicStorage: MusicStorage;
  private static _musicService: MusicService;
  private static _toast: Toast['utilType'];
  private static _lrcStyles = defaultLrcStyles;
  private static _visualStyles = defaultVisualStyles;
  private static _lrcContext: LrcContext;
  private static _musicVisualCore: MusicVisualCore;

  public wallpaperProperties = wallpaperProperties;
  public messages = messages;

  private isAdmin = false === (store.userName as string)?.startsWith('user');

  static {
    Vue.filter('fileSize', formatFileSize);
    Vue.filter('delta', formatDelta);
  }

  public get musicStorage(): MusicStorage {
    return BaseComponent._musicStorage || {} as MusicStorage;
  }

  protected set musicStorage(value: MusicStorage) {
    BaseComponent._musicStorage = value;
  }

  public get musicService() {
    return BaseComponent._musicService || {} as MusicService;
  }

  protected set musicService(value: MusicService) {
    BaseComponent._musicService = value;
  }

  public get lrcContext() {
    return BaseComponent._lrcContext || {} as LrcContext;
  }

  protected set lrcContext(value: LrcContext) {
    BaseComponent._lrcContext = value;
  }

  public get musicVisualCore() {
    return BaseComponent._musicVisualCore || {} as MusicVisualCore;
  }

  public set musicVisualCore(value: MusicVisualCore) {
    BaseComponent._musicVisualCore = value;
  }

  public get lrcStyles() {
    return BaseComponent._lrcStyles;
  }

  protected set lrcStyles(value) {
    BaseComponent._lrcStyles = value;
  }

  public get visualStyles() {
    return BaseComponent._visualStyles;
  }

  protected set visualStyles(value) {
    BaseComponent._visualStyles = value;
  }

  public get $toast(): Toast['utilType'] {
    return BaseComponent._toast || {} as Toast['utilType'];
  }

  protected set $toast(value: Toast['utilType']) {
    BaseComponent._toast = value;
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

export const bus = new BaseComponent();
