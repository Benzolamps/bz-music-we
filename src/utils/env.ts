import Vue from 'vue';

const locale = require('element-ui/lib/locale/index.js');
const zhChsLang = require('element-ui/lib/locale/lang/zh-CN.js').default;
const zhChtLang = require('element-ui/lib/locale/lang/zh-TW.js').default;
const enLang = require('element-ui/lib/locale/lang/en.js').default;
const wallpaperProperties: {
  fps: number,
  language: string,
  taskbar_position: 'bottom' | 'top' | 'left' | 'right',
  taskbar_length: number
} = window['wallpaperProperties'];

const _language = Vue.observable({value: wallpaperProperties.language || 'zh-chs'});

Object.defineProperty(wallpaperProperties, 'language', {
  set(value: string) {
    _language.value = value;
    if (value === 'zh-chs') {
      locale.use(zhChsLang);
    } else if (value === 'zh-cht') {
      locale.use(zhChtLang);
    } else {
      locale.use(enLang);
    }
  },
  get() {
    return _language.value;
  }
});

wallpaperProperties.fps = 0;
wallpaperProperties.language = _language.value;
wallpaperProperties.taskbar_position = 'bottom';
wallpaperProperties.taskbar_length = 0;

export default wallpaperProperties;
