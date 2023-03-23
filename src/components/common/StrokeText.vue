<template>
  <component class="stroke-text" :is="tag" v-text="text" :style="{
    '--stroke-color': color,
    '--stroke-text': JSON.stringify(text)
  }" v-on="$listeners"/>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component, Prop} from 'vue-property-decorator';

@Component
export default class StrokeText extends BaseComponent {
  @Prop()
  private readonly text: string;

  @Prop()
  private readonly tag: string;

  @Prop()
  private readonly color: string;
}
</script>

<style lang="scss">
.stroke-text {
  position: relative;
  -webkit-text-stroke: 0.1em var(--stroke-color);
  &::before {
    z-index: 1;
    content: var(--stroke-text);
    -webkit-text-stroke: 0 #0000;
    position: absolute;
  }
}
</style>
