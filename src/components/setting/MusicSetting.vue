<template>
  <div>
    <el-drawer
      :modal="false"
      :with-header="true"
      direction="rtl"
      size="480px"
      :append-to-body="true"
      :modal-append-to-body="true"
    >
     <music-lrc-setting/>
    </el-drawer>

    <el-drawer
      :modal="false"
      :with-header="true"
      direction="rtl"
      size="480px"
      :append-to-body="true"
      :modal-append-to-body="true"
    >
      <music-visual-setting/>
    </el-drawer>
  </div>
</template>

<script lang="ts">

import ProxySetting from '@/components/setting/ProxySetting.vue';
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import MusicLrcSetting from '@/components/setting/MusicLrcSetting.vue';
import MusicVisualSetting from '@/components/setting/MusicVisualSetting.vue';

@Component({components: {MusicVisualSetting, MusicLrcSetting, ProxySetting}})
export default class MenuDropDown extends BaseComponent {
}
</script>

<style lang="scss">
.menu-dropdown {
  position: absolute;
  top: 0;
  right: 0;
  margin: 20px;
  z-index: 5;

  [client]:not([fullscreen]) & {
    margin-top: 40px;
  }
}
</style>
