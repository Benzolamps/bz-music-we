import MusicComponent from '@/components/service/component';
import {emptyMusic, Music} from '@/components/service/music';
import store from '@/components/service/store';

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

  private musicInited = false;

  /* 是否播放下一曲 */
  private nextMusicType: 'prev' | 'next' | 'default' = 'default';

  /* 当前选中的歌曲 */
  private choseMusic: Music;

  /* 随机歌曲列表 */
  private randomMusicList: Readonly<Music[]> = [];

  public constructor() {
    super();
    super.init();
    this.mode = modes[store.mode as ModeKeys] ?? modes.sequence;
    this.vue.musicStorage.onReload.add(this.initMusic.bind(this));
    this.mapEvents();
  }
  
  private mapEvents() {
    this.on('prevMusic', this.prevMusic.bind(this));
    this.on('nextMusic', this.nextMusic.bind(this));
    this.on('ended', this.changeMusic.bind(this));
    this.on('error', async (error: unknown) => {
      console.dir(error);
      this.vue.$message({
        type: 'error',
        message: '无法播放' + this.music.title + ': ' + error,
      });
      await this.vue.$sleep(3000);
      await this.changeMusic();
    });
  }

  private async initMusic() {
    if (!this.musicInited) {
      this.watch('$route.query.musicId', async musicId => {
        await this.vue.$sleep(100);
        const music = this.musicList.find(m => m.id === musicId);
        if (music && music !== this.music) {
          await this.chooseMusic(music);
        }
      });
    }

    this.musicInited = true;

    this.musicList = this.vue.musicStorage.musicList;
    this.shuffleMusicList();

    const musicId = this.music.id || store.musicId;
    const music = this.musicList.find(m => m.id === musicId);

    if (music && this.music.id == music.id) {
      this.music = music;
      return;
    }

    if (!this.music.id) {
      if (music?.musicProvider) {
        this.choseMusic = music;
      }

      this.nextMusicType = 'next';
      if (this.isEnded) {
        await this.changeMusic();
      } else {
        this.stop();
      }
    }
  }

  /* 选中歌曲 */
  public async chooseMusic(music: Music) {
    if (music === this.music) {
      this.playOrPause();
      return true;
    }
    if (music.musicProvider) {
      this.choseMusic = music;
      if (this.isEnded) {
        await this.changeMusic();
        this.isPlaying || this.play();
      } else {
        this.stop();
      }
      return true;
    } else {
      this.vue.$message({
        type: 'error',
        message: '无法播放' + music.title + ': 文件不存在',
      });
      return false;
    }
  }

  /* 上一曲 */
  public async prevMusic() {
    this.nextMusicType = 'prev';
    if (this.isEnded) {
      await this.changeMusic();
      this.isPlaying || this.play();
    } else {
      this.stop();
    }
  }

  /* 下一曲 */
  public async nextMusic() {
    this.nextMusicType = 'next';
    if (this.isEnded) {
      await this.changeMusic();
      this.isPlaying || this.play();
    } else {
      this.stop();
    }
  }

  /* 更换歌曲 */
  public async changeMusic() {
    await this.vue.$nextTick();
    let music;
    if (this.choseMusic) {
      music = this.choseMusic;
    } else if (this.nextMusicType === 'default' && this.mode.single && this.music.id) {
      music = this.music;
    } else {
      music = await this.getNearMusic();
    }
    if (music.id) {
      const blob = music.musicProvider;
      await this.vue.$sleep(200);
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
  private async getNearMusic() : Promise<Music> {
    let musicList: Readonly<Music[]>;
    if (this.mode.single || this.mode.sequence) {
      musicList = this.musicList;
    } else if (this.mode.random) {
      musicList = this.randomMusicList;
    }
    // let index = musicList.indexOf(this.music);
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
