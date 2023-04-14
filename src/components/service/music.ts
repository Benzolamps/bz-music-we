import messages from '@/assets/locale/messages';
import {FileEntity} from '@/utils/file_handle';

export interface Music {
  id?: number;
  name?: string;
  author?: string;
  album?: string;
  title: string;
  timestamp?: number;
  props?: {
    audioSampleRate: number;
    audioChannels: number;
    bitsPerSample: number;
    audioBitrate: number;
  };
  fileName?: string;
  fileSize?: number;
  duration?: number;
  musicFile: FileEntity;
  lrcFile: FileEntity;
}

export interface Playlist {
  id: number;
  name: string;
  musicCount: number;
  show: boolean;
}

export function emptyMusic(title = messages['music.no_music']) {
  return {title} as Music;
}
