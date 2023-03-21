import '@/assets/icons';
import SvgIcon from '@/components/common/SvgIcon.vue';
import AnimationRunner from '@/utils/animation_runner';
import Component from 'vue-class-component';
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

interface BaseComponentStaticData {
  $toast: Toast['show'];
  musicStorage: MusicStorage;
  musicService: MusicService;
  musicVisualCore: MusicVisualCore;
  lrcContext: LrcContext;
  lrcStyles: typeof defaultLrcStyles;
  visualStyles: typeof defaultVisualStyles;
  animationRunner: AnimationRunner;
}

/**
 * 组件基类
 */
@Component({components: {SvgIcon}})
export default class BaseComponent extends Vue implements BaseComponentStaticData {
  protected readonly attrSeparator = attrSeparator;

  private static readonly staticData: BaseComponentStaticData = Vue.observable({
    $toast: null,
    musicStorage: null,
    musicService: null,
    musicVisualCore: null,
    lrcContext: null,
    lrcStyles: defaultLrcStyles,
    visualStyles: defaultVisualStyles,
    animationRunner: new AnimationRunner()
  });

  public wallpaperProperties = wallpaperProperties;
  public messages = messages;

  private readonly isAdmin = (store.userName as string)?.startsWith('user') === false;

  static {
    Vue.filter('fileSize', formatFileSize);
    Vue.filter('delta', formatDelta);
  }

  public get $toast() {
    return BaseComponent.staticData.$toast;
  }

  public set $toast(value) {
    BaseComponent.staticData.$toast = value;
  }

  public get musicStorage() {
    return BaseComponent.staticData.musicStorage;
  }

  public set musicStorage(value) {
    BaseComponent.staticData.musicStorage = value;
  }

  public get musicService() {
    return BaseComponent.staticData.musicService;
  }

  public set musicService(value) {
    BaseComponent.staticData.musicService = value;
  }

  public get musicVisualCore() {
    return BaseComponent.staticData.musicVisualCore;
  }

  public set musicVisualCore(value) {
    BaseComponent.staticData.musicVisualCore = value;
  }

  public get lrcContext() {
    return BaseComponent.staticData.lrcContext;
  }

  public set lrcContext(value) {
    BaseComponent.staticData.lrcContext = value;
  }

  public get lrcStyles() {
    return BaseComponent.staticData.lrcStyles;
  }

  public set lrcStyles(value) {
    BaseComponent.staticData.lrcStyles = value;
  }

  public get visualStyles() {
    return BaseComponent.staticData.visualStyles;
  }

  public set visualStyles(value) {
    BaseComponent.staticData.visualStyles = value;
  }

  public get animationRunner() {
    return BaseComponent.staticData.animationRunner;
  }

  public set animationRunner(value) {
    BaseComponent.staticData.animationRunner = value;
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
