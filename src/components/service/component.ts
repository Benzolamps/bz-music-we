import BaseComponent from '@/components/common/BaseComponent';
import {Music} from '@/components/service/music';

import defaultSrc from '@/assets/media/empty.wav';
import createAudioUrl from '@/utils/audio_decoder';
import BaseClass from '@/utils/base_class';
import {readAsBlob} from '@/utils/file_handle';

export default class MusicComponent extends BaseClass {
  /* 音乐 */
  private playingMusic: Music;
  private urls: Array<string> = [];
  /* 是否播放 */
  public isPlaying = false;
  /* 是否已播放 */
  public isPlayed = false;
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

  private readonly listeners: Partial<Record<keyof HTMLMediaElementEventMap, () => void>> = {
    canplaythrough: () => {
      if (!this.playingMusic) {
        return;
      }
      this.isEnded = false;
      this.isPaused = !this.isPlaying;
      this.duration = this.audio.duration || this.duration;
    },
    play: () => {
      if (!this.playingMusic) {
        return;
      }
      if (!this.isPlayed) {
        console.log('开始播放', this.playingMusic.title);
        this.vue.$nextTick(this.updateMediaSession);
      }
      this.isPlaying = true;
      this.isPlayed = true;
      this.isPaused = false;
      this.isEnded = false;
      this.audio.autoplay = true;
      this.audio.playbackRate = Math.abs(this.pitch);
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
        this.setMusic(null);
        return;
      }
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
    this.vue = new BaseComponent({data: this});
    this.createAudioElement();
    this.getCurrentTime();
  }

  public createAudioElement() {
    const old = this.audio;
    this.audio = document.createElement('audio');
    this.audio.style.display = 'none';
    ['preservesPitch', 'mozPreservesPitch', 'webkitPreservesPitch']
      .filter(k => k in this.audio)
      .forEach(k => this.audio[k] = false);
    for (const key in this.listeners) {
      old?.removeEventListener(key, this.listeners[key], {capture: true});
      this.audio.addEventListener(key, this.listeners[key], {capture: true, signal: this.vue.abortSignal});
    }
    document.body.append(this.audio);
    if (old) {
      old.remove();
      this.audio.src = old.src;
      const playingMusic = this.playingMusic;
      const isPlaying = this.isPlaying;
      this.playingMusic = null;
      this.audio.play().then(() => {
        this.playingMusic = playingMusic;
        this.audio.currentTime = old.currentTime;
        this.audio.muted = old.muted;
        this.audio.playbackRate = old.playbackRate;
        this.audio.volume = old.volume;
        isPlaying || this.audio.pause();
      });
    }
  }

  protected async setMusic(music: Music) {
    if (this.urls.length > 0) {
      this.urls.forEach(URL.revokeObjectURL);
      this.urls.length = 0;
    }
    if (music?.id) {
      try {
        if (this.pitch >= 0) {
          this.urls[0] = await createAudioUrl(await readAsBlob(music.musicFile), false);
          this.audio.src = this.urls[0] || defaultSrc;
        } else {
          this.urls[1] = await createAudioUrl(await readAsBlob(music.musicFile), true);
          this.audio.src = this.urls[1] || defaultSrc;
        }
      } catch (e) {
        this.vue.$sleep(100).then(() => {
          this.isPlaying = false;
          this.isPaused = false;
          this.isEnded = true;
          this.vue.$emit('error', e);
          this.setMusic(null);
        });
      }
      this.currentTime = 0;
      this.playingMusic = music;
    } else {
      this.audio.src = defaultSrc;
      this.duration = 0;
      this.currentTime = 0;
      this.playingMusic = null;
    }
    (this.vue.platform.wallpaper || this.audio.autoplay) && this.play();
  }

