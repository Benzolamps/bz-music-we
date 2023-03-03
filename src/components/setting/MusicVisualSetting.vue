<template>
  <el-form class="visual-setting-container" size="mini" label-position="top" style="text-align: left;">
    <el-form-item label="展示分辨率">
      <el-slider
        v-model="visualStyles.displayRatio"
        :min="0.5" :max="2" :step="0.1"
        :show-tooltip="false"
        input-size="mini"
        :marks="{
          0.5: '0.5',
          1: '1',
          1.5:'1.5',
          2: '2'
        }"
      />
    </el-form-item>
    <el-divider/>
    <el-form-item label="Milk Drop Preset">
      <div style="margin: 10px;">
        <el-checkbox v-model="visualStyles.onlyShowStarPresets">只显示<i class="el-icon-star-on"/></el-checkbox>
        <el-checkbox v-model="visualStyles.random">随机切换</el-checkbox>
      </div>
      <el-button @click="showPresetList = true">配置</el-button>
      <el-button v-if="visualStyles.state.show" type="success" @click="() => {
        musicVisualCore.loadNearPreset('prev');
        musicVisualCore.reloadTimeout();
      }">上一个</el-button>
      <el-button v-if="visualStyles.state.show" type="warning"  @click="() => {
        musicVisualCore.loadNearPreset('next');
        musicVisualCore.reloadTimeout();
      }">下一个</el-button>
    </el-form-item>
    <el-form-item label="切换间隔">
      <el-slider
        v-model="visualStyles.interval"
        :min="0" :max="300"
        :show-tooltip="false"
        input-size="mini"
        :marks="{
          0: '0',
          30: '30',
          60: '60',
          90: '90',
          120: '120',
          150: '150',
          180: '180',
          210: '210',
          240: '240',
          270: '270',
          300: '300',
        }"
      />
    </el-form-item>
    <el-divider/>
    <el-form-item label="歌词展示方式">
      <el-select v-model="visualStyles.lrcMode" style="width: 100%">
        <el-option key="scroll" value="scroll" label="滚动"/>
        <el-option key="caption" value="caption" label="标题"/>
        <el-option key="mix" value="mix" label="组合"/>
      </el-select>
      <div style="margin: 10px;">
        <el-checkbox v-model="visualStyles.state.pip">画中画模式</el-checkbox>
        <el-checkbox v-model="visualStyles.showFps">显示FPS</el-checkbox>
      </div>
    </el-form-item>
    <el-divider/>
    <el-form-item>
      <el-button type="warning" @click="resetSettings">恢复默认设置</el-button>
    </el-form-item>
    <el-drawer
      :modal="false"
      :visible.sync="showPresetList"
      :wrapper-closable="false"
      :with-header="true"
      direction="ltr"
      size="480px"
      :append-to-body="true"
      :modal-append-to-body="true"
      @opened="locatePreset"
    >
      <div class="preset-list">
        <b-scroll ref="scroll">
          <el-table
            :data="presetPage"
            :show-header="false"
            :row-class-name="scope => 'preset-item-' + (visualStyles.preset === scope.row.name ? 'current' : 'normal')"
            @cell-click="onCellClick"
          >
            <el-table-column width="70" type="index" prop="index" :index="index => index + 1 + pageSize * (currentPage - 1)"/>
            <el-table-column prop="title">
              <template v-slot="scope">
                <span class="enable-user-select" style="padding-right: 10px;">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column width="50" align="center">
              <template v-slot="scope">
                <el-button
                  type="text"
                  size="medium"
                  :icon="visualStyles.starPresets.has(scope.row.name) ? 'el-icon-star-on' : 'el-icon-star-off'"
                  style="color: #E6A23C; font-size: 20px;"
                />
              </template>
            </el-table-column>
          </el-table>
        </b-scroll>
        <footer style="display: flex; justify-content: space-between; align-items: center;">
          <el-pagination
            background
            small
            layout="prev,pager,next"
            :total="presetList.length"
            :current-page="currentPage"
            :page-size="pageSize"
            @current-change="onCurrentChange"
          >
          </el-pagination>
        </footer>
      </div>
    </el-drawer>
  </el-form>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import {Ref, Watch} from 'vue-property-decorator';
