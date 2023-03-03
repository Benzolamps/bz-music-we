<template>
  <el-drawer
    :modal="false"
    :visible="show"
    :wrapper-closable="false"
    :with-header="true"
    direction="ltr"
    size="480px"
    :append-to-body="true"
    :modal-append-to-body="true"
    @opened="locateMusic"
    @close="$emit('update:show', false)"
  >
    <div class="playlist">
      <b-scroll ref="scroll">
        <el-table
          :data="musicPage"
          :show-header="false"
          :row-class-name="scope => 'music-item-' + (music.id === scope.row.id ? 'current' : 'normal')"
          @cell-click="onCellClick"
        >
          <el-table-column width="70" type="index" prop="index" :index="index => index + 1 + pageSize * (currentPage - 1)"/>
          <el-table-column prop="title">
            <template v-slot="scope">
              <span class="enable-user-select" style="padding-right: 10px;">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column width="50" align="center">
            <template>
              <el-button
                type="text"
                size="medium"
                icon="el-icon-close"
                style="color: #F56C6C; font-size: 20px;"
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
          :total="musicList.length"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="onCurrentChange"
        >
        </el-pagination>
        <el-dropdown trigger="click" @command="cmd => cmd()">
          <el-button type="text"  size="medium" icon="el-icon-more" style="color: #409EFF; font-size: 20px; margin-right: 10px;"/>
          <el-dropdown-menu slot="dropdown" style="text-align: left">
              <el-dropdown-item :command="() => 0">
                <i class="el-icon-plus"/>
                添加文件
              </el-dropdown-item>
              <el-dropdown-item :command="() => 0">
                <i class="el-icon-search"/>
                添加文件夹
              </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </footer>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import Component from 'vue-class-component';
import {Prop, Ref, Watch} from 'vue-property-decorator';
import {Music} from '@/components/service/music';
import BScroll from '@/components/common/BScroll.vue';

@Component({components: {BScroll}})
export default class Playlist extends BaseComponent {
  /* 页大小 */
  private pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  @Prop({default: false})
  private show: boolean;

  @Ref('scroll')
  private scroll: BScroll;

  private get musicList() {
    return this.musicStorage.musicList;
  }

  private get musicPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    return this.musicList.slice(start, end);
  }

  private get music() {
    return this.musicService.music;
  }

  public override mounted() {
    this.musicStorage.onReload.add(() => {
      this.onCurrentChange(this.currentPage);
    });
  }

  private getAtPage(index: number) {
    index += 1;
    return Math.floor(index / this.pageSize) + Math.sign(index % this.pageSize);
  }

  /* 换页 */
  private async onCurrentChange(page: number) {
    const maxPage = this.getAtPage(this.musicList.length - 1);
    this.currentPage = Math.max(1, Math.min(maxPage, page));
    await this.$nextTick();
    this.scroll?.refresh();
    await this.$nextTick();
    const element = this.$el.querySelector('.music-item-current');
    if (element instanceof HTMLElement) {
      this.scroll?.scrollToElement(element, 500, true, true);
    } else {
      this.scroll?.scrollTo(0, 0, 0);
    }
  }

  /* 定位音乐 */
  private async locateMusic() {
    // const index = this.musicList.indexOf(this.music);
    const index = this.musicList.findIndex(m => m.id === this.music.id);
    if (index >= 0) {
      await this.onCurrentChange(this.getAtPage(index));
    }
  }
  
  private onCellClick(music: Music, column: {property: string}) {
    if (column.property) {
      if (music.id !== this.music.id) {
        this.musicService.chooseMusic(music);
      }
    } else {
      //TODO 删除音乐
    }
  }

  @Watch('music')
  private watchMusic() {
    this.locateMusic();
  }
}
</script>

<style lang="scss">
.playlist {
  padding: 20px 0;
  display: flex;
  height: 100%;
  flex-direction: column;

  > :first-child {
    margin-bottom: 10px;
    overflow: hidden;
    flex: 1;
  }

  .music-item-current {
    color: #409EFF;
    background-color: #c6e2ff;

    td {
      background-color: transparent !important;
    }
  }
}

.playlist-more-buttons {
  display: flex;
  align-items: center;
}
</style>
