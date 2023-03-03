const reqMp3 = require.context('@/assets/media/', false, /\.mp3$/);
export const audios: Array<{name: string, url: string}> = reqMp3.keys().map(k => ({
  name: k.replace('./', '').replace('.mp3', ''),
  url: reqMp3(k)
}));

const reqLrc = require.context('@/assets/media/', false, /\.lrc$/);
export const lrcs: Array<{name: string, text: string}> = reqLrc.keys().map(k => ({
  name: k.replace('./', '').replace('.lrc', ''),
  text: reqLrc(k).default
}));
