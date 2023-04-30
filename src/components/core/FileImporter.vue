<template>
  <el-drawer
    :visible="retrieveContext.state !== 'finish'"
    :with-header="!view.portable"
    direction="btt"
    :size="view.portable ? '90%' : '100%'"
    :append-to-body="true"
    :modal-append-to-body="true"
    @closed="playlist = true; type = 'total'"
    @close="retrieveContext.reject()"
    @opened="onCurrentChange(1)"
    class="retrieve-drawer"
  >
    <div class="retrieve-container">
      <el-alert
        v-if="!platform.hasFsApi"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 10px; align-items: unset;"
      >{{messages['music.import.fs_warning']}}</el-alert>
      <el-tabs class="retrieve-tabs" v-model="type" type="card" v-if="shownItems.length">
        <el-tab-pane :label="`${messages['music.import.total']} (${shownInfo.total})`" name="total"/>
        <el-tab-pane :label="`${messages['music.import.audio']} (${shownInfo.audio})`" name="audio"/>
        <el-tab-pane :label="`${messages['music.import.lrc']} (${shownInfo.lrc})`" name="lrc"/>
        <el-tab-pane v-if="retrieveContext.dirPlaylists.size > 0" :label="`${messages['music.import.playlist']} (${shownInfo.directory})`" name="directory"/>
      </el-tabs>
      <b-scroll ref="scroll" style="flex: 1; overflow: hidden; margin-bottom: 10px;">
        <el-table :data="shownItemPage"
          :show-header="false"
          :empty-text="emptyText"
          v-loading="retrieveContext.state !== 'ready'"
          :element-loading-text="emptyText"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.7)"
          style="min-height: 100%;"
        >
          <el-table-column v-if="!view.portable" width="70" type="index" prop="index" :index="index => index + 1 + pageSize * (currentPage - 1)"/>
          <el-table-column width="100">
            <template v-slot="scope">
              <el-tag v-if="getType(scope.row) === 'audio'" size="small" type="success">{{messages['music.import.audio']}}</el-tag>
              <el-tag v-else-if="getType(scope.row) === 'lrc'" size="small" type="">{{messages['music.import.lrc']}}</el-tag>
              <el-tag v-else-if="getType(scope.row) === 'directory'" size="small" type="">{{messages['music.import.playlist']}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path"/>
          <el-table-column v-if="!view.portable" width="300">
            <template v-slot="scope">
              <template v-if="scope.row.type === 'directory'">{{ getDirectoryInfo(scope.row) }}</template>
              <template v-else>
                {{ scope.row.size | fileSize }}
                <el-tag type="warning" style="float: right;" size="small" :disable-transitions="true">{{messages['music.import.current_session']}}</el-tag>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </b-scroll>
      <el-pagination
        background
        small
        layout="prev,pager,next"
        hide-on-single-page
        :total="shownItemsFiltered.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="onCurrentChange"
        style="margin-bottom: 10px;"
      />
      <div style="padding-bottom: 10px;" v-show="retrieveContext.dirPlaylists.size > 0">
        <el-checkbox v-model="playlist">{{messages['music.import.folder_to_playlist']}}</el-checkbox>
      </div>
      <div>
        <el-button type="primary" size="mini" @click="retrieveContext.resolve(playlist)" :disabled="!shownItems.length">{{messages['music.import.start']}}</el-button>
        <el-button type="warning" size="mini" @click="retrieveContext.reject()">{{messages['music.cancel']}}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import BaseComponent from '@/components/common/BaseComponent';
import BScroll from '@/components/common/BScroll.vue';
import {getType} from '@/components/service/data';
import {formatFileSize} from '@/utils/common_utils';
import {FileEntity} from '@/utils/file_handle';
import {Component, Ref} from 'vue-property-decorator';

@Component({components: {BScroll}, methods: {getType}})
export default class FileImporter extends BaseComponent {
  /* 页大小 */
  private readonly pageSize = 50;
  /* 当前页 */
  private currentPage = 1;

  private readonly playlist = true;

  @Ref('scroll')
  private readonly scroll: BScroll;

  private readonly type: ReturnType<typeof getType> | 'total' = 'total';

  private get retrieveContext() {
    return this.musicStorage.retrieveContext;
  }
  
  private get emptyText() {
    if (this.retrieveContext.state === 'pending') {
      return this.messages['music.import.retrieving'];
    }
    if (this.retrieveContext.state === 'processing') {
      return this.messages['music.import.importing'];
    }
    if (this.shownItems.length === 0) {
      return this.messages['music.import.no_proper_files'];
    }
    return '';
  }

  private get shownItems() {
    if (this.retrieveContext.state !== 'ready') {
      return [];
    }
    const {defaultPlaylist, dirPlaylists} = this.retrieveContext;
    let result: Array<FileEntity>;
    if (this.playlist) {
      const {audioEntities, lrcEntities, dirEntities} = defaultPlaylist;
      result = [audioEntities, lrcEntities, dirEntities].flat();
    } else {
      result = [defaultPlaylist, ...dirPlaylists.values()].map(e => [e.audioEntities, e.lrcEntities]).flat(2);
    }
    return result.sort((a, b) => a.path.localeCompare(b.path));
  }

  private get shownItemPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    return this.shownItemsFiltered.slice(start, end);
  }

  private get shownItemsFiltered() {
    this.$nextTick(() => this.onCurrentChange(1));
    return this.shownItems.filter(t => this.type === 'total' || this.type === getType(t));
  }

  private get shownInfo() {
    const shownItems = this.shownItems;
    return {
      total: shownItems.length,
      audio: shownItems.filter(t => getType(t) === 'audio').length,
      lrc: shownItems.filter(t => getType(t) === 'lrc').length,
      directory: shownItems.filter(t => getType(t) === 'directory').length
    };
  }

  private getDirectoryInfo(dir: FileEntity) {
    const playlist = this.retrieveContext.dirPlaylists.get(dir);
    const size = [playlist.audioEntities, playlist.lrcEntities].flat().map(e => e.size).reduce((a, b) => a + b, 0);
    return formatFileSize(size) + ` (${this.messages['music.import.audio_lrc_count'](playlist.audioEntities.length, playlist.lrcEntities.length)})`;
  }

  private getAtPage(index: number) {
    return Math.floor((index + 1) / this.pageSize) + Math.sign((index + 1) % this.pageSize);
  }

  /* 换页 */
  private async onCurrentChange(page: number) {
    const maxPage = this.getAtPage(this.shownItemsFiltered.length - 1);
    this.currentPage = Math.max(1, Math.min(maxPage, page));
    await this.$nextTick();
    this.scroll?.refresh();
  }
}
</script>

<style lang="scss">
.retrieve-drawer {
  padding-left: calc(50% - 500px) !important;
  padding-right: calc(50% - 500px) !important;
  .retrieve-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    .retrieve-tabs {
      margin-bottom: -10px;
    }
  }
}
</style>