  private async getCurrentTime() {
    while (this.vue) {
      await this.vue.$sleep(1);
      if (!this.playingMusic) {
        continue;
      }
      const duration = this.audio.duration || this.duration;
      let currentTime: number;
      if (this.pitch >= 0) {
        currentTime = Math.min(this.audio.currentTime, this.duration) || 0;
      } else {
        currentTime = Math.min(this.duration - this.audio.currentTime, this.duration) || 0;
      }
      if (this.duration !== duration || this.currentTime !== currentTime) {
        this.duration = duration;
        this.currentTime = Math.floor(currentTime * 100) / 100;
      }
    }
  }

  /* 播放 */
  public play() {
    this.audio.play().catch(() => 0);
  }

  /* 暂停 */
  public pause() {
    this.audio.pause();
  }

  /* 停止 */
  public stop() {
    this.isEnded = true;
    this.isPlaying = false;
    this.isPlayed = false;
    this.isPaused = false;
    if (this.playingMusic) {
      this.setMusic(null);
      this.vue.$nextTick(() => this.vue.$emit('ended'));
    }
  }

  /* 播放或暂停 */
  public playOrPause() {
    this.isPlaying ? this.pause() : this.play();
  }

  /* 设置当前时间 */
  public seek(value: number) {
    if (!(this.isEnded || value < 0 || value >= this.duration)) {
      this.currentTime = value;
      if (this.pitch >= 0) {
        this.audio.currentTime = this.currentTime;
      } else {
        this.audio.currentTime = this.duration - this.currentTime;
      }
    }
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

  private changePitch: Promise<void>;

  /* 设置倍速 */
  public setPitch(value: number) {
    const old = this.pitch;
    this.pitch = value;
    this.changePitch = (async () => {
      await this.changePitch;
      if (old >= 0 === value >= 0) {
        this.audio.playbackRate = Math.abs(value);
        return;
      }
      const playingMusic = this.playingMusic;
      const isPlaying = this.isPlaying;
      this.playingMusic = null;
      if (value >= 0) {
        this.urls[0] ??= await createAudioUrl(await readAsBlob(playingMusic.musicFile), false);
        this.audio.src = this.urls[0] || defaultSrc;
      } else {
        this.urls[1] ??= await createAudioUrl(await readAsBlob(playingMusic.musicFile), true);
        this.audio.src = this.urls[1] || defaultSrc;
      }
      await this.audio.play();
      this.playingMusic = playingMusic;
      if (value >= 0) {
        this.audio.currentTime = this.currentTime;
      } else {
        this.audio.currentTime = this.duration - this.currentTime;
      }
      this.audio.playbackRate = Math.abs(value);
      isPlaying || this.audio.pause();
    })();
  }

  /* 快退 */
  public seekBackward(seekOffset: number) {
    this.seek(Math.max(0, this.currentTime - seekOffset));
  }

  /* 快进 */
  public seekForward(seekOffset: number) {
    this.seek(Math.min(this.duration, this.currentTime + seekOffset));
  }

  /* 设置锁屏界面音乐播放器信息 */
  private updateMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.playingMusic.title,
        artwork: [{src: new URL('favicon.png', document.baseURI).toString(), sizes: '128x128', type: 'image/png'}]
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => this.vue.$emit('prevMusic'));
      navigator.mediaSession.setActionHandler('nexttrack', () => this.vue.$emit('nextMusic'));
      // navigator.mediaSession.setActionHandler('seekbackward', e => this.seekBackward(e.seekOffset));
      // navigator.mediaSession.setActionHandler('seekforward', e => this.seekForward(e.seekOffset));
      navigator.mediaSession.setActionHandler('play', this.play);
      navigator.mediaSession.setActionHandler('pause', this.pause);
      navigator.mediaSession.setActionHandler('seekto', e => this.seek(e.seekTime));
    }
  }

  public watch(prop: string, callback: (e: any) => void) {
    this.vue.$watch(prop, callback);
  }

  public on(event: string, callback: (...args: Array<any>) => void) {
    this.vue.$on(event, callback);
    this.vue.$once('hook:beforeDestroy', () => this.vue.$off(event, callback));
  }

  public destroy() {
    this.vue.$destroy();
    this.vue = null;
  }
}
