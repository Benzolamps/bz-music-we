<template>
  <div class="music-visual">
    <canvas ref="canvas" :class="{hidden: !visualStates.canvas, 'no-interactive': visualStyles.lrcMode === 'scroll'}"/>
    <div ref="shade" class="shade" :class="visualStates.video || 'hidden'"/>
    <video ref="video" muted controls playsinline autoplay :class="visualStates.video || 'hidden'"/>
    <div class="overlay" :class="{hidden: !(enableOverlay && (alwaysShowOverlay || tempShowOverlay))}">
      <el-card>
        <ul>
          <li class="info">{{music.name}}</li>
          <li v-if="music.author" class="info">{{messages['music.author']}}：{{music.author}}</li>
          <li v-if="music.album" class="info">{{messages['music.album']}}：{{music.album}}</li>
          <li>{{attrSeparator}}</li>
          <li v-if="music.musicFile">{{music.musicFile.type}}</li>
          <li v-if="music.fileSize">{{music.fileSize | fileSize}}</li>
          <li v-if="music.props.audioBitrate">{{music.props.audioBitrate}} kbps</li>
          <li v-if="music.props.audioSampleRate">{{music.props.audioSampleRate}} Hz</li>
          <li v-if="music.props.bitsPerSample">{{music.props.bitsPerSample}} bits</li>
          <li v-if="music.props.audioChannels">{{ music.props.audioChannels > 1 ? 'STEREO' : 'MONO' }}</li>
          <li>{{attrSeparator}}</li>
          <li class="info">{{lrcContext.currentLrcArray[0] && lrcContext.currentLrcArray[0].content || attrSeparator}}</li>
          <li class="time code-font" ref="time">{{0 | delta}}/{{0 | delta}}</li>
          <li>Milk Drop Preset: {{visualStyles.preset}}</li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Ref, Watch} from 'vue-property-decorator';
import MusicVisualCore from '@/components/visual/core';
import PlayerSettings from '@/components/service/player_settings';
import {formatDelta, KeyMapping, keyMappings} from '@/utils/common_utils';
import Hammer from 'hammerjs';

@Component
export default class MusicVisual extends BaseComponent {
  @Ref('canvas')
  private readonly canvas: HTMLCanvasElement;

  @Ref('video')
  private readonly video: HTMLVideoElement;

  @Ref('shade')
  private readonly shade: HTMLDivElement;

  @Ref('time')
  private readonly time: HTMLHeadingElement;

  private hammer = new Hammer.Manager(document.createElement('div'), {});

  private pipWindow: {width: number, height: number};
  
  private alwaysShowOverlay = false;
  
  private tempShowOverlay = true;
  
  private timeout = 0;

  private get music() {
    return this.musicService.music;
  }

  private get enableOverlay() {
    return this.visualStyles.overlay && this.visualStates.canvas && this.visualStyles.lrcMode !== 'scroll';
  }
  
  public override mounted() {
    const signal = this.abortSignal;
    this.video.muted = true;
    this.video.disablePictureInPicture = false;
    this.video.playsInline = true;
    this.shade.addEventListener('click', () => {
      if (!document.pictureInPictureElement) {
        this.visualStates.video = false;
        this.visualStates.canvas = true;
        this.visualStates.pip = false;
      }
    }, {signal});
    this.video.addEventListener('enterpictureinpicture', (e: any) => {
      this.visualStates.video = false;
      this.visualStates.canvas = false;
      this.pipWindow = e.pictureInPictureWindow;
    }, {signal});
    this.video.addEventListener('leavepictureinpicture', () => {
      this.visualStates.video = false;
      this.visualStates.canvas = true;
      this.visualStates.pip = false;
    }, {signal});

    this.musicVisualCore = new MusicVisualCore(this, this.canvas, this.getDesireCanvasSize);
    this.handlePip();

    const starHandler = () => PlayerSettings.starPreset(this.visualStyles.preset);
    const prevHandler = () => this.musicVisualCore.prevPreset();
    const nextHandler = () => this.musicVisualCore.nextPreset();
    
    const keys = {ctrlKey: false, altKey: false, shiftKey: false};
    const mappings: Array<KeyMapping> = [
      {type: 'keydown', code: 'Numpad5', ...keys},
      {type: 'keydown', code: 'Numpad4', ...keys},
      {type: 'keydown', code: 'Numpad6', ...keys},
      {type: 'keydown', code: 'F8', ...keys},
      {type: 'keydown', code: 'F10', ...keys},
      {type: 'keyup', code: 'Numpad5', ...keys, handler: starHandler},
      {type: 'keyup', code: 'Numpad4', ...keys, handler: prevHandler},
      {type: 'keyup', code: 'Numpad6', ...keys, handler: nextHandler},
      {type: 'keyup', code: 'F8', ...keys, handler: this.handleAlwaysOverlay},
      {type: 'keyup', code: 'F10', ...keys, handler: () => this.visualStates.pip = !this.visualStates.pip}
    ];
    mappings.forEach(e => keyMappings.add(e));
    this.$once('hook:beforeDestroy', () => mappings.forEach(e => keyMappings.delete(e)));
    
    this.hammer = new Hammer.Manager(this.canvas);
    const press = new Hammer.Press();
    this.hammer.add(press);
    const tap = new Hammer.Tap();
    this.hammer.add(tap);
    const swipe = new Hammer.Swipe({direction: Hammer.DIRECTION_ALL});
    this.hammer.add(swipe);
    this.hammer.on('press', starHandler);
    this.hammer.on('tap', this.handleAlwaysOverlay);
    this.hammer.on('swipe', e => {
      const direction = e.offsetDirection;
      if (direction === Hammer.DIRECTION_DOWN || direction === Hammer.DIRECTION_RIGHT) {
        prevHandler();
      } else if (direction === Hammer.DIRECTION_UP || direction === Hammer.DIRECTION_LEFT) {
        nextHandler();
      }
    });
    
    this.handleTempOverlay();
  }

