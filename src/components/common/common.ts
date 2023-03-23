import 'element-ui/lib/theme-chalk/index.css';
import '@/styles/index.scss';

import App from '@/App.vue';
import BaseComponent from '@/components/common/BaseComponent';
import SvgIcon from '@/components/common/SvgIcon.vue';
import {formatDelta, formatFileSize} from '@/utils/common_utils';
import Element from 'element-ui';
import Vue from 'vue';

Vue.config.productionTip = false;
Vue.use(Element, {size: 'small'});
Vue.component('SvgIcon', SvgIcon);
Vue.filter('fileSize', formatFileSize);
Vue.filter('delta', formatDelta);

export const bus = new BaseComponent();

export const app = new App().$mount('#app');
