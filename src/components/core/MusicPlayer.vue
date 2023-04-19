<template>
  <article class="music-container" :style="{'--show-info': showInfo ? 1 : 0}">
    <header>
      <music-visual v-if="visualStates.show"/>
    </header>
    <main class="music-main">
      <!-- 歌词 -->
      <music-lrc ref="musicLrc" v-if="showLrc"/>

      <!-- 歌曲信息 -->
      <div v-show="showInfo" class="music-info" style="color: #FFF">
        <div>{{ music.name || music.title }}</div>
        <div v-if="music.author">{{ messages['music.author'] }}：{{ music.author }}</div>
        <div v-if="music.album">{{ messages['music.album'] }}：{{ music.album }}</div>
        <div v-if="music.props" style="padding: 10px calc(50% - 200px);">
          <el-tag v-if="music.musicFile" v-bind="tagProps">{{ music.musicFile.type }}</el-tag>
          <el-tag v-if="music.fileSize" v-bind="tagProps">{{ music.fileSize | fileSize }}</el-tag>
          <el-tag v-if="music.duration" v-bind="tagProps">{{ music.duration | delta }}</el-tag>
          <el-tag v-if="music.props.audioBitrate" v-bind="tagProps">{{ music.props.audioBitrate }} kbps</el-tag>
          <el-tag v-if="music.props.audioSampleRate" v-bind="tagProps">{{ music.props.audioSampleRate }} Hz</el-tag>
          <el-tag v-if="music.props.bitsPerSample" v-bind="tagProps">{{ music.props.bitsPerSample }} bits</el-tag>
          <el-tag v-if="music.props.audioChannels" v-bind="tagProps">{{ music.props.audioChannels > 1 ? 'STEREO' : 'MONO' }}</el-tag>
          <el-tag v-if="!music.lrcFile" v-bind="tagProps" type="warning">{{messages['music.no_lrc']}}</el-tag>
        </div>
      </div>
    </main>

    <footer>
      <!-- 音乐播放控制 -->
      <music-control ref="musicControl" :style="showMusicControl || showInfo || {height: 0}"/>
      <file-importer/>
    </footer>
  </article>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import StrokeText from '@/components/common/StrokeText.vue';
import FileImporter from '@/components/core/FileImporter.vue';
import MusicControl from '@/components/info/MusicControl.vue';
import MusicLrc from '@/components/lrc/MusicLrc.vue';
import MusicVisual from '@/components/visual/MusicVisual.vue';
import {Component, Ref, Watch} from 'vue-property-decorator';

@Component({components: {FileImporter, StrokeText, MusicVisual, MusicLrc, MusicControl}})
export default class MusicPlayer extends BaseComponent {
  private showMusicControl = true;

  @Ref('musicControl')
  private readonly musicControl: MusicControl;

  @Ref('musicLrc')
  private readonly musicLrc: MusicLrc;

  private readonly tagProps = {
    effect: 'dark',
    type: 'info',
    style: {
      width: '120px',
      margin: '5px'
    },
    size: 'small',
    disableTransitions: true
  };

  private get music() {
    return this.musicService.music;
  }

  private get showLrc() {
    return !this.visualStates.show || this.visualStyles.lrcMode !== 'caption' || this.visualStates.pip;
  }

  private get showInfo() {
    return !this.visualStates.show || this.visualStates.pip;
  }

  public override mounted() {
    const handler = (event: Event | MouseEvent | TouchEvent) => {
      let clientY: number;
      if (event instanceof MouseEvent) {
        clientY = event.clientY;
      } else if (event instanceof TouchEvent) {
        clientY = Array.from(event.touches).map(t => t.clientY).reduce((a, b) => Math.max(a, b), 0);
      }
      if (clientY >= window.innerHeight - 100) {
        this.showMusicControl = true;
      } else {
        const elements = Array.from(document.querySelectorAll('.el-popper, .el-drawer'));
        this.showMusicControl = !(elements.length === 0 || elements.every(e => e.clientWidth === 0 || e.clientHeight === 0));
      }
    };
    const signal = this.abortSignal;
    document.addEventListener('click', handler, {signal});
    document.addEventListener('touchmove', handler, {signal});
    document.addEventListener('mousemove', handler, {signal});
  }

  @Watch('showInfo')
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
    padding: 20px 20px calc(80px - (1 - var(--show-info)) * 50px);

    box-sizing: border-box;

    .music-info {
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
