<template>
  <el-drawer
      :modal="false"
      :visible="show"
      :wrapper-closable="view.portable"
      :with-header="!view.portable"
      :direction="view.portable ? 'btt' : 'rtl'"
      :size="view.portable ? '90%' : '480px'"
      :append-to-body="true"
      :modal-append-to-body="true"
      @close="$emit('update:show', false)"
  >
    <div style="padding: 20px 0;">
      <el-button size="mini" round icon="el-icon-document" @click="chooseFile">导入文件</el-button>
      <el-button size="mini" round icon="el-icon-folder" @click="chooseFolder">导入文件夹</el-button>
      <el-button size="mini" round icon="el-icon-refresh" @click="musicStorage.refresh">刷新</el-button>
      <b-scroll ref="scroll">
        <el-table
          :data="playlistPage"
          :show-header="false"
          @cell-click="onCellClick"
        >
          <el-table-column width="70" type="index" prop="index" :index="index => index + 1 + pageSize * (currentPage - 1)"/>
          <el-table-column prop="name"/>
          <el-table-column width="60" align="center" prop="musicCount" >
            <template v-slot="scope">
             <div style="border-radius: 20px; background-color: #409eff; color: white; padding: 2px; font-size: 10px; text-align: center;">
               {{scope.row.musicCount}}
             </div>
            </template>
          </el-table-column>
          <el-table-column width="50" align="center" prop="show">
            <template v-slot="scope">
              <el-switch
                  :value="scope.row.show"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  :active-value="true"
                  :inactive-value="false"/>
            </template>
          </el-table-column>
          <el-table-column width="50" align="center" prop="delete">
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
            :total="playlists.length"
            :current-page="currentPage"
            :page-size="pageSize"
            @current-change="onCurrentChange"
        />
      </footer>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import BScroll from '@/components/common/BScroll.vue';
import {Playlist} from '@/components/service/music';
import {Component, Prop, Ref} from 'vue-property-decorator';
import BaseComponent from '@/components/common/BaseComponent';
import {chooseFile, chooseFolder} from '@/utils/file_handle';

@Component({components: {BScroll}})
export default class PlaylistManage extends BaseComponent {
  /* 页大小 */
  private readonly pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  @Prop({default: false})
  private readonly show: boolean;

  @Ref('scroll')
  private readonly scroll: BScroll;

  private get playlists() {
    return this.musicStorage.playlists;
  }

  private get playlistPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    return this.playlists.slice(start, end);
  }

  private getAtPage(index: number) {
    return Math.floor((index + 1) / this.pageSize) + Math.sign((index + 1) % this.pageSize);
  }

  private chooseFile() {
    return chooseFile('audio').then(this.musicStorage.add).catch(() => 0);
  }

  private chooseFolder() {
    return chooseFolder().then(this.musicStorage.add).catch(() => 0);
  }

  /* 换页 */
  private async onCurrentChange(page: number) {
    const maxPage = this.getAtPage(this.playlists.length - 1);
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

  private onCellClick(playlist: Playlist, column: { property: string }) {
    if (column.property === 'show') {
      playlist.show = !playlist.show;
      this.musicStorage.setPlaylistShow(playlist);
    } else if (column.property === 'delete') {
      this.removePlaylist(playlist);
    }
  }

  private async removePlaylist(playlist: Playlist) {
    try {
      await this.$confirm(
        `确定要删除播放列表${playlist.name}吗?`,
        this.messages['music.warning'],
        {
          confirmButtonText: this.messages['music.confirm'],
          cancelButtonText: this.messages['music.cancel'],
          type: 'warning',
          center: true,
          closeOnClickModal: false
        }
      );
      await this.musicStorage.removePlaylist(playlist);
    } catch {
      // cancelled
    }
  }
}
</script>

<style scoped>

</style>
