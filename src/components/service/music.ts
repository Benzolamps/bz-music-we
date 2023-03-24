import messages from '@/assets/locale/messages';

export interface Music {
  id?: string;
  title: string;
  musicProvider: Blob;
  lrcProvider: Blob;
  objUrl?: string;
}

export function emptyMusic(title = messages['music.no_music']) {
  return {title} as Music;
}
