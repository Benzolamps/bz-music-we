import messages from '@/assets/locale/messages';
import {bus} from '@/components/common/common';
import readMetadata from '@/components/service/blazor';
import {Music, Playlist} from '@/components/service/music';
import {audios, lrcs} from '@/assets/media';
import BaseClass from '@/utils/base_class';
import {getBinaryData, getFileBaseName} from '@/utils/common_utils';
import db from '@/utils/db';
import {FileEntity, readAsBlob, readDataTransfer, readDirectoryHandle, resolveFileHandles, resolveFiles} from '@/utils/file_handle';
import Vue from 'vue';

interface MusicStorageItemsOptions {
  audioEntities?: Array<FileEntity>;
  lrcEntities?: Array<FileEntity>;
  dirEntities?: Array<FileEntity>;
  files?: DataTransfer | Array<File | FileSystemHandle>;
  parent?: FileEntity;
  playlist?: boolean;
}

class MusicStorageItems {
  public audioEntities = new Array<FileEntity>();
  public lrcEntities = new Array<FileEntity>();
  public dirEntities = new Array<FileEntity>();

  public init(audioEntities?: Array<FileEntity>, lrcEntities?: Array<FileEntity>, dirEntities?: Array<FileEntity>) {
    this.audioEntities = audioEntities ?? [];
    this.lrcEntities = lrcEntities ?? [];
    this.dirEntities = dirEntities ?? [];
  }

  public async add(options: MusicStorageItemsOptions) {
    options.audioEntities ??= [];
    options.lrcEntities ??= [];
    options.dirEntities ??= [];
    const files = options.files instanceof DataTransfer ? await readDataTransfer(options.files) : options.files;
    if (files?.length > 0) {
      const res = new Array<FileEntity>();
      if (files.some(f => f instanceof File)) {
        res.push(...resolveFiles(files as Array<File>));
      } else {
        res.push(...await resolveFileHandles(files as Array<FileSystemHandle>, options.parent, options.playlist));
      }
      options.audioEntities.push(...res.filter(e => getType(e) === 'audio'));
      options.lrcEntities.push(...res.filter(e => getType(e) === 'lrc'));
      options.dirEntities.push(...res.filter(e => getType(e) === 'directory'));
    }

    await insert(options.audioEntities, this.audioEntities);
    await insert(options.lrcEntities, this.lrcEntities);
    await insert(options.dirEntities, this.dirEntities);

    async function getExist(files: Array<FileEntity>, file: FileEntity) {
      for (const f of files) {
        if (f.id === file.id) {
          return f;
        }
        // isSameEntry较为耗时，先判断name是否相等，再判断文件是否相同
        if (!options.parent && f.handle && file.handle && f.name === file.name && await f.handle.isSameEntry(file.handle) === true) {
          return f;
        }
      }
      return null;
    }

    async function insert(src: Array<FileEntity>, dest: Array<FileEntity>) {
      for (const file of src) {
        const exist = await getExist(dest, file);
        if (!exist || exist.blob || exist.timestamp !== file.timestamp) {
          dest.remove(exist);
          dest.push(file);
        }
      }
    }
  }

  public remove(file: FileEntity) {
    this.audioEntities.removeIf(f => f.id === file.id || f.parentId === file.id);
    this.lrcEntities.removeIf(f => f.id === file.id || f.parentId === file.id);
    this.dirEntities.removeIf(f => f.id === file.id || f.parentId === file.id);
  }
  
  public clear() {
    this.audioEntities.length = 0;
    this.lrcEntities.length = 0;
  }
  
  public async refresh() {
    await this.extract(true);
    const files = this.audioEntities.filter(e => !e.parentId && e.handle).map(e => e.handle);
    await this.add({files});
  }
  
  public async extract(playlist = false) {
    if (this.dirEntities.length > 0) {
      for (const dir of this.dirEntities) {
        const files = await readDirectoryHandle(dir.handle);
        await this.add({files, parent: dir, playlist});
      }
      if (!playlist) {
        this.dirEntities.length = 0;
      }
    }
  }

  public toMusicList(oldMusicList: Array<Music>) {
    return this.audioEntities.map(file => {
      let music = oldMusicList.find(m => m.id === file.id && m.timestamp === file.timestamp);
      if (!music) {
        music = {
          id: file.id,
          timestamp: file.timestamp,
          title: getFileBaseName(file.path),
          musicFile: file,
          lrcFile: this.findLrc(file)
        };
      }
      const lrcFile = this.findLrc(file);
      if (!music.lrcFile || lrcFile && (music.lrcFile.id !== lrcFile.id || music.lrcFile.timestamp !== lrcFile.timestamp)) {
        music.lrcFile = lrcFile;
      }
      return music;
    });
  }

  private findLrc(file: FileEntity) {
    return this.lrcEntities.find(e => e.path.toLowerCase() === file.path.replace(/\.[^.]*$/, '.lrc').toLowerCase());
  }
}

export default class MusicStorage extends BaseClass {
  public musicList = new Array<Music>();
  private readonly musicStorageItems = new MusicStorageItems();
  
  public onReload = () => {};

  public get playlists(): Array<Playlist> {
    return this.musicStorageItems.dirEntities
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(d => ({
        id: d.id,
        name: d.name,
        musicCount: this.musicList.filter(m => m.musicFile.parentId === d.id).length,
        show: d.show
      }));
  }
  
  public removePlaylist(playlist: Playlist) {
    const fileEntity = this.musicStorageItems.dirEntities.find(e => e.id === playlist.id);
    this.musicStorageItems.remove(fileEntity);
    this.reload();
  }

