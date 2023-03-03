import BaseComponent from '@/components/common/BaseComponent';
import {Music} from '@/components/service/music';

import defaultSrc from '@/assets/media/empty.wav';

export default class MusicComponent {
  /* 音乐 */
  private playingMusic: Music;
  /* 是否播放 */
  public isPlaying = false;
  /* 是否暂停 */
  public isPaused = false;
  /* 是否停止 */
  public isEnded = true;
  /* 当前时间 */
  public currentTime = 0;
  
  /* 总时长 */
  public duration = 0;
  /* 是否静音 */
  public muted = false;
  /* 音量 */
  public volume = 1;
  /* 倍速 */
  public pitch = 1;

  public audio: HTMLAudioElement;

  protected vue: BaseComponent;

  private listeners: Partial<Record<keyof HTMLMediaElementEventMap, () => void>> = {
    play: () => {
      if (!this.playingMusic) {
        return;
      }
      if (this.isEnded) {
        console.log('开始播放', this.playingMusic.title);
      }
      this.isPlaying = true;
      this.isPaused = false;
      this.isEnded = false;
      this.audio.playbackRate = this.pitch;
      this.vue.$emit('play');
    },
    pause: () => {
      if (!this.playingMusic) {
        return;
      }
      this.isPlaying = false;
      this.isPaused = true;
      this.isEnded = false;
      this.vue.$emit('pause');
    },
    ended: () => {
      if (!this.playingMusic) {
        return;
      }
      this.isPlaying = false;
      this.isPaused = false;
      this.isEnded = true;
      this.stop();
    },
    error: () => {
      if (!this.playingMusic) {
        return;
      }
      this.isPlaying = false;
      this.isPaused = false;
      this.isEnded = true;
      this.vue.$emit('error', this.audio.error);
      this.setMusic(null);
    }
  };

  protected init() {
    this.createAudioElement();
    this.vue = new BaseComponent({data: this});
    this.getCurrentTime();
  }
  
  public createAudioElement() {
    const old = this.audio;
    this.audio = document.createElement('audio');
    for (const key in this.listeners) {
      old?.removeEventListener(key, this.listeners[key], {capture: true});
      this.audio.addEventListener(key, this.listeners[key], {capture: true});
    }
    this.audio.style.display = 'none';
    document.body.append(this.audio);
    if (old) {
      old.remove();
      this.audio.src = old.src;
      this.audio.play().then(() => {
        this.isPlaying || this.audio.pause();
        this.audio['preservesPitch'] = false;
        this.audio.currentTime = old.currentTime;
        this.audio.muted = old.muted;
        this.audio.playbackRate = old.playbackRate;
        this.audio.volume = old.volume;
      });
    }
  }

  protected setMusic(music: Music) {
    if (this.playingMusic) {       
      if (this.playingMusic.objUrl) {
        URL.revokeObjectURL(this.playingMusic.objUrl);
        delete this.playingMusic.objUrl;
      }
    }
    if (music?.id) {
      this.audio.src = music.objUrl || defaultSrc;
      this.duration = 0;
      this.playingMusic = music;
      this.currentTime = 0;
      this.play();
    } else {
      this.audio.src = defaultSrc;
      this.duration = 0;
      this.currentTime = 0;
      this.playingMusic = null;
    }
  }

  private async getCurrentTime() {
    while (this.vue) {
      await this.vue.$sleep(1);
      if (!this.playingMusic) {
        continue;
      }
      const duration = this.audio.duration || this.duration;
      const currentTime = Math.min(this.audio.currentTime, this.duration) || 0;
      if (this.duration !== duration || this.currentTime !== currentTime) {
        this.duration = duration;
        this.currentTime = Math.floor(currentTime * 100) / 100;
      }
    }
  }

  /* 播放 */
  public play() {
    this.audio.autoplay = true;
    this.audio.play().catch(() => 0);
  }

  /* 暂停 */
  public pause() {
    this.audio.pause();
  }

  /* 停止 */
  public stop() {
    if (this.playingMusic) {
      this.setMusic(null);
      this.audio.src = defaultSrc;
      this.isEnded = true;
      this.isPlaying = false;
      this.currentTime = 0;
      this.vue.$nextTick(() => this.vue.$emit('ended'));
    }
  }

  /* 播放或暂停 */
  public playOrPause() {
    this.isPlaying ? this.pause() : this.play();
  }

  /* 设置当前时间 */
  public seek(value: number) {
    this.isEnded || (this.audio.currentTime = value);
  }

  /* 切换静音 */
  public toggleMuted() {
    this.muted = this.audio.muted = !this.muted;
  }

  /* 设置音量 */
  public setVolume(value: number) {
    this.muted = this.audio.muted = false;
    this.volume = this.audio.volume = value;
  }

  /* 设置倍速 */
  public setPitch(value: number) {
    this.pitch = this.audio.playbackRate = value;
  }

  /* 快退 */
  public seekBackward(seekOffset: number) {
    this.seek(Math.max(0, this.currentTime - seekOffset));
  }

  /* 快进 */
  public seekForward(seekOffset: number) {
    this.seek(Math.min(this.duration, this.currentTime + seekOffset));
  }

  public watch(prop: string, callback: (e: any) => void) {
    this.vue.$watch(prop, callback);
  }

  public on(event:string, callback: (...args: any[]) => void) {
    this.vue.$on(event, callback);
    this.vue.$once('hook:beforeDestroy', () => this.vue.$off(event, callback));
  }

  public destroy() {
    for (const key in this.listeners) {
      this.audio.removeEventListener(key, this.listeners[key]);
    }
    this.vue.$destroy();
    this.vue = null;
  }
}
