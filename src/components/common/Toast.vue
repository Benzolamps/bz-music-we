<template>
  <div class="toast-container">
    <div :style="showToast || {opacity: 0}" class="toast" v-html="toastContent"/>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';

/**
 * Toast弹窗
 */
@Component
export default class Toast extends BaseComponent {
  /** 是否展示 */
  private showToast = false;

  /** 展示内容 */
  private toastContent = '';

  /** 延时关闭 */
  private timeout = 0;

  /** 工具类型 */
  declare private utilType: Toast['show'] & { close: Toast['hide']};

  public override mounted() {
    this.$toast = this.show.bind(this) as Toast['utilType'];
    this.$toast.close = this.hide;
  }

  /**
   * 显示Toast
   */
  private show(msg: string) {
    window.clearTimeout(this.timeout);
    this.$createElement;
    this.toastContent = msg;
    this.showToast = true;
    this.timeout = window.setTimeout(this.hide, 3000);
  }

  /**
   * 隐藏Toast
   */
  private hide() {
    this.showToast = false;
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
    background: #000A;
    padding: 10px;
    border-radius: 5px;
    color: #fff;
    transition: opacity .7s;
    pointer-events: none;
  }
}
</style>
