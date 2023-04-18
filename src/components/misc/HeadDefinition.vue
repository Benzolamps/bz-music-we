<template>
  <div>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta http-equiv="Expires" content="0"/>
    <meta http-equiv="Cache-Control" content="no-cache"/>
    <meta http-equiv="Cache" content="no-cache"/>
    <meta http-equiv="Pragma" content="no-cache"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"/>
    <meta name="renderer" content="webkit"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="full-screen" content="true"/>
    <meta name="screen-orientation" content="landscape"/>
    <meta name="browsermode" content="application"/>
    <meta name="theme-color" :content="themeColor"/>
    <meta name="msapplication-TileColor" :content="themeColor"/>
    <meta name="msapplication-TileImage" :content="favicon"/>
    <link rel="icon" type="image/png" :href="favicon"/>
    <link rel="apple-touch-icon" :href="favicon"/>
    <link v-if="!platform.static" rel="manifest" :href="manifestUrl"/>
  </div>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Component} from 'vue-property-decorator';
import favicon from '@/assets/img/favicon.png';


@Component
export default class HeadDefinition extends BaseComponent {
  private readonly themeColor = '#C6E2FF';
  private readonly favicon = favicon;

  private get manifestUrl() {
    const manifest = {
      name: document.title,
      short_name: document.title,
      description: document.title + ' - ' + location.host,
      start_url: new URL('index.html', location.origin),
      display: 'standalone',
      background_color: this.themeColor,
      theme_color: this.themeColor,
      icons: [
        {
          src: favicon,
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    };
    return 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest));
  }

  public override mounted() {
    const children = this.$el.children;
    for (const element of children) {
      document.head.appendChild(element);
    }
    if (!this.platform.static) {
      navigator.serviceWorker?.register(new URL('service-worker.js', location.origin));
    }
    this.$el.remove();
    this.$destroy();
  }
}
</script>