  private handleTempOverlay() {
    window.clearTimeout(this.timeout);
    this.tempShowOverlay = true;
    this.timeout = window.setTimeout(() => this.tempShowOverlay = false, 5000);
  }

  private handleAlwaysOverlay() {
    if (this.tempShowOverlay || this.alwaysShowOverlay) {
      this.tempShowOverlay = this.alwaysShowOverlay = false;
    } else {
      this.alwaysShowOverlay = true;
    }
  }

  public override beforeDestroy() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
    this.musicVisualCore.close();
  }

  private getDesireCanvasSize(): [number, number] {
    if (this.visualStates.canvas) {
      return [this.canvas.clientWidth * window.devicePixelRatio, this.canvas.clientHeight * window.devicePixelRatio];
    } else if (document.pictureInPictureElement) {
      return [this.pipWindow.width * window.devicePixelRatio, this.pipWindow.height * window.devicePixelRatio];
    } else {
      return [this.video.clientWidth * window.devicePixelRatio, this.video.clientHeight * window.devicePixelRatio];
    }
  }

  /* region pip */

  private handlePip() {
    if (!this.platform.pip) {
      this.visualStates.video = false;
      this.visualStates.canvas = true;
      return;
    }
    if (this.visualStates.pip) {
      this.visualStates.video = true;
      this.visualStates.canvas = false;
      this.video.srcObject = this.canvas.captureStream();
      this.video.play().then(() => this.video.requestPictureInPicture());
    } else {
      this.visualStates.video = false;
      this.visualStates.canvas = true;
      if (this.video.srcObject instanceof MediaStream) {
        this.video.srcObject.getTracks().forEach(t => t.stop());
      }
      this.video.srcObject = null;
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      }
    }
  }

  /* 更新时间 */
  private updateTime() {
    this.time.innerText = formatDelta(this.musicService.currentTime) + '/' + formatDelta(this.musicService.duration);
  }

  @Watch('musicService.duration')
  @Watch('musicService.currentTime')
  private watchCurrentTime() {
    this.animationRunner.once(this.updateTime);
  }

  @Watch('visualStyles.preset')
  @Watch('music.id')
  @Watch('enableOverlay')
  private watchMusic() {
    this.alwaysShowOverlay = false;
    this.handleTempOverlay();
  }

  @Watch('visualStates.pip')
  private watchPip() {
    this.handlePip();
  }
  
  @Watch('musicService.isPlaying')
  private watchPlaying() {
    if (this.musicService.isPlaying) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  /* endregion */
}
</script>

<style lang="scss">
.music-visual {
  canvas {
    background-color: #9cdcfe;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
  }

  .shade {
    background-color: transparent;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    z-index: 2;
  }

  video {
    background-color: #9cdcfe;
    width: 50vw;
    height: 25vw;
    left: 25vw;
    top: calc(50vh - 12.5vw);
    position: absolute;
    z-index: 9999;
  }

  canvas.hidden {
    width: 800px;
    height: 400px;
    opacity: 0;
    pointer-events: none;
  }
  
  canvas.no-interactive {
    pointer-events: none;
  }

  .shade.hidden {
    display: none;
  }

  video.hidden {
    display: none;
  }
  
  .overlay {
    position: absolute;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    pointer-events: none;
    transition: opacity 1s ease-in-out;
    
    .el-card {
      background-color: #333A;
      color: #EEE;
      width: min(calc(100vw - 35px), 750px);
      border: none;
      box-shadow: 0 2px 12px 0 #333;
      
      * {
        font-family: 'LrcFont', 'PingFang SC', 'Arial', 'sans-serif';
      }
      
      .info {
        font-size: 20px;
        font-weight: 700;
      }
      
      .time {
        font-size: 25px;
        line-height: 75px;
        font-weight: 400;
      }
    }
  }

  .overlay.hidden {
    pointer-events: none;
    opacity: 0;
  }
}
</style>
