<template>
  <div id="app">
    <head-definition/>
    <div class="loading-background"/>
    <music-player v-if="page === 'MusicPlayer' && musicRegistered"/>
    <music-lrc-editor v-if="page === 'MusicLrcEditor' && musicRegistered"/>
    <toast/>
    <h1 v-if="!webgl2Supported">{{ messages.preview }}</h1>
  </div>
</template>

<script lang="ts">
import {LanguageKeys} from '@/assets/locale/messages';
import MusicLrcEditor from '@/components/lrc/MusicLrcEditor.vue';
import HeadDefinition from '@/components/misc/HeadDefinition.vue';
import {loadBasicFonts, registerEvents} from '@/utils/common_utils';
import {Component, Watch} from 'vue-property-decorator';
import Toast from '@/components/common/Toast.vue';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import BaseComponent from '@/components/common/BaseComponent';
import Vue from 'vue';
import PlayerSettings from '@/components/service/player_settings';
import LrcContext from '@/components/service/lrc_context';
import MusicPlayer from '@/components/core/MusicPlayer.vue';

@Component({components: {MusicLrcEditor, HeadDefinition, MusicPlayer, Toast}})
export default class App extends BaseComponent {
  private musicRegistered = false;
  private webgl2Supported = true;

  public override created() {
    registerEvents();
    this.registerWindowAttrs();
  }

  public override async mounted() {
    this.$toast.showLoading();
    await loadBasicFonts();
  
    const nativeLanguage = this.wallpaperProperties.language || navigator.language;
    if (nativeLanguage.match(/(^en$)|(^en-)/)) {
      this.language = 'en';
    } else if (nativeLanguage.match(/(^zh$)|(^zh-)/)) {
      this.language = 'zh';
    }

    const canvas = document.createElement('canvas');
    this.webgl2Supported = !!canvas.getContext('webgl2');
    if (this.webgl2Supported) {
      await this.registerMusic();
      this.musicRegistered = true;
    }

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
    await PlayerSettings.load();
    await this.musicStorage.init();
  }

  private registerWindowAttrs() {
    const taskbarPosition = this.wallpaperProperties.taskbar_position;
    const taskbarLength = this.wallpaperProperties.taskbar_length;
    document.body.style.setProperty('--taskbar-bottom', (taskbarPosition === 'bottom' ? taskbarLength : 0) + 'px');
    document.body.style.setProperty('--taskbar-top', (taskbarPosition === 'top' ? taskbarLength : 0) + 'px');
    document.body.style.setProperty('--taskbar-left', (taskbarPosition === 'left' ? taskbarLength : 0) + 'px');
    document.body.style.setProperty('--taskbar-right', (taskbarPosition === 'right' ? taskbarLength : 0) + 'px');
    document.body.setAttribute(this.platform.key, 'true');
    this.platform.mobile && document.body.setAttribute('mobile', 'true');
  }

  @Watch('wallpaperProperties.taskbar_position')
  @Watch('wallpaperProperties.taskbar_length')
  private watchTaskbar() {
    this.registerWindowAttrs();
  }

  @Watch('musicService.music.title')
  private updateWindowInfo() {
    const title = this.platform.standalone ? '' : require('/package.json').description;
    const musicTitle = this.musicService?.music?.title;
    document.title = [musicTitle, title].filter(t => t).join(' - ');
  }

  @Watch('wallpaperProperties.language')
  private watchWallpaperLanguage(value: string) {
    if (value.match(/(^en$)|(^en-)/)) {
      this.language = 'en';
    } else if (value.match(/(^zh$)|(^zh-)/)) {
      this.language = 'zh';
    }
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
