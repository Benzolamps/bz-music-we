import {Music} from '@/components/service/music';
import {audios, lrcs} from '@/assets/media';
import {getBinaryData} from '@/utils/common_utils';

export default class MusicStorage {
  musicList: ReadonlyArray<Music> = [];
  onReload = new Set<(...args: unknown[]) => void>();
  lrcBlobs = new Map<string, Blob>();
  audioBlobs = new Map<string, Blob>();

  public async init() {
    this.lrcBlobs = new Map(lrcs.map(lrc => [
      lrc.name,
      new Blob([lrc.text], {type: 'text/plain'})
    ]));
    for (const audio of audios) {
      this.audioBlobs.set(audio.name, await getBinaryData(audio.url));
    }
    await this.reload();
  }

  public async reload() {
    const musicList: Music[] = [];
    for (const [name, blob] of this.audioBlobs) {
      musicList.push({
        id: name,
        title: name,
        musicProvider: blob,
        lrcProvider: this.lrcBlobs.get(name),
      });
    }
    this.musicList = Object.freeze(musicList);
    this.onReload.forEach(h => h());
  }
  
  public async remove(key: string) {
    this.audioBlobs.delete(key);
    this.lrcBlobs.delete(key);
    await this.reload();
  }
  
  public async clear() {
    this.audioBlobs.clear();
    this.lrcBlobs.clear();
    await this.reload();
  }

  public async add(entries: [string, Blob][]) {
    for (const [name, blob] of entries) {
      if (blob.type.startsWith('audio/')) {
        this.audioBlobs.set(name, blob);
      } else {
        this.lrcBlobs.set(name, blob);
      }
    }
    await this.reload();
  }
}
