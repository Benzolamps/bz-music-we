import Vue from 'vue';

const locale = require('element-ui/lib/locale/index.js');
const zhChsLang = require('element-ui/lib/locale/lang/zh-CN.js').default;
const zhChtLang = require('element-ui/lib/locale/lang/zh-TW.js').default;
const enLang = require('element-ui/lib/locale/lang/en.js').default;
const wallpaperProperties = window.wallpaperProperties;

const _language = Vue.observable({value: wallpaperProperties.language || 'zh-chs'});

Object.defineProperty(wallpaperProperties, 'language', {
  get() {
    return _language.value;
  },
  set(value: string) {
    _language.value = value;
    if (value === 'zh-chs') {
      locale.use(zhChsLang);
    } else if (value === 'zh-cht') {
      locale.use(zhChtLang);
    } else {
      locale.use(enLang);
    }
  }
});

wallpaperProperties.language = _language.value;

export default wallpaperProperties;