import {MilkDropPresetDesc} from '@/utils/butterchurn.min.js';
import BScroll from '@/components/common/BScroll.vue';
import presetList from '@/assets/presets/index';
import {defaultVisualStyles} from '@/components/service/player_settings';
@Component({
  components: {BScroll}
})
export default class PlayerSetting extends BaseComponent {
  private presetList: MilkDropPresetDesc[] = [];
  private readonly basePresetList: MilkDropPresetDesc[] = presetList;

  /* 页大小 */
  private pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  private showPresetList = false;

  @Ref('scroll')
  private scroll: BScroll;

  public override mounted() {
    this.loadPresetList();
  }
  
  private loadPresetList() {
    this.presetList = this.visualStyles.onlyShowStarPresets
      ? this.basePresetList.filter(p => this.visualStyles.starPresets.has(p.name))
      : Array.from(this.basePresetList);
    this.onCurrentChange(this.currentPage);
  }

  private get presetPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    return this.presetList.slice(start, end);
  }

  private getAtPage(index: number) {
    index += 1;
    return Math.floor(index / this.pageSize) + Math.sign(index % this.pageSize);
  }

  /* 换页 */
  private async onCurrentChange(page: number) {
    const maxPage = this.getAtPage(this.presetList.length - 1);
    this.currentPage = Math.max(1, Math.min(maxPage, page));
    await this.$nextTick();
    this.scroll?.refresh();
    await this.$nextTick();
    const element = this.scroll?.$el.querySelector('.preset-item-current');
    if (element instanceof HTMLElement) {
      this.scroll?.scrollToElement(element, 500, true, true);
    } else {
      this.scroll?.scrollTo(0, 0, 0);
    }
  }

  /* 定位音乐 */
  private async locatePreset() {
    const index = this.presetList.findIndex(p => p.name === this.visualStyles.preset);
    if (index >= 0) {
      await this.onCurrentChange(this.getAtPage(index));
    }
  }

  private onCellClick(preset: MilkDropPresetDesc, column: {property: string}) {
    if (column.property) {
      if (preset.name !== this.visualStyles.preset) {
        this.visualStyles.preset = preset.name;
      }
    } else {
      if (this.visualStyles.starPresets.has(preset.name)) {
        this.visualStyles.starPresets.delete(preset.name);
      } else {
        this.visualStyles.starPresets.add(preset.name);
      }
      // vue无法监听Set集合的变更的解决方案
      this.visualStyles.starPresets = new Set<string>(Array.from(this.visualStyles.starPresets));
    }
  }
  
  private resetSettings() {
    this.visualStyles.displayRatio = defaultVisualStyles.displayRatio;
    this.visualStyles.interval = defaultVisualStyles.interval;
    this.visualStyles.random = defaultVisualStyles.random;
    this.visualStyles.onlyShowStarPresets = defaultVisualStyles.onlyShowStarPresets;
    this.visualStyles.lrcMode = defaultVisualStyles.lrcMode;
    this.visualStyles.showFps = defaultVisualStyles.showFps;
  }

  @Watch('visualStyles.preset')
  private watchPreset() {
    this.locatePreset();
  }

  @Watch('visualStyles.onlyShowStarPresets')
  private watchOnlyShowStarPresets() {
    this.loadPresetList();
  }

  @Watch('visualStyles.displayRatio')
  private watchDisplayRatio(value: number, oldValue: number) {
    oldValue && this.$toast(`展示分辨率: ${value}x`);
  }

  @Watch('visualStyles.interval')
  private watchInterval(value: number, oldValue: number) {
    oldValue && this.$toast(`切换间隔: ${value}s`);
  }
}
</script>

<style lang="scss">
.visual-setting-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preset-list {
  padding: 20px 0;
  display: flex;
  height: 100%;
  flex-direction: column;

  > :first-child {
    margin-bottom: 10px;
    overflow: hidden;
    flex: 1;
  }

  .preset-item-current {
    color: #409EFF;
    background-color: #c6e2ff;

    td {
      background-color: transparent !important;
    }
  }
}
</style>
