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

  private static staticData = Vue.observable(new class {
    musicStorage: MusicStorage;
    musicService: MusicService;
    toast: Toast['utilType'];
    lrcStyles = defaultLrcStyles;
    visualStyles = defaultVisualStyles;
    lrcContext: LrcContext;
    musicVisualCore: MusicVisualCore;
  });

  public wallpaperProperties = wallpaperProperties;
  public messages = messages;

  private isAdmin = false === (store.userName as string)?.startsWith('user');

  static {
    Vue.filter('fileSize', formatFileSize);
    Vue.filter('delta', formatDelta);
  }

  public get musicStorage(): MusicStorage {
    return BaseComponent.staticData.musicStorage;
  }

  protected set musicStorage(value: MusicStorage) {
    BaseComponent.staticData.musicStorage = value;
  }

  public get musicService() {
    return BaseComponent.staticData.musicService;
  }

  protected set musicService(value: MusicService) {
    BaseComponent.staticData.musicService = value;
  }

  public get lrcContext() {
    return BaseComponent.staticData.lrcContext;
  }

  protected set lrcContext(value: LrcContext) {
    BaseComponent.staticData.lrcContext = value;
  }

  public get musicVisualCore() {
    return BaseComponent.staticData.musicVisualCore;
  }

  public set musicVisualCore(value: MusicVisualCore) {
    BaseComponent.staticData.musicVisualCore = value;
  }

  public get lrcStyles() {
    return BaseComponent.staticData.lrcStyles;
  }

  protected set lrcStyles(value) {
    BaseComponent.staticData.lrcStyles = value;
  }

  public get visualStyles() {
    return BaseComponent.staticData.visualStyles;
  }

  protected set visualStyles(value) {
    BaseComponent.staticData.visualStyles = value;
  }

  public get $toast(): Toast['utilType'] {
    return BaseComponent.staticData.toast;
  }

  protected set $toast(value: Toast['utilType']) {
    BaseComponent.staticData.toast = value;
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
