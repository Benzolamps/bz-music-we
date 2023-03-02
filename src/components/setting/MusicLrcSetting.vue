<template>
  <el-form class="lrc-setting-container" size="mini" label-position="top" style="text-align: left;">
    <el-form-item label="字体">
      <el-select v-model="lrcStyles.font" style="width: 80%">
        <el-option key="" value="" label="苹方简体"/>
        <el-option v-for="font in fonts" :key="font" :value="font" :label="getFontName(font)"/>
      </el-select>
      <el-button style="width: 20%" @click="chooseCustomFont">自定义</el-button>
      <input type="file" ref="file" accept=".ttf,.otf,.woff,.woff2" @change="setCustomFont" v-show="false"/>
    </el-form-item>
    <el-form-item label="默认颜色">
      <div style="display: flex">
        <el-input v-model="lrcStyles.defaultColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.defaultColor"></el-color-picker>
      </div>
    </el-form-item>
    <el-form-item label="未播放颜色">
      <div style="display: flex">
        <el-input v-model="lrcStyles.futureColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.futureColor"></el-color-picker>
      </div>
    </el-form-item>
    <el-form-item label="已播放颜色">
      <div style="display: flex">
        <el-input v-model="lrcStyles.pastColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.pastColor"></el-color-picker>
      </div>
    </el-form-item>
    <el-form-item label="描边颜色">
      <div style="display: flex">
        <el-input v-model="lrcStyles.strokeColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.strokeColor"></el-color-picker>
      </div>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import PlayerSettings from '@/components/service/player_settings';
import {Ref} from 'vue-property-decorator';

@Component
export default class PlayerSetting extends BaseComponent {
  private fonts: string[] = [];
  
  @Ref('file')
  private file: HTMLInputElement;
  
  private chooseCustomFont() {
    this.file.dispatchEvent(new MouseEvent('click'));
  }
  
  private setCustomFont() {
    const f = this.file.files[0];
    this.file.value = '';
    if (f) {
      PlayerSettings.loadCustomFont(f);
    }
  }
  
  public getFontName(url: string) {
    return PlayerSettings.getFontName(url);
  }

  public override async mounted() {
    this.fonts = await getFontList();
  }
}
</script>

<style lang="scss">
.lrc-setting-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
