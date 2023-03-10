<template>
  <b-scroll
    v-if="lrcContext"
    ref="scroll"
    class="music-lrc"
    :options="{mouseWheel: !lockScroll, disableMouse: lockScroll, disableTouch: lockScroll}"
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
          @click="musicService.seek(lrc.time + 0.01)"
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
import Component from 'vue-class-component';
import {Prop, Ref, Watch} from 'vue-property-decorator';
import StrokeText from '@/components/common/StrokeText.vue';

@Component({components: {StrokeText, BScroll}})
export default class MusicLrc extends BaseComponent {

  @Prop({default: false})
  private lockScroll: boolean;

  @Ref('scroll')
  private scroll: BScroll;

  public override mounted() {
    this.refreshScroll();
  }

  private getLrcClass(lrc: LrcTag) {
    const result : string[] = [];
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
      this.scroll?.scrollToElement(element, this.lrcContext.currentLrcTime && 500, false, true);
    }
  }

  private getScrollToElement() {
    const elements = this.scroll.$el.querySelectorAll('.music-lrc-item-current');
    if (elements.length > 0) {
      return elements.item(Math.ceil(elements.length / 2) - 1);
    }
    return this.scroll.$el.querySelector('.music-lrc-item-normal');
  }

  private t = 0;
  @Watch('musicService.currentTime')
  private async watchCurrentTime() {
    window.requestAnimationFrame(t => {
      if (t == this.t) {
        return;
      }
      this.t = t;
      const lrcContainer = this.$refs.lrcContainer as HTMLUListElement;
      lrcContainer?.style.setProperty('--lrc-progress-past', this.lrcContext.progress * 100 + '%');
      lrcContainer?.style.setProperty('--lrc-progress-future', this.lrcContext.progress * 200 + '%');
    });
  }

  @Watch('lrcContext.shownLrc.length')
  @Watch('visualStyles.state.show')
  @Watch('lrcContext.currentLrcTime')
  private watchShownLrc() {
    this.refreshScroll();
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
