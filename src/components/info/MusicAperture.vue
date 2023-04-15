<template>
  <div class="popover-content">
    <span class="popover-text">可视化</span>
    <div style="width: calc(100% - 75px);">
      <el-switch v-model="visualStates.show"/>
      <el-dropdown style="float: right;" trigger="click" size="large" @command="cmd => cmd()">
        <span class="popover-text active" style="cursor: pointer;">
          {{visualActions.filter(a => a.value && a.tag).map(a => a.tag).join(attrSeparator)}}
        </span>
        <el-dropdown-menu slot="dropdown" style="text-align: left;">
          <template v-for="action in visualActions">
            <el-dropdown-item v-if="action.enabled" :key="action.name" :command="() => action.value = !action.value">
              <i class="el-icon-check" :style="action.value || {visibility: 'hidden'}"/>
              {{action.name}}
            </el-dropdown-item>
          </template>
          <el-dropdown-item :command="() => visualStyles.random = !visualStyles.random">
            <i class="el-icon-check" :style="visualStyles.random || {visibility: 'hidden'}"/>
            循环切换
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
