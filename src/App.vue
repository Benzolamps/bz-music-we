<template>
  <div id="app">
    <head-definition/>
    <div class="loading-background"/>
    <toast/>
    <music-player v-if="page === 'MusicPlayer' && musicRegistered"/>
    <music-lrc-editor v-if="page === 'MusicLrcEditor' && musicRegistered"/>
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
    await this.$sleep(100);
    this.$toast.close();
    
    if (this.wallpaperProperties.language) {
      this.language = this.wallpaperProperties.language;
    } else {
      if (navigator.language.match(/(^en$)|(^en-)/)) {
        this.language = 'en-us';
      } else if (navigator.language.match(/(^zh-TW$)|(^zh-HK$)/)) {
        this.language = 'zh-cht';
      } else if (navigator.language.match(/(^zh$)|(^zh-)/)) {
        this.language = 'zh-chs';
      }
    }

    const canvas = document.createElement('canvas');
    this.webgl2Supported = !!canvas.getContext('webgl2');
    if (this.webgl2Supported) {
      await this.registerMusic();
      this.musicRegistered = true;
    }
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
  
  @Watch('language')
  @Watch('wallpaperProperties.language')
  private watchLanguage(value: LanguageKeys) {
    this.language = value;
    const locale = require('element-ui/lib/locale/index.js');
    const zhChsLang = require('element-ui/lib/locale/lang/zh-CN.js').default;
    const zhChtLang = require('element-ui/lib/locale/lang/zh-TW.js').default;
    const enLang = require('element-ui/lib/locale/lang/en.js').default;
    if (value === 'zh-chs') {
      locale.use(zhChsLang);
    } else if (value === 'zh-cht') {
      locale.use(zhChtLang);
    } else {
      locale.use(enLang);
    }
  }
}
</script>
