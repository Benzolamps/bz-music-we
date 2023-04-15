<template>
  <div class="toast-container" :style=" {pointerEvents: loading || progress ? 'auto' : 'none', zIndex}">
    <div :style="loading || {opacity: 0}" class="circles">
      <div class="circle1"/>
      <div class="circle2"/>
    </div>
    <el-progress :style="progress || {opacity: 0}" type="circle" :percentage="percent" :class="percent || 'no-transition'" :format="t => t.toFixed(2)" :width="50"/>
    <div :style="toast && content || {opacity: 0}" class="toast" v-html="content"/>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component} from 'vue-property-decorator';

const {PopupManager} = require('element-ui/lib/utils/popup');

/**
 * Toast弹窗
 */
@Component
export default class Toast extends BaseComponent {
  private loading = false;

  private progress = false;

  private toast = false;

  /** 展示内容 */
  private content = '';

  /** 进度 */
  private percent = 0;

  /** 延时关闭 */
  private timeout = 0;
  
  private zIndex = 0;

  /** 工具类型 */
  private declare readonly utilType: Toast['show'] & {
    close: Toast['hide'];
    showLoading: Toast['showLoading'];
    showProgress: Toast['showProgress'];
  };

  public override mounted() {
    this.$toast = this.show as Toast['utilType'];
    this.$toast.close = this.hide;
    this.$toast.showLoading = this.showLoading;
    this.$toast.showProgress = this.showProgress;
  }

  /**
   * 显示Toast
   */
  private show(msg: string) {
    window.clearTimeout(this.timeout);
    this.zIndex = PopupManager.nextZIndex();
    this.toast = true;
    this.content = msg;
    this.timeout = window.setTimeout(() => this.toast = false, 3000);
  }

  private showLoading() {
    if (!this.progress) {
      this.zIndex = PopupManager.nextZIndex();
      this.loading = true;
    }
  }

  private showProgress(percent: number) {
    this.zIndex = PopupManager.nextZIndex();
    this.progress = true;
    this.loading = false;
    this.percent = percent;
  }

  /**
   * 隐藏Toast
   */
  private hide() {
    this.progress = false;
    this.loading = false;
  }
}
</script>

<style lang="scss">
.toast-container {
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

  .circles {
    position: absolute;
    transition: opacity .7s;

    .circle1, .circle2 {
      background-color: #2285ee;
      opacity: .5;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      animation: 1.8s loadingLoop ease-in-out infinite;
    }

    .circle1 {
      position: absolute;
      animation-delay: -.9s;
    }

    @keyframes loadingLoop {
      0%, 100% {
        transform: scale(100%);
      }
      50% {
        transform: scale(0%);
      }
    }
  }

  .el-progress {
    position: absolute;
    transition: opacity .7s ease-out;
    background-color: #7aa6dacc;
    border-radius: 50%;

    .el-progress-circle {
      opacity: .7;
    }

    &.no-transition .el-progress-circle .el-progress-circle__path {
      transition: none !important;
    }

    .el-progress__text {
      font-size: 12px !important;
    }
  }

  .toast {
    background-color: #000a;
    padding: 10px;
    border-radius: 5px;
    color: #fff;
    transition: opacity .7s;
    pointer-events: none;
  }
}
</style>
