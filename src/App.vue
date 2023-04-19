<template>
  <div id="app">
    <head-definition/>
    <div v-if="!platform.wallpaper" class="loading-background"/>
    <music-player v-if="page === 'MusicPlayer' && musicRegistered"/>
    <music-lrc-editor v-if="page === 'MusicLrcEditor' && musicRegistered"/>
    <toast/>
  </div>
</template>

<script lang="ts">
import {LanguageKeys} from '@/assets/locale/messages';
import MusicLrcEditor from '@/components/lrc/MusicLrcEditor.vue';
import HeadDefinition from '@/components/misc/HeadDefinition.vue';
import {initBlazor} from '@/components/service/blazor';
import {registerEvents} from '@/utils/common_utils';
import {Component, Watch} from 'vue-property-decorator';
import Toast from '@/components/common/Toast.vue';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import BaseComponent from '@/components/common/BaseComponent';
import Vue from 'vue';
import PlayerSettings from '@/components/service/player_settings';
import LrcContext from '@/components/service/lrc_context';
import MusicPlayer from '@/components/core/MusicPlayer.vue';

@Component({components: {HeadDefinition, MusicLrcEditor, MusicPlayer, Toast}})
export default class App extends BaseComponent {
  private musicRegistered = false;

  public override created() {
    registerEvents();
    this.registerWindowAttrs();
    let time = 0;
    const listener = async (event: Event & { prompt?: () => void }) => {
      event.preventDefault();
      // PWA安装窗口会因点击了别处而关闭，用户可能还未看到，如果500毫秒内弹窗关闭了，极有可能是误关，再次弹出
      if (time > 0 && Date.now() - time > 500) {
        window.removeEventListener('beforeinstallprompt', listener);
        return;
      }
      if (time === 0) {
        await this.$sleep(120000);
      }
      while (!navigator.userActivation.isActive) {
        await this.$sleep(0);
      }
      time = Date.now();
      event.prompt();
    };
    window.addEventListener('beforeinstallprompt', listener, {signal: this.abortSignal});
  }

  public override async mounted() {
    this.$toast.showLoading();
    await document.fonts.ready;

    await initBlazor();
    await this.registerMusic();
    this.musicRegistered = true;
    await this.$sleep(100);
    this.$toast.close();
  }

  public override destroyed() {
    location.reload();
  }

  private async registerMusic() {
    this.musicStorage = Vue.observable(new MusicStorage());
    this.musicService = Vue.observable(new MusicService());
    this.lrcContext = Vue.observable(new LrcContext());
    this.lrcStyles = Vue.observable(PlayerSettings.getLrcStyles());
    this.visualStyles = Vue.observable(PlayerSettings.getVisualStyles());
    this.visualActions = Vue.observable(PlayerSettings.getVisualActions());
    await PlayerSettings.load();
    await this.musicStorage.init();
  }

  private registerWindowAttrs() {
    document.body.setAttribute(this.platform.key, 'true');
    this.platform.mobile && document.body.setAttribute('mobile', 'true');
  }

  @Watch('wallpaperProperties.clipboard')
  private watchClipboard() {
    const activeElement = document.activeElement as HTMLInputElement;
    if (activeElement?.tagName === 'INPUT') {
      activeElement.value = this.wallpaperProperties.clipboard;
      activeElement.dispatchEvent(new Event('input'));
    }
  }

  @Watch('musicService.music.title')
  private updateWindowInfo() {
    const title = this.platform.standalone ? '' : require('/package.json').description;
    const musicTitle = this.musicService?.music?.title;
    document.title = [musicTitle, title].filter(t => t).join(' - ');
  }

  @Watch('language')
  private watchLanguage(value: LanguageKeys) {
    const locale = require('element-ui/lib/locale/index.js');
    const zhLang = require('element-ui/lib/locale/lang/zh-CN.js').default;
    const enLang = require('element-ui/lib/locale/lang/en.js').default;
    if (value === 'zh') {
      locale.use(zhLang);
    } else {
      locale.use(enLang);
    }
  }
}
</script>
