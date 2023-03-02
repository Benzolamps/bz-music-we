<template>
  <div class="toast-container">
    <div class="toast-shade" v-show="showShade"></div>
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

  /** 是否展示遮罩层 */
  private showShade = false;

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
  private show(msg: string, showShade = false) {
    window.clearTimeout(this.timeout);
    this.$createElement;
    this.toastContent = msg;
    this.showToast = true;
    this.showShade = !!showShade;
    if (!this.showShade) {
      this.timeout = window.setTimeout(this.hide, 3000);
    }
  }

  /**
   * 隐藏Toast
   */
  private hide() {
    this.showToast = false;
    this.showShade = false;
  }
}
</script>

<style lang="scss">
.toast-container {
  width: 0;
  height: 0;
  .toast-shade {
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #000;
    opacity: .5;
    transition: opacity .7s;
  }

  .toast {
    position: fixed;
    z-index: 10000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #000A;
    padding: 10px;
    border-radius: 5px;
    color: #fff;
    transition: opacity .7s;
    pointer-events: none;
  }
}
</style>
