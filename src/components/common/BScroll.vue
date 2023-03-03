<template>
  <div>
    <slot/>
  </div>
</template>

<script lang="ts">
import Slide from '@better-scroll/slide';
import Component from 'vue-class-component';
import BaseComponent from '@/components/common/BaseComponent';
import {Emit, Prop} from 'vue-property-decorator';
import {Options} from '@better-scroll/core/src/Options';
import BetterScroll from '@better-scroll/core';

BetterScroll.use(Slide);

@Component
export default class BScroll extends BaseComponent {
  public scroll: BetterScroll;

  @Prop()
  private wrapper: HTMLElement;

  @Prop({default: Object})
  protected options: Options;
  
  protected defaultOptions: Options = {
    momentum: false,
    mouseWheel: true,
    preventDefault: false
  };

  public override async mounted() {
    await this.initScroll();
  }

  public override beforeDestroy() {
    this.scroll.destroy();
  }

  @Emit('initScroll')
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

  public refresh() {
    this.scroll?.refresh();
  }

  public scrollTo(x: number, y: number, time?: number) {
    this.scroll?.scrollTo(x, y, time);
  }

  public scrollToElement(el: HTMLElement | string, time: number, offsetX: number | boolean, offsetY: number | boolean) {
    this.scroll?.scrollToElement(el, time, offsetX, offsetY);
  }
}
</script>
