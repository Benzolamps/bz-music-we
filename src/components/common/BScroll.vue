<template>
  <div>
    <slot/>
  </div>
</template>

<script lang="ts">
import MouseWheel from '@better-scroll/mouse-wheel';
import Slide from '@better-scroll/slide';
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Emit, Prop} from 'vue-property-decorator';
import {Options} from '@better-scroll/core/src/Options';
import BetterScroll from '@better-scroll/core';

BetterScroll.use(MouseWheel);
BetterScroll.use(Slide);

@Component
export default class BScroll extends BaseComponent {
  public scroll: BetterScroll;

  @Prop()
  private readonly wrapper: HTMLElement;

  @Prop({default: Object})
  protected options: Options;

  protected defaultOptions: Options = {
    mouseWheel: true,
    preventDefault: false
  };

  public override async mounted() {
    await this.initScroll();
  }

  public override beforeDestroy() {
    this.scroll.destroy();
  }

  public refresh() {
    this.scroll?.refresh();
  }

  public scrollTo(x: number, y: number, time: number) {
    this.scroll?.scrollTo(x, y, time);
  }

  public scrollToElement(el: HTMLElement | string, time: number) {
    this.scroll?.scrollToElement(el, time, true, true);
  }

  @Emit('init-scroll')
  private async initScroll() {
    if (this.wrapper) {
      this.$el.remove();
    }
    await this.$nextTick();
    const element = this.wrapper || this.$el as HTMLElement;
    this.scroll = new BetterScroll(element, {
      ...this.defaultOptions,
      ...this.options
    });
  }
}
</script>
