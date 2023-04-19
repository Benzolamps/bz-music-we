import 'element-ui/lib/theme-chalk/index.css';
import '@/styles/index.scss';

import App from '@/App.vue';
import BaseComponent from '@/components/common/BaseComponent';
import SvgIcon from '@/components/common/SvgIcon.vue';
import WallpaperContainer from '@/components/misc/WallpaperContainer.vue';
import {formatDelta, formatFileSize} from '@/utils/common_utils';
import platform from '@/utils/platform';
import Element from 'element-ui';
import Vue from 'vue';

Vue.config.productionTip = false;
Vue.use(Element, {size: 'large'});
Vue.component('SvgIcon', SvgIcon);
Vue.filter('fileSize', formatFileSize);
Vue.filter('delta', formatDelta);

export const bus = new BaseComponent();

let component;
if (platform.wallpaper && window === window.top) {
  component = new WallpaperContainer();
} else {
  component = new App();
}

export const app = component.$mount('#app');
