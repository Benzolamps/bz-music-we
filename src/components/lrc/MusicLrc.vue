<template>
  <b-scroll
    v-if="lrcContext"
    ref="scroll"
    class="music-lrc"
    :options="{mouseWheel: !lockScroll, disableMouse: lockScroll, disableTouch: lockScroll}"
    @init-scroll="initScroll"
  >
    <ul :style="{
      '--lrc-color-default': lrcStyles.defaultColor,
      '--lrc-color-past': lrcStyles.pastColor,
      '--lrc-color-future': lrcStyles.futureColor,
    }" ref="lrcContainer">
      <li v-if="lockScroll" key="s0" class="scroll-locker"/>
      <template v-for="(lrc, index) in lrcContext.shownLrc">
        <stroke-text
          :key="index"
          tag="li"
          :color="lrcStyles.strokeColor"
          :text="lrc.content || attrSeparator"
          :class="getLrcClass(lrc)"
          @click="seek(lrc)"
        />
      </template>
      <li v-if="lockScroll" key="s1" class="scroll-locker"/>
    </ul>
  </b-scroll>
</template>

<script lang="ts">
import {LrcTag} from '@/utils/lrc_object';
import BScroll from '@/components/common/BScroll.vue';
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Prop, Ref, Watch} from 'vue-property-decorator';
import StrokeText from '@/components/common/StrokeText.vue';

@Component({components: {StrokeText, BScroll}})
export default class MusicLrc extends BaseComponent {
  @Prop({default: false})
  private readonly lockScroll: boolean;

  @Ref('scroll')
  private readonly scroll: BScroll;

  public override mounted() {
    this.refreshScroll();
    window.addEventListener('resize', this.adjustHeight, {signal: this.abortSignal});
    this.$nextTick(this.adjustHeight);
  }

  public override beforeDestroy() {
    this.animationRunner.off(this.updateTime);
  }

  public async adjustHeight() {
    const element = this.$el as HTMLElement;
    if (element.style.maxHeight === '100%') {
      return;
    }
    element.style.maxHeight = '100%';
    await this.$nextTick();
    const height = element.clientHeight;
    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    let number = Math.floor(height / lineHeight);
    number = number % 2 ? number : number - 1;
    number = Math.max(1, number);
    const maxHeight = number * lineHeight;
    element.style.maxHeight = maxHeight + 'px';
    await this.$nextTick();
    this.scroll?.refresh();
  }

  private initScroll() {
    this.scroll.scroll.on('scrollEnd', ({x, y}: {x: number, y: number}) => {
      const lineHeight = parseInt(window.getComputedStyle(this.$el).lineHeight);
      const newY = Math.round(y / lineHeight) * lineHeight;
      if (newY !== y) {
        this.scroll.scrollTo(x, newY, 500);
      }
    });
    const hooks = this.scroll.scroll.scroller.hooks;
    hooks.on('momentum', (obj: {newX: number, newY: number, time: number}) => {
      const lineHeight = parseInt(window.getComputedStyle(this.$el).lineHeight);
      obj.newX = 0;
      obj.newY = Math.round(obj.newY / lineHeight) * lineHeight;
      obj.time ||= 500;
    });
  }

  private time = performance.now();
  private seek(lrc: LrcTag) {
    if (this.scroll?.scroll.pending) {
      return;
    }
    const current = performance.now();
    if (current - this.time < 500) {
      const seekTime = lrc.time + 0.01;
      this.musicService.seek(seekTime);
    }
    this.time = current;
  }

  private getLrcClass(lrc: LrcTag) {
    const result: Array<string> = [];
    if (lrc?.time === this.lrcContext.currentLrcTime) {
      result.push('music-lrc-item-current');
    } else {
      result.push('music-lrc-item-normal');
    }
    result.push('lrc-gradient', 'lrc-font');
    return result;
  }

  private async refreshScroll() {
    await this.$nextTick();
    this.scroll?.refresh();
    const element = this.getScrollToElement();
    if (element instanceof HTMLElement) {
      this.scroll?.scrollToElement(element, this.lrcContext.currentLrcTime && 500);
    }
  }

  private getScrollToElement() {
    const elements = this.scroll.$el.querySelectorAll('.music-lrc-item-current');
    if (elements.length > 0) {
      return elements.item(Math.ceil(elements.length / 2) - 1);
    }
    return this.scroll.$el.querySelector('.music-lrc-item-normal');
  }

  private updateTime() {
    const lrcContainer = this.$refs.lrcContainer as HTMLUListElement;
    lrcContainer.style.setProperty('--lrc-progress-past', this.lrcContext.progress * 100 + '%');
    lrcContainer.style.setProperty('--lrc-progress-future', this.lrcContext.progress * 200 + '%');
  }

  @Watch('musicService.currentTime')
  private watchCurrentTime() {
    this.animationRunner.once(this.updateTime);
  }

  @Watch('lrcContext.shownLrc.length')
  @Watch('visualStyles.state.show')
  @Watch('lrcContext.currentLrcTime')
  private watchShownLrc() {
    return this.refreshScroll();
  }
}
</script>

<style lang="scss">
.music-lrc {
  line-height: 45px;
  overflow: hidden;

  ul {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--lrc-color-default);
    pointer-events: none;

    li {
      padding: 0 10px;

      &, &::before {
        pointer-events: auto;
        width: fit-content;
        max-width: calc(100% - 20px);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      &.lrc-font {
        font-family: 'LrcFont', 'PingFang SC', 'Arial', 'sans-serif' !important;
      }
    }

    .music-lrc-item-current {
      color: var(--lrc-color-future);

      &.lrc-gradient::before {
        -webkit-text-fill-color: transparent;
        -webkit-background-clip: text;
        background-image: linear-gradient(
          to right,
          var(--lrc-color-past) var(--lrc-progress-past, 0%),
          var(--lrc-color-future) var(--lrc-progress-future, 0%)
        );
      }
    }

    .scroll-locker {
      height: 50vh !important;
    }
  }
}
</style>
