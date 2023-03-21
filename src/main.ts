import 'element-ui/lib/theme-chalk/index.css';
import './styles/index.scss';

import Vue from 'vue';
import Element from 'element-ui';
import App from './App.vue';
import {loadBasicFonts} from '@/utils/common_utils';

Vue.config.productionTip = false;
Vue.use(Element, {size: 'small'});
loadBasicFonts().then(() => new Vue({render: h => h(App)}).$mount('#app'));
