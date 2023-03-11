<template>
  <div class="music-control">
    <!-- 进度条 -->
    <el-slider
      class="progress"
      v-model="sliderTime"
      ref="slider"
      :min="0" :max="musicService.duration" :step="0.01" :show-tooltip="false"
      :disabled="musicService.isEnded"
    />

    <!-- 时间 -->
    <div class="music-control-time">
      <span ref="time" class="code-font">00:00.00</span>
      <span class="code-font">{{ musicService.duration | delta }}</span>
    </div>

    <el-badge :value="musicStorage.musicList.length" type="success" class="music-count-badge"/>

    <!-- 按钮组 -->
    <div class="music-control-button-group">
      <div class="center">
        <!-- 上一曲 -->
        <svg-icon icon-name="music_prev" @click="musicService.prevMusic()"/>

        <!-- 快退 -->
        <svg-icon icon-name="music_backward" @click="musicService.seekBackward(5)"/>

        <!-- 播放/暂停 -->
        <svg-icon
          :icon-name="`music_${musicService.isPlaying ? 'pause' : 'play'}`"
          @click="musicService.playOrPause()"
          style="margin: 0 10px;"
        />

        <!-- 快进 -->
        <svg-icon icon-name="music_forward" @click="musicService.seekForward(5)"/>

        <!-- 下一曲 -->
        <svg-icon icon-name="music_next" @click="musicService.nextMusic()"/>
      </div>

      <!-- 左侧按钮 -->
      <div class="left">
        <!-- 播放列表 -->
        <svg-icon
          icon-name="music_playlist"
          width="21" x="2"
          @click="openPlaylist"
        />

        <music-carousel style="flex: 1; margin-left: 10px;"/>
      </div>

      <!-- 右侧按钮 -->
      <div class="right">
        <!-- 更多按钮 -->
        <svg-icon icon-name="music_more" @click="showMore = true"/>

        <!-- 播放模式 -->
        <svg-icon :icon-name="`music_${musicService.mode.key}`" v-popover:popoverMode/>

        <!-- 音量 -->
        <svg-icon
          :icon-name="`music_${musicService.muted ? 'muted' : 'volume'}`"
          v-popover:popoverVolume
        />
 
        <!-- 倍速 -->
        <span style="line-height: 50px; padding: 0; font-size: 14px;" v-popover:popoverPitch>
          {{ musicService.pitch }}x
        </span>
      </div>
    </div>

    <!-- 播放模式弹出 -->
    <el-popover
      ref="popoverMode"
      placement="top"
      width="400"
      trigger="click"
      :append-to-body="false"
    >
      <div class="popover-content">
        <span v-for="m in modes" :key="m.key" @click="musicService.setMode(m)" style="cursor: pointer; display: flex; align-items: center;">
          <svg-icon :icon-name="`music_${m.key}`" class="popover-icon" :class="{active: musicService.mode.key === m.key}" style="margin-right: 5px;"/>
          <span class="popover-text" :class="{active: musicService.mode.key === m.key}">{{ messages['music.mode.' + m.key] }}</span>
        </span>
      </div>
    </el-popover>

    <!-- 音量弹出 -->
    <el-popover
      ref="popoverVolume"
      placement="top"
      width="400"
      trigger="click"
      :append-to-body="false"
    >
      <div class="popover-content">
        <svg-icon
          :icon-name="`music_${musicService.muted ? 'muted' : 'volume'}`"
          class="popover-icon"
          style="cursor: pointer;"
          @click="musicService.toggleMuted()"
        />

        <el-slider
          class="popover-slider"
          :value="musicService.volume"
          @input="v => musicService.setVolume(v)"
          :min="0" :max="1" :step="0.01"
          :show-tooltip="false"
        />
      </div>
    </el-popover>

    <!-- 倍速弹出 -->
    <el-popover
      ref="popoverPitch"
      placement="top"
      width="400"
      trigger="click"
      :append-to-body="false"
    >
      <div class="popover-content">
        <span class="popover-text">{{messages['music.pitch']}}</span>
        <el-slider
          class="popover-slider"
          :value="musicService.pitch"
          @input="v => musicService.setPitch(v)"
          :min="0" :max="2" :step="0.25"
          :show-stops="true" :show-tooltip="false"
        />
      </div>
    </el-popover>

    <!-- 更多弹窗 -->
    <el-drawer
      ref="moreDialog"
      :modal="false"
      :visible.sync="showMore"
      :with-header="true"
      direction="rtl"
      size="480px"
      :append-to-body="true"
      :modal-append-to-body="true"
    >
      <el-tabs value="lrc" style="margin: 20px">
        <el-tab-pane :label="messages['lrc.settings']" name="lrc">
          <music-lrc-setting/>
        </el-tab-pane>
        <el-tab-pane :label="messages['visual.settings']" name="visual">
          <music-visual-setting/>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <playlist :show.sync="showPlaylist"/>
  </div>
</template>

<script lang="ts">
import {modes} from '@/components/service/core';
import BaseComponent from '@/components/common/BaseComponent';
import {Watch} from 'vue-property-decorator';
import {ElSlider} from 'element-ui/types/slider';
import Component from 'vue-class-component';
import assert from 'assert';
import MusicCarousel from '@/components/info/MusicCarousel.vue';
import {formatDelta} from '@/utils/common_utils';
import Playlist from '@/components/core/Playlist.vue';
import MusicLrcSetting from '@/components/setting/MusicLrcSetting.vue';
import MusicVisualSetting from '@/components/setting/MusicVisualSetting.vue';
   
