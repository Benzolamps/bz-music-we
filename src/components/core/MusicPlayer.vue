<template>
  <article class="music-container" :style="{'--show-info': showInfo ? 1 : 0, backgroundColor: lrcStyles.strokeColor}">
    <header>
      <music-visual v-if="visualStyles.state.show"/>
    </header>
    <main class="music-main">
      <!-- 歌曲信息 -->
      <div v-show="showInfo" class="music-info" :style="{color: lrcStyles.defaultColor}">
        <stroke-text tag="span" :color="lrcStyles.strokeColor" :text="music.title" style="cursor: pointer;"/>
      </div>

      <!-- 歌词 -->
      <music-lrc v-if="showLrc"/>
    </main>

    <footer>
      <!-- 音乐播放控制 -->
      <music-control
        ref="musicControl"
        :style="showMusicControl || showInfo || {height: '0px'}"
      />
    </footer>
  </article>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import MusicControl from '@/components/info/MusicControl.vue';
import MusicLrc from '@/components/lrc/MusicLrc.vue';
import MusicVisual from '@/components/visual/MusicVisual.vue';
import BaseComponent from '@/components/common/BaseComponent';
import StrokeText from '@/components/common/StrokeText.vue';
import {Ref} from 'vue-property-decorator';

@Component({components: {StrokeText, MusicVisual, MusicLrc, MusicControl}})
export default class MusicPlayer extends BaseComponent {
  private showMusicControl = true;
  
  @Ref('musicControl')
  private musicControl: MusicControl;
  
  private timeout = 0;

  private get music() {
    return this.musicService.music;
  }
  
  private get showLrc() {
    return !this.visualStyles.state.show || this.visualStyles.lrcMode != 'caption' || this.visualStyles.state.pip;
  }

  private get showInfo() {
    return !this.visualStyles.state.show || this.visualStyles.state.pip;
  }

  public override mounted() {
    const handler = (event: Event | MouseEvent | TouchEvent) => {
      let clientY: number;
      if (event instanceof MouseEvent) {
        clientY = event.clientY;
      } else if (event instanceof TouchEvent) {
        clientY = Array.from(event.touches).map(t => t.clientY).reduce((a, b) => a > b ? a : b);
      }
      if (clientY >= window.innerHeight - 100) {
        window.clearTimeout(this.timeout);
        this.showMusicControl = true;
        this.timeout = window.setTimeout(() => this.showMusicControl = false, 3000);
      }
    };
    document.addEventListener('click', handler);
    document.addEventListener('mousemove', handler);
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
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
    padding: 20px 20px calc(80px - (1 - var(--show-info)) * 50px);

    box-sizing: border-box;

    .music-info {
      height: 175px;
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

      @for $i from 0 to 19 {
        $height: ($i * 2 + 1) * 45px;
        $screenHeight: $height + 350px;
        @media (screen and min-height: $screenHeight) {
          height: calc($height + (1 - var(--show-info)) * 270px);
        }
      }
    }
  }

  .music-control {
    transition: height .2s;
    z-index: 3;
  }
}

.music-detail-popover {
  width: min(calc(100vw - 35px), 400px);
  left: 50% !important;
  transform: translateX(-50%);

  .popper__arrow {
    left: 50% !important;
    transform: translateX(-50%);
  }
}
</style>
