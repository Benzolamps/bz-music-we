export interface Music {
  id?: string,
  title: string,
  extension: string,
  musicProvider: Blob,
  lrcProvider: Blob,
  objUrl?: string
}

export function emptyMusic(title = '暂无歌曲') : Music {
  return {title: title} as Music;
}
