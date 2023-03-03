<template>
  <div class="music-visual">
    <canvas ref="canvas" :class="visualStyles.state.canvas || 'hidden'"/>
    <div ref="shade" :class="visualStyles.state.video || 'hidden'"/>
    <video ref="video" muted controls playsinline autoplay :class="visualStyles.state.video || 'hidden'"/>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import {Ref, Watch} from 'vue-property-decorator';
import MusicVisualCore from '@/components/visual/core';

@Component
export default class MusicVisual extends BaseComponent {

  @Ref('canvas')
  private canvas: HTMLCanvasElement;

  @Ref('video')
  private video: HTMLVideoElement;

  @Ref('shade')
  private shade: HTMLDivElement;
  
  private pipWindow: {width: number, height: number};

  public override mounted() {
    this.video.muted = true;
    this.video.disablePictureInPicture = false;
    this.video.playsInline = true;
    this.shade.addEventListener('click', () => {
      if (!document.pictureInPictureElement) {
        this.visualStyles.state.video = false;
        this.visualStyles.state.canvas = true;
        this.visualStyles.state.pip = false;
      }
    });
    this.video.addEventListener('enterpictureinpicture', (e: any) => {
      this.visualStyles.state.video = false;
      this.visualStyles.state.canvas = false;
      this.pipWindow = e.pictureInPictureWindow;
    });
    this.video.addEventListener('leavepictureinpicture', () => {
      this.visualStyles.state.video = false;
      this.visualStyles.state.canvas = true;
      this.visualStyles.state.pip = false;
    });

    this.musicVisualCore = new MusicVisualCore(this, this.canvas, this.getDesireCanvasSize);
    this.handlePip();
  }

  public override beforeDestroy() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
    this.musicVisualCore.close();
  }

  private getDesireCanvasSize() : [number, number] {
    if (this.visualStyles.state.canvas) {
      return [this.canvas.clientWidth * window.devicePixelRatio, this.canvas.clientHeight * window.devicePixelRatio];
    } else if (document.pictureInPictureElement) {
      return [this.pipWindow.width * window.devicePixelRatio, this.pipWindow.height * window.devicePixelRatio];
    } else {
      return [this.video.clientWidth * window.devicePixelRatio, this.video.clientHeight * window.devicePixelRatio];
    }
  }

  /* region pip */

  private handlePip() {
    if (this.visualStyles.state.pip) {
      this.visualStyles.state.video = true;
      this.visualStyles.state.canvas = false;
      this.video.srcObject = this.canvas.captureStream();
      this.video.play().then(() => this.video.requestPictureInPicture());
    } else {
      this.visualStyles.state.video = false;
      this.visualStyles.state.canvas = true;
      this.video.srcObject = null;
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      }
    }
  }

  @Watch('visualStyles.state.pip')
  private watchPip() {
    this.handlePip();
  }
  
  /* endregion */
}
</script>

<style lang="scss">
.music-visual {

  canvas {
    background-color: #9CDCFE;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    pointer-events: none;
  }

  div {
    background-color: transparent;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    z-index: 2;
  }

  video {
    background-color: #9CDCFE;
    width: 50vw;
    height: 25vw;
    left: 25vw;
    top: calc(50vh - 12.5vw);
    position: absolute;
    z-index: 2;
  }

  canvas.hidden {
    width: 800px;
    height: 400px;
    opacity: 0;
  }

  div.hidden {
    display: none;
  }

  video.hidden {
    pointer-events: none;
    opacity: 0;
  }
}
</style>
