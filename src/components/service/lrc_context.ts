import {Music} from '@/components/service/music';
import LrcObject, {LrcTag} from '@/utils/lrc_object';
import {bus} from '@/components/common/BaseComponent';
import messages from '@/assets/locale/messages';

export default class LrcContext {
  private music: Music;

  /* 歌词对象 */
  public lrcObj = new LrcObject();

  private currentTime = -1;

  private duration = -1;

  public currentLrcTime = -1;

  public nextLrcTime = -1;

  public currentLrcArray: LrcTag[] = [];

  public progress = 0;

  public shownLrc: LrcTag[] = [];

  public constructor() {
    this.update();
    bus.$watch('musicService.music', this.update.bind(this));
    bus.$watch('musicService.currentTime', this.update.bind(this));
    bus.$watch('musicService.duration', this.update.bind(this));
  }

  private async update() {
    if (this.music != bus.musicService.music) {
      this.shownLrc = [];
      this.currentLrcTime = this.nextLrcTime = -1;
      this.currentLrcArray = [];
      this.music = bus.musicService.music;
      const lrcContent = await this.music.lrcProvider?.text();
      this.lrcObj = new LrcObject(lrcContent);
      this.generateShownLrc();
    }
    if (bus.musicService.duration > 0) {
      if (this.duration != bus.musicService.duration) {
        this.duration = bus.musicService.duration;
      }
      if (this.currentTime != bus.musicService.currentTime) {
        this.currentTime = bus.musicService.currentTime;
        this.generateLrcTime();
      }
    }
  }

  private generateShownLrc() {
    this.shownLrc = [];
    let time = 0;
    if (this.music?.lrcProvider) {
      this.shownLrc = this.lrcObj.lrcArray;
    } else {
      if (this.music?.id) {
        this.shownLrc.push({time, content: `${this.music.title}`});
        this.shownLrc.push({time: time += 5, content: ''});
        this.shownLrc.push({time: time += 2, content: messages['music.no_lrc_1']});
      }
    }
  }

  private generateLrcTime() {
    let time = -1;
    for (const lrc of this.shownLrc) {
      if (time < lrc.time && this.currentTime >= lrc.time) {
        time = lrc.time;
      }
    }
    if (this.currentLrcTime != time) {
      this.currentLrcTime = time;
      this.nextLrcTime = Math.min(
        this.shownLrc.map(lrc => lrc.time).find(t => t > this.currentLrcTime) ?? this.currentLrcTime + 5,
        this.duration
      );
      this.currentLrcArray = this.shownLrc.filter(lrc => lrc.time == this.currentLrcTime);
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
