/* language=JavaScript */
const networkCode = `
document.write('<base href="https://bzmusic.oss-cn-qingdao.aliyuncs.com/">');
const _fetch = window.fetch;
window.fetch = function (url, options) {
  url = new URL(url, document.baseURI);
  return _fetch.call(null, url, options);
}
`;

/* language=JavaScript */
const wallpaperCode = `
if (Object.keys(window).some(k => k.startsWith('wallpaper'))) {
  window.wallpaperProperties = {
    fps: 0,
    language: '',
    clipboard: '',
    taskbar_position: 'bottom',
    taskbar_length: 0
  };

  window.wallpaperPropertyListener = {
    applyGeneralProperties(props) {
      for (const key in props) {
        window.wallpaperProperties[key] = props[key];
      }
    },
    applyUserProperties(props) {
      for (const key in props) {
        window.wallpaperProperties[key] = props[key].value;
      }
    }
  };
}
`;

const {NODE_ENV: env, VUE_APP_BUILD_TARGET: target} = process.env;
const network = target === 'network';
const wallpaper = env === 'development' || target === 'wallpaper';

let inject = '';
if (network) {
  inject += networkCode;
}
if (wallpaper) {
  inject += wallpaperCode;
}

if (inject) {
  inject = inject.replaceAll(/\s+/g, ' ').trim();
  inject = '<script>' + inject + '</script>';
}

export default inject;
