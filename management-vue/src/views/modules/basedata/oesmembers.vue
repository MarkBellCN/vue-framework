<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('basedata:oesmembers:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('basedata:oesmembers:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
        <el-button v-if="isAuth('basedata:oesmembers:upload')" type="primary" @click="uploadHandle()">导入</el-button>
        <el-button v-if="isAuth('basedata:oesmembers:export')" type="primary" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        prop="id"
        type="selection"
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
        prop="companyName"
        header-align="center"
        align="center"
        label="企业名称">
      </el-table-column>
      <el-table-column
        prop="memberName"
        header-align="center"
        align="center"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="memberSex"
        header-align="center"
        align="center"
        width="50"
        label="性别">
      </el-table-column>
      <el-table-column
        prop="memberBirth"
        header-align="center"
        align="center"
        label="出生日期">
      </el-table-column>
      <el-table-column
        prop="memberPost"
        header-align="center"
        align="center"
        label="现任职务">
      </el-table-column>
      <el-table-column
        prop="tenureTime"
        header-align="center"
        align="center"
        label="任职时间">
      </el-table-column>
      <el-table-column
        prop="originalPost"
        header-align="center"
        align="center"
        label="原任职务">
      </el-table-column>
      <el-table-column
        prop="isNew"
        header-align="center"
        align="center"
        label="新任选拔">
      </el-table-column>
      <!-- <el-table-column
        prop="sort"
        header-align="center"
        align="center"
        label="序号">
      </el-table-column> -->
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间">
      </el-table-column>
      <el-table-column
        prop="updateTime"
        header-align="center"
        align="center"
        label="更新时间">
      </el-table-column>
      <!-- <el-table-column
        prop="remark"
        header-align="center"
        align="center"
        label="备注">
      </el-table-column> -->
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" :companies="companies"></add-or-update>
    <!-- 弹窗, 导入 -->
    <upload v-if="uploadVisible" ref="upload" @refreshDataList="getDataList" :companies="companies"></upload>
  </div>
</template>

<script>
  import AddOrUpdate from './oesmembers-add-or-update'
  import Upload from './oesmembers-upload'
  export default {
    data () {
      return {
        dataForm: {
          key: ''
        },
        companies: [],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        uploadVisible: false
      }
    },
    components: {
      AddOrUpdate,
      Upload
    },
    activated () {
      this.getDataList()
      this.getCompaniesList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/basedata/oesmembers/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'key': this.dataForm.key
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
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id)
        })
      },


      getCompaniesList(){
        this.$http({
          url: this.$http.adornUrl('/basedata/oescompanies/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'key': this.dataForm.key
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.companies = data.page.list
          }
        })
      },

      // 导入
      uploadHandle () {
        this.uploadVisible = true
        this.$nextTick(() => {
          this.$refs.upload.init()
        })
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/basedata/oesmembers/delete'),
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

<style lang="scss">
.el-button--primary.is-disabled, .el-button--primary.is-disabled:active, .el-button--primary.is-disabled:focus, .el-button--primary.is-disabled:hover {
    color: #fff;
    background-color: rgb(78, 195, 183);
    border-color:  #30b5a7;
}
</style>
