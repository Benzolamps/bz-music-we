<template>
  <div class="toast-container">
    <div :style="toast && content || {opacity: 0}" class="toast" v-html="content"/>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component} from 'vue-property-decorator';

/**
 * Toast弹窗
 */
@Component
export default class Toast extends BaseComponent {
  /** 是否展示 */
  private toast = false;

  /** 展示内容 */
  private content = '';

  /** 延时关闭 */
  private timeout = 0;

  public override mounted() {
    this.$toast = this.show;
  }

  /**
   * 显示Toast
   */
  private show(msg: string) {
    window.clearTimeout(this.timeout);
    this.toast = true;
    this.content = msg;
    this.timeout = window.setTimeout(() => this.toast = false, 3000);
  }
}
</script>

<style lang="scss">
.toast-container {
  z-index: 9999;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;
  background-color: transparent;
  pointer-events: none;

  .toast {
    background-color: #000a;
    padding: 10px;
    border-radius: 5px;
    color: #fff;
    transition: opacity .7s;
  }
}
</style>
