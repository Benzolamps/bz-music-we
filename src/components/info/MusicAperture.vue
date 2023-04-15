<template>
  <div class="popover-content">
    <span class="popover-text">{{messages['visual']}}</span>
    <div :style="{width: `calc(100% - ${language === 'zh' ? '75px' : '110px'})`}">
      <el-switch style="float: left;" v-model="visualStates.show"/>
      <el-dropdown style="float: right;" trigger="click" size="large" @command="cmd => cmd()">
        <span v-if="language === 'zh'" class="popover-text active" style="cursor: pointer;">
          {{visualActions.filter(a => a.value && a.tag).map(a => a.tag).join(attrSeparator)}}
        </span>
        <span v-else class="popover-text active" style="cursor: pointer;">Options</span>
        <el-dropdown-menu slot="dropdown" style="text-align: left;">
          <template v-for="action in visualActions">
            <el-dropdown-item v-if="action.enabled" :key="action.name" :command="() => action.value = !action.value">
              <i class="el-icon-check" :style="action.value || {visibility: 'hidden'}"/>
              {{action.name}}
            </el-dropdown-item>
          </template>
          <el-dropdown-item :command="() => visualStyles.random = !visualStyles.random">
            <i class="el-icon-check" :style="visualStyles.random || {visibility: 'hidden'}"/>
            {{messages['visual.preset.random']}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    
  </div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator';
import BaseComponent from '@/components/common/BaseComponent';

@Component
export default class MusicAperture extends BaseComponent {}
</script>
