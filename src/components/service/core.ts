import MusicComponent from '@/components/service/component';
import {emptyMusic, Music} from '@/components/service/music';
import store from '@/components/service/store';
import messages from '@/assets/locale/messages';

/**
 * 播放模式键
 */
export type ModeKeys = 'sequence' | 'single' | 'random';

/**
 * 播放模式定义
 */
export interface Mode extends Readonly<Partial<Record<ModeKeys, boolean>>> {
  readonly key: ModeKeys;
  readonly name: string;
}

/**
 * 播放模式列表
 */
export const modes: Readonly<Record<ModeKeys, Mode>> = (() => {
  const modes: Record<ModeKeys, Mode> = {
    sequence: {key: 'sequence', name: '列表循环'},
    single: {key: 'single', name: '单曲循环'},
    random: {key: 'random', name: '随机播放'}
  };
  for (const key in modes) {
    const m = modes[key] as Mode;
    m[key] = true;
    modes[key] = Object.freeze(m);
  }
  return Object.freeze(modes);
})();

export default class MusicService extends MusicComponent {
  /* 歌曲列表 */
  public musicList: ReadonlyArray<Music> = [];
  /* 歌曲 */
  public music = emptyMusic();
  /* 播放模式 */
  public mode : Mode;

  /* 是否播放下一曲 */
  private nextMusicType: 'prev' | 'next' | 'default' = 'default';

  /* 当前选中的歌曲 */
  private choseMusic: Music;

  /* 随机歌曲列表 */
  private randomMusicList: Readonly<Array<Music>> = [];

  public constructor() {
    super();
    super.init();
    this.mode = modes[store.mode as ModeKeys] ?? modes.sequence;
    this.vue.musicStorage.onReload.add(this.initMusic);
    this.mapEvents();
  }

  private mapEvents() {
    this.on('prevMusic', this.prevMusic);
    this.on('nextMusic', this.nextMusic);
    this.on('ended', this.changeMusic);
    this.on('error', async (error: unknown) => {
      console.dir(error);
      this.vue.$message({
        type: 'error',
        message: messages['music.cannot_play'](this.music.title, error)
      });
      await this.vue.$sleep(3000);
      this.changeMusic();
    });
  }

  private initMusic() {
    this.musicList = this.vue.musicStorage.musicList;
    this.shuffleMusicList();

    const musicId = this.music.id || store.musicId;
    const music = this.musicList.find(m => m.id === musicId);

    if (music && this.music.id === music.id) {
      this.music = music;
      return;
    }

    if (!this.music.id) {
      if (music?.musicProvider) {
        this.choseMusic = music;
      }

      this.nextMusicType = 'next';
      if (this.isEnded) {
        this.changeMusic();
      } else {
        this.stop();
      }
    }
  }

  /* 选中歌曲 */
  public chooseMusic(music: Music) {
    if (music === this.music) {
      this.playOrPause();
      return true;
    }
    this.choseMusic = music;
    if (this.isPlaying) {
      this.stop();
    } else {
      this.changeMusic();
      this.play();
    }
    return true;
  }

  /* 上一曲 */
  public prevMusic() {
    this.nextMusicType = 'prev';
    if (this.isPlaying) {
      this.stop();
    } else {
      this.changeMusic();
      this.play();
    }
  }

  /* 下一曲 */
  public nextMusic() {
    this.nextMusicType = 'next';
    if (this.isPlaying) {
      this.stop();
    } else {
      this.changeMusic();
      this.play();
    }
  }

  /* 更换歌曲 */
  public changeMusic() {
    let music;
    if (this.choseMusic) {
      music = this.choseMusic;
    } else if (this.nextMusicType === 'default' && this.mode.single && this.music.id) {
      music = this.music;
    } else {
      music = this.getNearMusic();
    }
    if (music.id) {
      const blob = music.musicProvider;
      music.objUrl = URL.createObjectURL(blob);
    }
    this.setMusic(this.music = music);
    if (music.id) {
      store.musicId = music.id;
    }
    this.nextMusicType = 'default';
    this.choseMusic = null;
  }

  /* 获取上一曲或者下一曲 */
  private getNearMusic() : Music {
    let musicList: Readonly<Array<Music>>;
    if (this.mode.single || this.mode.sequence) {
      musicList = this.musicList;
    } else if (this.mode.random) {
      musicList = this.randomMusicList;
    }
    let index = musicList.findIndex(m => m.id === this.music.id);
    for (let i = 0; i < musicList.length; i++) {
      index += this.nextMusicType === 'prev' ? -1 : 1;
      if (index >= musicList.length) {
        index = 0;
      } else if (index <= -1) {
        index = musicList.length - 1;
      }
      const music = musicList[index];
      if (music.musicProvider) {
        return music;
      }
    }
    return emptyMusic();
  }

  /* 生成随机歌曲列表 */
  private shuffleMusicList() {
    const randomMusicList = Array.from(this.musicList);
    randomMusicList.shuffle();
    this.randomMusicList = Object.freeze(randomMusicList);
  }

  public setMode(mode: Mode) {
    store.mode = mode.key;
    this.mode = mode;
  }

  public override destroy() {
    super.destroy();
  }
}
