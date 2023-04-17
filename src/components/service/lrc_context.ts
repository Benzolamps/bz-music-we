import {Music} from '@/components/service/music';
import BaseClass from '@/utils/base_class';
import {readAsBlob} from '@/utils/file_handle';
import LrcObject, {LrcTag} from '@/utils/lrc_object';
import {bus} from '@/components/common/common';
import messages from '@/assets/locale/messages';

export default class LrcContext extends BaseClass {
  private music: Music;

  /* 歌词对象 */
  public lrcObj = new LrcObject();

  private currentTime = -1;

  private duration = -1;

  public currentLrcTime = -1;

  public nextLrcTime = -1;

  public currentLrcArray: Array<LrcTag> = [];

  public progress = 0;

  public shownLrc: Array<LrcTag> = [];

  public constructor() {
    super();
    this.update();
    bus.$watch('musicService.music', this.update);
    bus.$watch('musicService.currentTime', this.update);
    bus.$watch('musicService.duration', this.update);
  }

  /**
   * 0-0.2 保持 0
   * 0.2-0.8 滚动 0-1
   * 0.8-1 保持 1
   */
  public get progressForOverflow(): number {
    if (this.progress < .2) {
      return 0;
    }
    else if (this.progress > .8) {
      return 1;
    }
    else {
      return (this.progress - .2) / .6;
    }
  }

  /**
   * 0-.9 进入 0-1
   * .9-.95 保持 1
   * .95-1 退出 1-0
   */
  public get progressForCaption(): number {
    const progress = bus.musicService.pitch < 0 ? 1 - this.progress : this.progress;
    if (progress < .9) {
      return progress / .9;
    } else if (progress >= .9 && progress < .95) {
      return 1;
    } else {
      return (1 - progress) / .05;
    }
  }

  private async update() {
    if (this.music !== bus.musicService.music) {
      this.shownLrc = [];
      this.currentLrcTime = this.nextLrcTime = -1;
      this.currentLrcArray = [];
      this.music = bus.musicService.music;
      const lrcContent = await (await readAsBlob(this.music.lrcFile))?.text();
      this.lrcObj = new LrcObject(lrcContent);
      this.generateShownLrc();
    }
    if (bus.musicService.duration > 0) {
      if (this.duration !== bus.musicService.duration) {
        this.duration = bus.musicService.duration;
      }
      if (this.currentTime !== bus.musicService.currentTime) {
        this.currentTime = bus.musicService.currentTime;
        this.generateLrcTime();
      }
    }
  }

  private generateShownLrc() {
    this.shownLrc = [];
    let time = 0;
    if (this.music?.lrcFile) {
      for (let i = 0; i < this.lrcObj.lrcArray.length; i++) {
        const lrc = this.lrcObj.lrcArray[i];
        this.shownLrc.push(lrc);
        time = lrc.time;
      }
      time += 2;
    } else {
      if (this.music?.id) {
        this.shownLrc.push({time, content: `${this.music.title}`});
        this.shownLrc.push({time: time += 5, content: ''});
        this.shownLrc.push({time: time += 2, content: messages['music.no_lrc_1']});
      }
    }

    if (this.lrcObj.dirtyLines.length > 0) {
      for (const line of this.lrcObj.dirtyLines) {
        this.shownLrc.push({time, content: `<${line}>`});
        time += 5;
      }
    }
    return this.shownLrc;
  }

  private generateLrcTime() {
    let time = -1;
    for (const lrc of this.shownLrc) {
      if (time < lrc.time && this.currentTime >= lrc.time) {
        time = lrc.time;
      }
    }
    if (this.currentLrcTime !== time) {
      this.currentLrcTime = time;
      this.nextLrcTime = Math.min(
        this.shownLrc.map(lrc => lrc.time).find(t => t > this.currentLrcTime) ?? this.currentLrcTime + 5,
        this.duration
      );
      this.currentLrcArray = this.shownLrc.filter(lrc => lrc.time === this.currentLrcTime);
    }
    if (this.currentTime < this.currentLrcTime) {
      this.progress = 0;
    } else if (this.currentTime > this.nextLrcTime) {
      this.progress = 1;
    } else {
      this.progress = (this.currentTime - this.currentLrcTime) / (this.nextLrcTime - this.currentLrcTime);
    }
  }
}