@Component({components: {MusicVisualSetting, MusicLrcSetting, Playlist, MusicCarousel}})
export default class MusicControl extends BaseComponent {
  private readonly modes = modes;
  /* 进度条时间 */
  private sliderTime = 0;
  /* 是否正在调节进度条 */
  private isSliding = false;
  /* 是否显示更多 */
  private showMore = false;

  private showPlaylist = false;

  public override mounted() {
    this.addSliderEventListeners();
  }

  /* 为进度条添加监听器，判断是否正在调节进度条 */
  private addSliderEventListeners() {
    const slider = this.$refs.slider as ElSlider;
    const clickHandler = () => {
      if (!this.musicService.isEnded) {
        this.$toast(formatDelta(this.sliderTime));
        return this.musicService.seek(this.sliderTime);
      }
    };
    const mouseDownHandler = () => {
      this.sliderTime = this.musicService.currentTime;
      this.isSliding = true;
    };
    const mouseMoveHandler = () => {
      this.isSliding && this.$toast(formatDelta(this.sliderTime));
    };
    const mouseUpHandler = () => {
      if (this.isSliding && !this.musicService.isEnded) {
        this.musicService.seek(this.sliderTime);
      }
      this.isSliding = false;
    };
    const sliderButton = slider.$el.querySelector('.el-slider__runway');
    assert.ok(sliderButton);
    sliderButton.addEventListener('click', clickHandler);
    sliderButton.addEventListener('mousedown', mouseDownHandler, {capture: true});
    sliderButton.addEventListener('touchstart', mouseDownHandler, {capture: true});
    sliderButton.addEventListener('mousemove', mouseMoveHandler, {capture: true});
    sliderButton.addEventListener('touchmove', mouseMoveHandler, {capture: true});
    window.addEventListener('mouseup', mouseUpHandler, {capture: true});
    window.addEventListener('touchend', mouseUpHandler, {capture: true});
  }

  private openPlaylist() {
    this.showPlaylist = true;
  }

  @Watch('musicService.mode.name')
  private watchMode(value: string, oldValue: string) {
    oldValue && this.$toast(value);
  }

  @Watch('musicService.pitch')
  private watchPitch(value: number, oldValue: number) {
    oldValue && this.$toast(this.messages['music.pitch'] + this.messages.colon + value + '×');
  }

  @Watch('musicService.muted')
  private watchMuted(value: boolean, oldValue: boolean) {
    oldValue !== undefined && this.$toast(this.messages[value ? 'music.mute' : 'music.unmute']);
  }

  @Watch('musicService.volume')
  private watchVolume(value: number, oldValue: number) {
    oldValue && this.$toast(this.messages['music.volume'] + this.messages.colon + Math.floor(value * 100));
  }

  private t = 0;
  @Watch('musicService.currentTime')
  private watchCurrentTime() {
    window.requestAnimationFrame((t) => {
      if (t == this.t) {
        return;
      }
      this.t = t;
      this.$refs.time['innerText'] = formatDelta(this.musicService.currentTime);
      if (!this.isSliding) {
        const slider = this.$refs.slider as ElSlider;
        let element = slider.$el.querySelector('.el-slider__bar') as HTMLElement;
        element.style.width = (this.musicService.currentTime / this.musicService.duration) * 100 + '%';
        element = slider.$el.querySelector('.el-slider__button-wrapper') as HTMLElement;
        element.style.left = (this.musicService.currentTime / this.musicService.duration) * 100 + '%';
      }
    });
  }
}
</script>

<style lang="scss">
.music-control {
  --button-size: min(50px, calc((100vw - 40px) / 7));
  --button-padding: min(12px, var(--button-size) * 0.24);
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 0px;
  height: 80px;
  width: 100%;
  background-color: #C6E2FFBB;

  .el-slider.progress {
    margin-top: -20px;

    .el-slider__runway {
      height: 4px;
    }

    .el-slider__bar {
      height: 4px;
    }

    .el-slider__button {
      width: 4px;
      height: 4px;
    }
  }

  .music-count-badge {
    position: absolute;
    left: 20px;
    transform: scale(0.8);
  }

  .music-control-button-group {
    display: flex;

    & > .center {
      order: 2;
      display: flex;
      justify-content: center;

      & > * {
        width: var(--button-size);
        height: var(--button-size);
        cursor: pointer;
        color: #606266;

        &:hover {
          color: #409EFF;
        }
      }
    }

    & > .left {
      order: 1;
      flex: 1;
      display: flex;
      justify-content: left;
    }

    & > .right {
      order: 3;
      flex: 1;
      display: flex;
      justify-content: right;
      flex-direction: row-reverse;
    }

    & > :not(.center) > * {
      width: var(--button-size);
      height: var(--button-size);
      padding: var(--button-padding);
      box-sizing: border-box;
      cursor: pointer;
      color: #606266;
      font-size: 18px;
      font-weight: 700;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .music-control-time {
    margin-top: -15px;
    display: flex;
    justify-content: space-between;
    padding: 0 5px;

    span {
      color: #606266;
      font-size: 10px;
    }
  }
}

.popover-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 38px;
}

.popover-slider {
  width: calc(100% - 75px);
}

.popover-text {
  font-weight: 700;
  line-height: 25px;
}

.popover-icon {
  width: 25px;
  height: 25px;
}

.popover-text, .popover-icon {
  color: #2C3E50;

  &.active {
    color: dodgerblue;
  }
}
</style>
