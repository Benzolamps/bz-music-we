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
              <span style="padding-right: 10px;">{{ scope.row.title }}</span>
              <el-tag type="warning" v-if="!scope.row.lrcProvider" size="mini" :disableTransitions="true">{{messages['music.no_lrc']}}</el-tag>
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
        />
        <input type="file" ref="file" multiple accept="audio/*,.lrc" v-show="false" @change="onFileChange"/>
        <el-dropdown trigger="click" @command="cmd => cmd()">
          <el-button type="text"  size="medium" icon="el-icon-more" style="color: #409EFF; font-size: 20px; margin-right: 10px;"/>
          <el-dropdown-menu slot="dropdown" style="text-align: left">
              <el-dropdown-item :command="() => chooseFile(false)">
                <i class="el-icon-document"/>
                {{messages['music.add_files']}}
              </el-dropdown-item>
              <el-dropdown-item :command="() => chooseFile(true)">
                <i class="el-icon-folder"/>
                {{messages['music.add_folder']}}
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
import {getFileBaseName} from '@/utils/common_utils';

@Component({components: {BScroll}})
export default class Playlist extends BaseComponent {
  /* 页大小 */
  private readonly pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  @Ref('file')
  private readonly file: HTMLInputElement;

  @Prop({default: false})
  private readonly show: boolean;

  @Ref('scroll')
  private readonly scroll: BScroll;

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
    this.musicStorage.onReload.add(() => this.onCurrentChange(this.currentPage));
  }

  private async removeMusic(music: Music) {
    try {
      await this.$confirm(
        this.messages['music.delete'](music.title),
        this.messages['music.warning'],
        {
          confirmButtonText: this.messages['music.confirm'],
          cancelButtonText: this.messages['music.cancel'],
          type: 'warning',
          center: true,
          closeOnClickModal: false
        }
      );
      this.musicStorage.remove(music.id);
      if (music === this.music) {
        this.musicService.stop();
      }
    } catch {
      // cancelled
    }
  }

  private chooseFile(webkitDirectory: boolean) {
    this.file.webkitdirectory = webkitDirectory;
    this.file.dispatchEvent(new MouseEvent('click'));
  }

  private async onFileChange() {
    let files = Array.from(this.file.files);
    this.file.value = '';
    if (!files?.length) {
      return;
    }
    files = files.filter(f => f.type.startsWith('audio/') || f.name.endsWith('.lrc'));
    const audioCount = files.filter(f => f.type.startsWith('audio/')).length;
    const lrcCount = files.filter(f => f.name.endsWith('.lrc')).length;
    if (files.length === 0) {
      this.$message({type: 'warning', message: this.messages['music.no_proper_files']});
      return;
    }
    try {
      await this.$confirm(
        this.messages['music.about_to_import'](audioCount, lrcCount),
        this.messages['music.warning'],
        {
          distinguishCancelAndClose: true,
          confirmButtonText: this.messages['music.keep'],
          cancelButtonText: this.messages['music.do_not_keep']
        }
      );
    } catch (action) {
      if (action === 'cancel') {
        this.musicStorage.clear();
      } else {
        this.$message({type: 'warning', message: this.messages['music.cancel_import']});
        return;
      }
    }
    const entries = files.map(f => [getFileBaseName(f.name), f] as [string, Blob]);
    this.musicStorage.add(entries);
    this.$message({type: 'success', message: this.messages['music.import_finish'](audioCount, lrcCount)});
    if (!this.musicList.find(m => m.id === this.music.id)) {
      this.musicService.stop();
    }
  }

  private getAtPage(index: number) {
    return Math.floor((index + 1) / this.pageSize) + Math.sign((index + 1) % this.pageSize);
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
      this.scroll?.scrollToElement(element, 500);
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
      this.removeMusic(music);
    }
  }

  @Watch('music')
  private watchMusic() {
    return this.locateMusic();
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
