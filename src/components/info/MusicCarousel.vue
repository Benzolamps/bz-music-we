<template>
  <div class="music-carousel">
    <ul>
      <li :style="`--delta: ${delta}px;`">{{ musicService.music.title }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Watch} from 'vue-property-decorator';

@Component
export default class MusicCarousel extends BaseComponent {
  private delta = 0;

  public override mounted() {
    window.addEventListener('resize', this.calcDelta, {signal: this.abortSignal});
    this.$nextTick(this.calcDelta);
  }

  private calcDelta() {
    const ul = this.$el.querySelector('ul');
    const li = this.$el.querySelector('li');
    this.delta = ul.clientWidth - li.scrollWidth;
  }

  @Watch('musicService.music.title')
  private watchMusic() {
    this.$nextTick(this.calcDelta);
  }
}
</script>

<style lang="scss">
.music-carousel {
  overflow: hidden;
  pointer-events: none;

  ul {
    width: 100%;
    height: 100%;
    overflow: hidden;

    li {
      position: relative;
      white-space: nowrap;
      word-break: break-all;
      width: fit-content;
      text-align: left;
      animation: 10s wordsLoop ease-out infinite;
      cursor: pointer;
      color: #606266;
      font-size: 18px;
      font-weight: 700;

      @keyframes wordsLoop {
        0% {
          left: 0;
        }
        10% {
          left: 0;
        }
        40% {
          left: var(--delta);
        }
        60% {
          left: var(--delta);
        }
        90% {
          left: 0;
        }
        100% {
          left: 0;
        }
      }
    }
  }
}
</style>
