import Vue from 'vue';

/* region element-ui */
import Element from 'element-ui';
import {ElMessageOptions} from 'element-ui/types/message';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Element, {size: 'small'});
/* endregion */

/* region svg-icon */
import './assets/icons';
import SvgIcon from '@/components/common/SvgIcon.vue';
Vue.component('SvgIcon', SvgIcon);
/* endregion */

/* region vue misc */
import './styles/index.scss';
Vue.config.productionTip = false;
/* endregion */

/* region init app */
import App from './App.vue';

new Vue({
  render: h => h(App),
}).$mount('#app');
/* endregion */
 