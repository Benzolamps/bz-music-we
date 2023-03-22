<template>
  <el-form class="lrc-setting-container" size="mini" label-position="top" style="text-align: left;">
    <el-form-item :label="messages['lrc.font']">
      <el-select v-model="lrcStyles.font" style="width: 80%">
        <el-option v-for="font in fonts" :key="font.name" :value="font.name" :label="font.name"/>
      </el-select>
      <el-button style="width: 20%" @click="chooseCustomFont">{{messages['lrc.font.custom']}}</el-button>
      <input type="file" ref="file" accept=".ttf,.otf,.woff,.woff2" @change="setCustomFont" v-show="false"/>
    </el-form-item>
    <el-form-item :label="messages['lrc.color.default']">
      <div style="display: flex">
        <el-input v-model="lrcStyles.defaultColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.defaultColor"/>
      </div>
    </el-form-item>
    <el-form-item :label="messages['lrc.color.future']">
      <div style="display: flex">
        <el-input v-model="lrcStyles.futureColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.futureColor"/>
      </div>
    </el-form-item>
    <el-form-item :label="messages['lrc.color.past']">
      <div style="display: flex">
        <el-input v-model="lrcStyles.pastColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.pastColor"/>
      </div>
    </el-form-item>
    <el-form-item :label="messages['lrc.color.stroke']">
      <div style="display: flex">
        <el-input v-model="lrcStyles.strokeColor" readonly style="flex: 1"/>
        <el-color-picker v-model="lrcStyles.strokeColor"/>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="warning" @click="resetSettings">{{messages['music.reset_default']}}</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import PlayerSettings from '@/components/service/player_settings';
import {Ref} from 'vue-property-decorator';

@Component
export default class MusicLrcSetting extends BaseComponent {
  private readonly fonts = PlayerSettings.fontList;

  @Ref('file')
  private readonly file: HTMLInputElement;

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

  private resetSettings() {
    this.lrcStyles.font = PlayerSettings.defaultLrcStyles.font;
    this.lrcStyles.defaultColor = PlayerSettings.defaultLrcStyles.defaultColor;
    this.lrcStyles.strokeColor = PlayerSettings.defaultLrcStyles.strokeColor;
    this.lrcStyles.pastColor = PlayerSettings.defaultLrcStyles.pastColor;
    this.lrcStyles.futureColor = PlayerSettings.defaultLrcStyles.futureColor;
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
