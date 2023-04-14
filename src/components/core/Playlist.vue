<template>
  <el-drawer
    :modal="false"
    :visible="show"
    :wrapper-closable="view.portable"
    :with-header="!view.portable"
    :direction="view.portable ? 'btt' : 'ltr'"
    :size="view.portable ? '90%' : '480px'"
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
              <el-tag type="info" v-if="scope.row.duration" size="mini" :disable-transitions="true">{{scope.row.duration | delta}}</el-tag>
              <el-tag type="warning" v-if="!scope.row.lrcFile" size="mini" :disable-transitions="true">{{messages['music.no_lrc']}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column width="50" align="center">
            <template>
              <el-button
                type="text"
                size="medium"
                icon="el-icon-close"
                style="color: #f56c6c; font-size: 20px;"
              />
            </template>
          </el-table-column>
        </el-table>
      </b-scroll>
      <footer>
        <el-pagination
          background
          small
          layout="prev,pager,next"
          hide-on-single-page
          :total="musicList.length"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="onCurrentChange"
        />
        <div>
          <div v-if="!platform.mobile && platform.hasFsApi && musicList.length <= 50">
            <el-button size="mini" round @click="chooseFile">导入文件</el-button>
            <el-button size="mini" round @click="chooseFolder">导入文件夹</el-button>
          </div>
          <div style="margin-top: 10px; position: relative; overflow: hidden;">
            <el-input size="small" v-show="showSearch" v-model="musicService.query" style="position: absolute; z-index: 1; left: 5%; width: 90%;">
              <el-button slot="append" icon="el-icon-close" @click="showSearch = false; musicService.query = '';"/>
            </el-input>
            <el-button v-if="!platform.wallpaper" size="small" type="success" circle plain icon="el-icon-search" title="搜素" @click="showSearch = true;"/>
            <el-button v-if="platform.hasFsApi" size="small" type="success" circle plain icon="el-icon-refresh" title="刷新" @click="musicStorage.refresh"/>
            <el-button v-if="platform.hasFsApi" size="small" type="warning" circle plain icon="el-icon-menu" title="列表管理" @click="showPlaylistManage = true;"/>
            <el-button v-if="!platform.hasFsApi" size="small" type="warning" circle plain icon="el-icon-document" title="导入文件" @click="chooseFile"/>
            <el-button v-if="!platform.hasFsApi && !platform.mobile" size="small" type="warning" circle plain icon="el-icon-folder" title="导入文件夹" @click="chooseFolder"/>
            <el-button size="small" type="danger" circle plain icon="el-icon-delete" title="清空" @click="musicStorage.clear"/>
          </div>
        </div>
        <playlist-manage :show.sync="showPlaylistManage"/>
      </footer>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import PlaylistManage from '@/components/core/PlaylistManage.vue';
import {Component, Prop, Ref, Watch} from 'vue-property-decorator';
import {Music} from '@/components/service/music';
import BScroll from '@/components/common/BScroll.vue';
import {chooseFile, chooseFolder} from '@/utils/file_handle';

@Component({components: {PlaylistManage, BScroll}})
export default class Playlist extends BaseComponent {
  /* 页大小 */
  private readonly pageSize = 50;
  /* 当前页 */
  private currentPage = 1;
  
  private readonly showSearch = false;

  @Prop({default: false})
  private readonly show: boolean;

  private readonly showPlaylistManage = false;

  @Ref('scroll')
  private readonly scroll: BScroll;

  private get musicList() {
    return this.musicService.musicList;
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
    (async () => {
      let music: Music;
      while (this.musicStorage) {
        const newMusic = this.music.id && !this.music.props ? this.music : this.musicPage.find(m => !m.props);
        if (music && !newMusic) {
          await this.$nextTick();
          this.scroll?.refresh();
        }
        music = newMusic;
        music && await this.musicStorage.generateMusicProps(music);
        await this.$sleep(0);
      }
    })();
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
      await this.musicStorage.remove(music);
      if (music.id === this.music.id) {
        this.musicService.stop();
      }
    } catch {
      // cancelled
    }
  }

  private chooseFile() {
    return chooseFile('audio').then(this.musicStorage.add).catch(() => 0);
  }
  
  private chooseFolder() {
    return chooseFolder().then(this.musicStorage.add).catch(() => 0);
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

  @Watch('music.id')
  private watchMusic() {
    return this.locateMusic();
  }

  @Watch('musicService.musicList', {deep: false})
  private watchQuery() {
    this.onCurrentChange(this.currentPage);
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
    color: #409eff;
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
