<template>
  <div class="music-control">
    <!-- 进度条 -->
    <el-slider ref="slider"
        v-model="sliderTime"
        :disabled="musicService.isEnded"
        :max="musicService.duration" :min="0" :show-tooltip="false" :step="0.01"
        class="progress"
    />

    <!-- 时间 -->
    <div class="music-control-time">
      <span ref="currentTime" class="code-font">{{ 0 | delta }}</span>
      <span ref="duration" class="code-font">{{ 0 | delta }}</span>
    </div>

    <el-badge :value="musicStorage.musicList.length" class="music-count-badge" type="success"/>

    <!-- 按钮组 -->
    <div class="music-control-button-group">
      <div class="center">
        <!-- 上一曲 -->
        <svg-icon icon-name="music_prev" @click="musicService.prevMusic"/>

        <!-- 快退 -->
        <svg-icon icon-name="music_backward" @click="musicService.seekBackward(5)"/>

        <!-- 播放/暂停 -->
        <svg-icon
            :icon-name="`music_${musicService.isPlaying ? 'pause' : 'play'}`"
            style="margin: 0 10px;"
            @click="musicService.playOrPause"
        />

        <!-- 快进 -->
        <svg-icon icon-name="music_forward" @click="musicService.seekForward(5)"/>

        <!-- 下一曲 -->
        <svg-icon icon-name="music_next" @click="musicService.nextMusic"/>
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
        <svg-icon v-popover:popoverMode :icon-name="`music_${musicService.mode.key}`"/>

        <!-- 音量 -->
        <svg-icon
            v-popover:popoverVolume
            :icon-name="`music_${musicService.muted ? 'muted' : 'volume'}`"
        />

        <!-- 倍速 -->
        <span v-popover:popoverPitch style="line-height: 50px; padding: 0; font-size: 14px;">
          {{ musicService.pitch }}x
        </span>

        <div style="flex: 1; display: flex; justify-content: flex-end;">
          <el-tag v-if="musicService.music.musicProvider" type="info">{{ musicService.music.musicProvider.type }}</el-tag>
          <el-tag v-if="musicService.music.musicProvider" type="info">{{ musicService.music.musicProvider.size | fileSize }}</el-tag>
          <el-tag v-if="musicService.music.musicProvider" type="info">{{ musicService.duration | delta }}</el-tag>
          <el-tag v-if="!musicService.music.lrcProvider" type="warning">无歌词</el-tag>
        </div>
      </div>
    </div>

    <!-- 播放模式弹出 -->
    <el-popover
        ref="popoverMode"
        :append-to-body="false"
        placement="left"
        trigger="click"
        width="400"
    >
      <div class="popover-content">
        <span v-for="m in modes" :key="m.key" style="cursor: pointer; display: flex; align-items: center;" @click="musicService.setMode(m)">
          <svg-icon :class="{active: musicService.mode.key === m.key}" :icon-name="`music_${m.key}`" class="popover-icon" style="margin-right: 5px;"/>
          <span :class="{active: musicService.mode.key === m.key}" class="popover-text">{{ messages['music.mode.' + m.key] }}</span>
        </span>
      </div>
    </el-popover>

    <!-- 音量弹出 -->
    <el-popover
        ref="popoverVolume"
        :append-to-body="false"
        placement="left"
        trigger="click"
        width="400"
    >
      <div class="popover-content">
        <svg-icon
            :icon-name="`music_${musicService.muted ? 'muted' : 'volume'}`"
            class="popover-icon"
            style="cursor: pointer;"
            @click="musicService.toggleMuted"
        />

        <el-slider
            :max="1"
            :min="0"
            :show-tooltip="false"
            :step="0.01" :value="musicService.volume" class="popover-slider"
            @input="v => musicService.setVolume(v)"
        />
      </div>
    </el-popover>

    <!-- 倍速弹出 -->
    <el-popover
        ref="popoverPitch"
        :append-to-body="false"
        placement="left"
        trigger="click"
        width="400"
    >
      <div class="popover-content">
        <span class="popover-text">{{ messages['music.pitch'] }}</span>
        <el-slider
            :max="2"
            :min="0"
            :show-stops="true"
            :show-tooltip="false" :step="0.25" :value="musicService.pitch"
            class="popover-slider" @input="v => musicService.setPitch(v)"
        />
      </div>
    </el-popover>

    <!-- 更多弹窗 -->
    <el-drawer
        ref="moreDialog"
        :append-to-body="true"
        :modal="false"
        :modal-append-to-body="true"
        :visible.sync="showMore"
        :with-header="true"
        direction="rtl"
        size="480px"
    >
      <el-tabs style="margin: 20px" value="lrc">
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
import BaseComponent from '@/components/common/BaseComponent';
import Playlist from '@/components/core/Playlist.vue';
import MusicCarousel from '@/components/info/MusicCarousel.vue';
import {modes} from '@/components/service/core';
import MusicLrcSetting from '@/components/setting/MusicLrcSetting.vue';
import MusicVisualSetting from '@/components/setting/MusicVisualSetting.vue';
import {formatDelta} from '@/utils/common_utils';
import {ElSlider} from 'element-ui/types/slider';
import {Component, Watch} from 'vue-property-decorator';

