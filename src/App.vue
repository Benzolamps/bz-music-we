<template>
  <div id="app">
    <toast/>
    <music-player/>
  </div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator';
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

  public override async created() {
    this.registerMusic();
  }

  public override destroyed() {
    location.reload();
  }
 
  private registerMusic() {
    this.musicStorage = Vue.observable(new MusicStorage());
    this.musicService = Vue.observable(new MusicService());
    this.lrcContext = Vue.observable(new LrcContext());
    this.lrcStyles = Vue.observable(PlayerSettings.getLrcStyles());
    this.visualStyles = Vue.observable(PlayerSettings.getVisualStyles());
    PlayerSettings.load();
    this.musicStorage.init();
  }
}
</script>
