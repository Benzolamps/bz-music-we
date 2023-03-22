<template>
  <el-form class="visual-setting-container" size="mini" label-position="top" style="text-align: left;">
    <el-form-item :label="messages['visual.display_ratio']">
      <el-slider
        v-model="visualStyles.displayRatio"
        :min="0.5" :max="2" :step="0.1"
        :show-tooltip="false"
        input-size="mini"
        :marks="{
          0.5: '0.5×',
          1: '1×',
          1.5:'1.5×',
          2: '2×'
        }"
      />
    </el-form-item>
    <el-divider/>
    <el-form-item :label="messages['visual.preset']">
      <div style="margin: 10px;">
        <el-checkbox v-model="visualStyles.onlyShowStarPresets">
          {{messages['visual.preset.only_show_stars']}}
          <i class="el-icon-star-on"/>
        </el-checkbox>
        <el-checkbox v-model="visualStyles.random">{{messages['visual.preset.random']}}</el-checkbox>
      </div>
      <el-button @click="showPresetList = true">{{messages['visual.preset.config']}}</el-button>
      <el-button v-if="visualStyles.state.show" type="success" @click="musicVisualCore.prevPreset">
        {{messages['visual.preset.prev']}}
      </el-button>
      <el-button v-if="visualStyles.state.show" type="warning" @click="musicVisualCore.nextPreset">
        {{messages['visual.preset.next']}}
      </el-button>
    </el-form-item>
    <el-form-item :label="messages['visual.preset.interval']">
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
    <el-form-item :label="messages['visual.lrc_mode']">
      <el-select v-model="visualStyles.lrcMode" style="width: 100%">
        <el-option key="scroll" value="scroll" :label="messages['visual.lrc_mode.scroll']"/>
        <el-option key="caption" value="caption" :label="messages['visual.lrc_mode.caption']"/>
        <el-option key="mix" value="mix" :label="messages['visual.lrc_mode.mix']"/>
      </el-select>
      <div style="margin: 10px;">
        <el-checkbox v-model="visualStyles.state.pip">{{messages['visual.pip']}}</el-checkbox>
        <el-checkbox v-model="visualStyles.showFps">{{messages['visual.fps']}}</el-checkbox>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="warning" @click="resetSettings">{{messages['music.reset_default']}}</el-button>
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
            <el-table-column prop="name"/>
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
          />
        </footer>
      </div>
    </el-drawer>
  </el-form>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import {Ref, Watch} from 'vue-property-decorator';
import {MilkDropPresetDesc} from 'butterchurn';
import BScroll from '@/components/common/BScroll.vue';
import presetList from '@/assets/presets/index';
import PlayerSettings from '@/components/service/player_settings';
@Component({components: {BScroll}})
export default class MusicVisualSetting extends BaseComponent {
  private presetList: ReadonlyArray<MilkDropPresetDesc> = [];
  private readonly basePresetList: ReadonlyArray<MilkDropPresetDesc> = presetList;

  /* 页大小 */
  private readonly pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  private readonly showPresetList = false;

  @Ref('scroll')
  private readonly scroll: BScroll;

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
    return Math.floor((index + 1) / this.pageSize) + Math.sign((index + 1) % this.pageSize);
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
      this.scroll?.scrollToElement(element, 500);
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
      PlayerSettings.starPreset(preset.name);
    }
  }

  private resetSettings() {
    this.visualStyles.displayRatio = PlayerSettings.defaultVisualStyles.displayRatio;
    this.visualStyles.interval = PlayerSettings.defaultVisualStyles.interval;
    this.visualStyles.random = PlayerSettings.defaultVisualStyles.random;
    this.visualStyles.onlyShowStarPresets = PlayerSettings.defaultVisualStyles.onlyShowStarPresets;
    this.visualStyles.lrcMode = PlayerSettings.defaultVisualStyles.lrcMode;
    this.visualStyles.showFps = PlayerSettings.defaultVisualStyles.showFps;
  }

  @Watch('visualStyles.preset')
  private watchPreset() {
    return this.locatePreset();
  }

  @Watch('visualStyles.onlyShowStarPresets')
  private watchOnlyShowStarPresets() {
    this.loadPresetList();
  }

  @Watch('visualStyles.displayRatio')
  private watchDisplayRatio(value: number, oldValue: number) {
    oldValue && this.$toast(this.messages['visual.display_ratio'] + this.messages.colon + value + '×');
  }

  @Watch('visualStyles.interval')
  private watchInterval(value: number, oldValue: number) {
    oldValue && this.$toast(this.messages['visual.preset.interval'] + this.messages.colon + value + 's');
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
