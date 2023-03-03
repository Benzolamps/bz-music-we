import {Music} from '@/components/service/music';
import {audios, lrcs} from '@/assets/media';

export default class MusicStorage {
  musicList: ReadonlyArray<Music> = [];
  onReload = new Set<(...args: unknown[]) => void>();
  
  public async loadDefault() {
    const musicList: Music[] = [];
    for (const audio of audios) {
      let lrcProvider: Blob = null;
      const lrc = lrcs.find(lrc => lrc.name == audio.name);
      if (lrc) {
        lrcProvider = new Blob([lrc.text], {type: 'text/plain'});
      }
      musicList.push({
        id: Math.random().toString(),
        title: audio.name,
        musicProvider: await (await fetch(audio.url)).blob(),
        lrcProvider,
        extension: 'mp3'
      });
    }
    this.musicList = Object.freeze(musicList);
    this.onReload.forEach(h => h());
  }
}
