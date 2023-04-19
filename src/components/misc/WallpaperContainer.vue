<template>
<div id="app">
  <div class="loading-background"/>
  <iframe v-if="webgl2Supported === true" :src="window.location.href" :style="padding"/>
  <h1 v-else-if="webgl2Supported === false">{{ messages.preview }}</h1>
</div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator';
import HeadDefinition from '@/components/misc/HeadDefinition.vue';
import BaseComponent from '@/components/common/BaseComponent';

@Component({components: {HeadDefinition}})
export default class WallpaperContainer extends BaseComponent {
  private webgl2Supported: boolean = null;

  private get padding() {
    const {taskbar_position, taskbar_length} = this.wallpaperProperties;
    return {
      ['padding-' + taskbar_position]: taskbar_length + 'px'
    };
  }

  public override created() {
    const canvas = document.createElement('canvas');
    this.webgl2Supported = !!canvas.getContext('webgl2');
  }
}
</script>

<style>
iframe {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: none;
}
</style>