@Component({
  components: {
    MusicVisualSetting,
    MusicLrcSetting,
    Playlist,
    MusicCarousel
  }
})
export default class MusicControl extends BaseComponent {
  private readonly modes = modes;
  /* 进度条时间 */
  private sliderTime = 0;
  /* 是否正在调节进度条 */
  private isSliding = false;
  /* 是否显示更多 */
  private readonly showMore = false;

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
        this.musicService.seek(this.sliderTime);
      }
    };
    const mouseDownHandler = () => {
      this.sliderTime = this.musicService.currentTime;
      this.isSliding = true;
    };
    const mouseMoveHandler = () => this.isSliding && this.$toast(formatDelta(this.sliderTime));
    const mouseUpHandler = () => {
      if (this.isSliding && !this.musicService.isEnded) {
        this.musicService.seek(this.sliderTime);
      }
      this.isSliding = false;
    };
    const sliderButton = slider.$el.querySelector('.el-slider__runway');
    const signal = this.abortSignal;
    sliderButton.addEventListener('click', clickHandler, {signal});
    sliderButton.addEventListener('mousedown', mouseDownHandler, {capture: true, signal});
    sliderButton.addEventListener('touchstart', mouseDownHandler, {capture: true, signal});
    document.addEventListener('mousemove', mouseMoveHandler, {capture: true, signal});
    document.addEventListener('touchmove', mouseMoveHandler, {capture: true, signal});
    document.addEventListener('mouseup', mouseUpHandler, {capture: true, signal});
    document.addEventListener('touchend', mouseUpHandler, {capture: true, signal});
  }

  private openPlaylist() {
    this.showPlaylist = true;
  }

  private updateTime() {
    const currentTimeElement = this.$refs.currentTime as HTMLElement;
    const durationElement = this.$refs.duration as HTMLElement;
    currentTimeElement.innerText = formatDelta(this.musicService.currentTime);
    durationElement.innerText = formatDelta(this.musicService.duration);
    if (!this.isSliding) {
      const slider = this.$refs.slider as ElSlider;
      let element: HTMLElement = slider.$el.querySelector('.el-slider__bar');
      element.style.width = this.musicService.currentTime / this.musicService.duration * 100 + '%';
      element = slider.$el.querySelector('.el-slider__button-wrapper');
      element.style.left = this.musicService.currentTime / this.musicService.duration * 100 + '%';
    }
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

  @Watch('musicService.currentTime')
  private watchCurrentTime() {
    this.animationRunner.once(this.updateTime);
  }
}
</script>

<style lang="scss">
.music-control {
  --button-size: min(50px, calc((100vw - 40px) / 7));
  --button-padding: min(12px, var(--button-size) * 0.24);
  position: absolute;
  bottom: 0;
  left: var(--taskbar-left);
  padding: 0;
  height: calc(80px + var(--taskbar-bottom));
  width: calc(100% - var(--taskbar-right));
  background-color: #c6e2ffbb;

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
    pointer-events: none;
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
          color: #409eff;
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
        color: #409eff;
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
  color: #2c3e50;

  &.active {
    color: #1e90ff;
  }
}
</style>