  public setPlaylistShow(playlist: Playlist) {
    const fileEntity = this.musicStorageItems.dirEntities.find(e => e.id === playlist.id);
    fileEntity.show = playlist.show;
    this.onReload();
  }

  public readonly retrieveContext = {
    defaultPlaylist: new MusicStorageItems(),
    dirPlaylists: new Map<FileEntity, MusicStorageItems>(),
    resolve: null as (res: boolean) => void,
    reject: null as () => void,
    state: 'finish' as 'pending' | 'ready' | 'processing' | 'finish'
  };

  public async init() {
    this.musicList = await db.table('music').toArray();
    if (this.musicList.length > 0) {
      const audioEntities: Array<FileEntity> = this.musicList.map(m => m.musicFile);
      const lrcEntities: Array<FileEntity> = this.musicList.map(m => m.lrcFile).filter(e => e);
      const dirEntities: Array<FileEntity> = await db.table('dir').toArray();
      await this.musicStorageItems.init(audioEntities, lrcEntities, dirEntities);
      this.musicList.sort((a, b) => a.musicFile.path.localeCompare(b.musicFile.path));
      Object.freeze(this.musicList);
      this.onReload();
    } else {
      const files = new Array<File>();
      for (const lrc of lrcs) {
        const file = new File([lrc.text], lrc.name + '.lrc', {type: 'text/lrc'});
        files.push(file);
      }
      for (const audio of audios) {
        const blob = await getBinaryData(audio.url);
        const file = new File([blob], audio.name + '.mp3', {type: 'audio/mpeg'});
        files.push(file);
      }
      await this.musicStorageItems.add({files});
      await this.reload();
    }

    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => {
      if (e.dataTransfer.files.length !== 0) {
        e.preventDefault();
        this.add(e.dataTransfer);
      }
    });

    document.addEventListener('paste', e => {
      if (e.clipboardData.files.length !== 0) {
        e.preventDefault();
        this.add(e.clipboardData);
      }
    });
  }

  public reload() {
    this.musicList = this.musicStorageItems.toMusicList(this.musicList);
    this.musicList.sort((a, b) => a.musicFile.path.localeCompare(b.musicFile.path));
    Object.freeze(this.musicList);
    this.save();
    this.onReload();
  }
  
  public async refresh() {
    bus.$toast.showLoading();
    await this.musicStorageItems.refresh();
    await this.reload();
    bus.$toast.close();
  }

  public async remove(music: Music) {
    const audio = this.musicStorageItems.audioEntities.find(e => e.id === music.id);
    this.musicStorageItems.remove(audio);
    if (music.lrcFile && !this.musicList.some(m => m !== music && m.lrcFile?.id === music.lrcFile.id)) {
      const lrc = this.musicStorageItems.lrcEntities.find(e => e.id === music.lrcFile.id);
      this.musicStorageItems.remove(lrc);
    }
    await this.reload();
  }

  public async clear() {
    try {
      await bus.$confirm(
        messages['music.clear.confirm'],
        messages['music.warning'],
        {
          confirmButtonText: messages['music.confirm'],
          cancelButtonText: messages['music.cancel'],
          type: 'warning',
          center: true,
          closeOnClickModal: false
        }
      );
      this.musicStorageItems.clear();
      await this.reload();
    } catch {
      // cancelled
    }
  }
  
  public async add(files: DataTransfer | Array<File | FileSystemHandle>) {
    if (this.retrieveContext.state !== 'finish') {
      return;
    }
    try {
      const musicStorageItems = new MusicStorageItems();
      this.retrieveContext.state = 'pending';
      const promise = new Promise<boolean>((resolve, reject) => {
        this.retrieveContext.resolve = resolve;
        this.retrieveContext.reject = reject;
      });
      await musicStorageItems.add({files});
      this.retrieveContext.defaultPlaylist = musicStorageItems;
      this.retrieveContext.dirPlaylists = new Map(await Promise.all(musicStorageItems.dirEntities.map(async e => {
        const musicStorageItems = new MusicStorageItems();
        await musicStorageItems.init(null, null, [e]);
        await musicStorageItems.extract();
        return [e, musicStorageItems] as const;
      })));
      this.retrieveContext.state = 'ready';
      const playlist = await promise;
      this.retrieveContext.state = 'processing';
      await musicStorageItems.extract(playlist);
      await this.musicStorageItems.add(musicStorageItems);
      await this.reload();
    } catch (e) {
      // 取消
    } finally {
      this.retrieveContext.state = 'finish';
      this.retrieveContext.defaultPlaylist = new MusicStorageItems();
      this.retrieveContext.dirPlaylists = new Map();
    }
  }
  
  public save() {
    return db.transaction('readwrite', [db.table('dir'), db.table('music')], async () => {
      await db.table('dir').clear();
      await db.table('dir').bulkPut(this.musicStorageItems.dirEntities);
      await db.table('music').clear();
      await db.table('music').bulkPut(this.musicList.filter(m => m.musicFile.parentId));
    });
  }

  public async generateMusicProps(music: Music) {
    if (!music || music.props) {
      return;
    }
    try {
      const blob = await readAsBlob(music.musicFile);
      const file = blob instanceof File ? blob : new File([blob], music.musicFile.path);
      const res = await readMetadata(file);
      for (const key in res) {
        Vue.set(music, key, res[key]);
      }
      if (music.musicFile.parentId) {
        db.table('music').put(music);
      }
    } catch (e) {
      console.dir(e);
    }
  }
}

export function getType(fileEntity: FileEntity) {
  if (fileEntity.type.startsWith('audio/')) {
    return 'audio';
  } else if (fileEntity.type === 'text/lrc') {
    return 'lrc';
  } else  if (fileEntity.handle?.kind === 'directory'){
    return 'directory';
  } else {
    return '';
  }
}
