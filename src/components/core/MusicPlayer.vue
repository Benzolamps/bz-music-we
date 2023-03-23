<template>
  <article class="music-container" :style="{'--show-info': showInfo ? 1 : 0}">
    <header>
      <music-visual v-if="visualStyles.state.show"/>
    </header>
    <main class="music-main">
      <!-- 歌词 -->
      <music-lrc ref="musicLrc" v-if="showLrc"/>

      <!-- 歌曲信息 -->
      <div v-show="showInfo" class="music-info" :style="{color: lrcStyles.defaultColor}">
        <stroke-text tag="span" :color="lrcStyles.strokeColor" :text="music.title" style="cursor: pointer;"/>
        <div style="padding: 10px">
          <el-tag type="info" v-if="music.musicProvider">{{music.musicProvider.type}}</el-tag>
          <el-tag type="info" v-if="music.musicProvider">{{music.musicProvider.size | fileSize}}</el-tag>
          <el-tag type="info" v-if="music.musicProvider">{{musicService.duration | delta}}</el-tag>
          <el-tag type="warning" v-if="!musicService.music.lrcProvider">无歌词</el-tag>
        </div>
      </div>
    </main>

    <footer>
      <!-- 音乐播放控制 -->
      <music-control ref="musicControl" :style="showMusicControl || showInfo || {height: '0px'}"/>
    </footer>
  </article>
</template>

<script lang="ts">
import MusicControl from '@/components/info/MusicControl.vue';
import MusicLrc from '@/components/lrc/MusicLrc.vue';
import MusicVisual from '@/components/visual/MusicVisual.vue';
import BaseComponent from '@/components/common/BaseComponent';
import StrokeText from '@/components/common/StrokeText.vue';
import {Component, Ref, Watch} from 'vue-property-decorator';

@Component({components: {StrokeText, MusicVisual, MusicLrc, MusicControl}})
export default class MusicPlayer extends BaseComponent {
  private showMusicControl = true;

  @Ref('musicControl')
  private readonly musicControl: MusicControl;

  @Ref('musicLrc')
  private readonly musicLrc: MusicLrc;

  private timeout = 0;

  private get music() {
    return this.musicService.music;
  }

  private get showLrc() {
    return !this.visualStyles.state.show || this.visualStyles.lrcMode !== 'caption' || this.visualStyles.state.pip;
  }

  private get showInfo() {
    return !this.visualStyles.state.show || this.visualStyles.state.pip;
  }

  public override async created() {
    if (this.wallpaperProperties.fps > 0) {
      this.visualStyles.state.show = true;
    } else {
      while (!this.visualStyles.state.show) {
        this.visualStyles.state.show = !!navigator.userActivation.hasBeenActive;
        await this.$sleep(1);
      }
    }
  }

  public override mounted() {
    const handler = (event: Event | MouseEvent | TouchEvent) => {
      let clientY: number;
      if (event instanceof MouseEvent) {
        clientY = event.clientY;
      } else if (event instanceof TouchEvent) {
        clientY = Array.from(event.touches).map(t => t.clientY).reduce((a, b) => a > b ? a : b);
      }
      let below = 100;
      if (this.wallpaperProperties.taskbar_position === 'bottom') {
        below += this.wallpaperProperties.taskbar_length;
      }
      if (clientY >= window.innerHeight - below) {
        window.clearTimeout(this.timeout);
        this.showMusicControl = true;
        this.timeout = window.setTimeout(() => this.showMusicControl = false, 3000);
      }
    };
    document.addEventListener('click', handler);
    document.addEventListener('mousemove', handler);
  }

  @Watch('showInfo')
  @Watch('wallpaperProperties.taskbar_position')
  @Watch('wallpaperProperties.taskbar_length')
  private watchShowInfo() {
    this.musicLrc?.adjustHeight();
  }
}
</script>

<style lang="scss">
.music-container {
  width: 100%;
  height: 100%;
  background-color: transparent;

  .music-main {
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
    height: 100%;
    padding: 20px 20px calc(80px - (1 - var(--show-info)) * 50px + var(--taskbar-bottom));

    box-sizing: border-box;

    .music-info {
      height: 70px;
      font-size: medium;

      ul {
        display: flex;
        flex-direction: column;
        align-items: center;

        li {
          padding: 5px;
          height: 25px;

          &, &::before {
            width: fit-content;
            max-width: calc(100vw - 20px);
            white-space: nowrap;
            text-overflow: ellipsis;
            word-break: break-all;
            overflow: hidden;
          }
        }
      }
    }

    .music-lrc {
      font-size: 22px;
      font-weight: 700;
      flex: 1;
    }
  }

  .music-control {
    transition: height .2s;
    z-index: 3;
  }
}

.music-detail-popover {
  max-width: min(calc(100vw - 35px), 400px);
}
</style>
