<template>
  <div id="app">
    <div class="loading-background"/>
    <toast v-if="musicRegistered"/>
    <music-player v-if="musicRegistered"/>
    <h1 v-if="!webgl2Supported">{{ messages.preview }}</h1>
  </div>
</template>

<script lang="ts">
import {loadBasicFonts} from "@/utils/common_utils";
import {Component, Watch} from 'vue-property-decorator';
import Toast from '@/components/common/Toast.vue';
import MusicStorage from '@/components/service/data';
import MusicService from '@/components/service/core';
import BaseComponent from '@/components/common/BaseComponent';
import Vue from 'vue';
import PlayerSettings from '@/components/service/player_settings';
import LrcContext from '@/components/service/lrc_context';
import MusicPlayer from '@/components/core/MusicPlayer.vue';

@Component({components: {MusicPlayer, Toast}})
export default class App extends BaseComponent {
  private musicRegistered = false;
  private webgl2Supported = true;

  public override async mounted() {
    await loadBasicFonts();
    const canvas = document.createElement('canvas');
    this.webgl2Supported = !!canvas.getContext('webgl2');
    if (this.webgl2Supported) {
      this.registerWindowAttrs();
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
  }

  @Watch('wallpaperProperties.taskbar_position')
  @Watch('wallpaperProperties.taskbar_length')
  private watchTaskbar() {
    this.registerWindowAttrs();
  }
}
</script>
