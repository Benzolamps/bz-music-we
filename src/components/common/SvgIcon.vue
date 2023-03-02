<template>
  <svg v-on="$listeners">
    <use :href="`#icon-${iconName}`" v-bind="$attrs"/>
  </svg>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import {Prop} from 'vue-property-decorator';
import Component from 'vue-class-component';

@Component({inheritAttrs: false})
export default class SvgIcon extends BaseComponent {
  @Prop({required: true})
  private iconName: string;
}
</script>

<style>
svg {
  fill: currentColor;
  overflow: hidden;
}

.el-dropdown-menu__item svg {
  width: 13px;
  height: 13px;
  margin-right: 5px;
  vertical-align: middle;
}
</style>
