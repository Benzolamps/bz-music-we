<template>
  <svg v-on="$listeners">
    <use :href="`#icon-${iconName}`" v-bind="$attrs"/>
  </svg>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({inheritAttrs: false})
export default class SvgIcon extends Vue {
  @Prop({required: true})
  private readonly iconName: string;
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
