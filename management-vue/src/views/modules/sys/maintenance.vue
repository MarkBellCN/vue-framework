<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <!-- <el-input v-model="dataForm.createTime" placeholder="备份时间" clearable></el-input> -->
        <el-date-picker
          v-model="dataForm.createTime"
          type="date"
          placeholder="备份时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('sys:maintenance:dbbackup')" type="primary" @click="dbBackUp(userId)">备份</el-button>
        <el-button v-if="isAuth('sys:maintenance:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        prop="id"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
      <!-- <el-table-column
        prop="id"
        header-align="center"
        align="center"
        label="主键">
      </el-table-column> -->
      <el-table-column
        prop="userName"
        header-align="center"
        align="center"
        label="备份用户">
      </el-table-column>
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        label="备份名称">
      </el-table-column>
      <el-table-column
        prop="url"
        header-align="center"
        align="center"
        label="备份路径">
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="备份时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="dbRestore(scope.row.id)">还原</el-button>
          <el-button type="text" size="small" @click="downLoad(scope.row.id)">下载</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <!-- <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update> -->
  </div>
</template>

<script>
  // import AddOrUpdate from './maintenance-add-or-update'
  import {
    dateFormat
  }from "../../../utils/validate"
  export default {
    data () {
      return {
        dataForm: {
          key: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false
      }
    },
    // components: {
    //   AddOrUpdate
    // },
    activated () {
      this.getDataList()
    },
    computed: {
      userId: {
        get () { return this.$store.state.user.id }
      }
    },
    methods: {
      /**
       * 日期格式化
       */
      format(val,fmt) {
        return dateFormat(val,fmt);
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/sys/maintenance/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'createTime': this.dataForm.createTime?this.format(this.dataForm.createTime,'yyyy-MM-dd'):"",
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      // addOrUpdateHandle (id) {
      //   this.addOrUpdateVisible = true
      //   this.$nextTick(() => {
      //     this.$refs.addOrUpdate.init(id)
      //   })
      // },

      //备份
      dbBackUp(userId){
        this.dataForm.userId = userId
        this.$http({
            url: this.$http.adornUrl(`/sys/maintenance/dbbackup/${this.dataForm.userId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if(data.code === 0){
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            }else {
              this.$message.error(data.msg)
            }
          })
      },
      //还原
      dbRestore(id){
        this.dataForm.id = id || 0
        this.$http({
            url: this.$http.adornUrl(`/sys/maintenance/dbrestore/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if(data.code === 0){
              this.$message({
                message: '还原成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            }else {
              this.$message.error(data.msg)
            }
          })
      },
      //下载
      downLoad(id){
        this.dataForm.id = id || 0
        this.$http({
          url: this.$http.adornUrl(`/sys/maintenance/downLoad/${this.dataForm.id}`),
          method: 'get',
          responseType: 'blob',
        }).then(res => {
          this.download(res.data)
        });
      },
      download (data) {
        if (!data) {
            return
        }
        let url = window.URL.createObjectURL(new Blob([data]))
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download','bakSql.sql')
        document.body.appendChild(link)
        link.click()
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/sys/maintenance/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  if(this.dataList.length==1||this.dataList.length==this.dataListSelections.length){
                    if(this.pageIndex>1){
                      this.pageIndex=this.pageIndex-1;
                    }
                  }
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      }
    }
  }
</script>
