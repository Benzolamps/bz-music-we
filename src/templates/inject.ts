import networkCode from '@/templates/network.html';
import wallpaperCode from '@/templates/wallpaper.html';

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

export default inject;
