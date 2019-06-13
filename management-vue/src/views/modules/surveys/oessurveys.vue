<template>
<!-- 测评 -->
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.surveyName" placeholder="测评名称" maxlength="20" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.status" filterable clearable placeholder="测评状态">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('surveys:oessurveys:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('surveys:oessurveys:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
        <el-button v-if="isAuth('surveys:oessurveys:clear')" type="primary" @click="clearHandle()" :disabled="dataListSelections.length <= 0">清除调研数据</el-button>
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
      <!-- <el-table-column
        prop="companyId"
        header-align="center"
        align="center"
        label="企业id">
      </el-table-column> -->
      <el-table-column
        prop="surveyName"
        header-align="center"
        align="center"
        label="测评名称">
      </el-table-column>
      <el-table-column
        prop="startTime"
        header-align="center"
        align="center"
        label="测评开始时间">
      </el-table-column>
      <el-table-column
        prop="endTime"
        header-align="center"
        align="center"
        label="测评结束时间">
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="测评状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small">未开始</el-tag>
          <el-tag v-if="scope.row.status === 1" size="small" >进行中</el-tag>
          <el-tag v-if="scope.row.status === 2" size="small" type="danger">已结束</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="sort"
        header-align="center"
        align="center"
        label="排序号">
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间">
      </el-table-column>
      <!-- <el-table-column
        prop="updateTime"
        header-align="center"
        align="center"
        label="更新时间">
      </el-table-column> -->
      <el-table-column
        prop="remark"
        header-align="center"
        align="center"
        label="备注">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="250"
        label="操作">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">预览</el-button> -->
          <el-button type="text" size="small" @click="copyHandle(scope.row.id)">克隆</el-button>
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
          <el-button type="text" size="small" @click="jumpHandle(scope.row.id)">查看详情</el-button>
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <!-- 弹窗, 克隆 -->
    <copy v-if="copyVisible" ref="copy" @refreshDataList="getDataList"></copy>
    <el-dialog
      :title="'详情'"
      :close-on-click-modal="false"
      :visible.sync="visible">
      <el-table
        :data="detaildataList"
        border
        v-loading="detailDataListLoading"
        style="width: 100%;">
        <el-table-column
          prop="evaluationName"
          header-align="center"
          align="center"
          label="测评表名称">
        </el-table-column>
        <el-table-column
          prop="remark"
          header-align="center"
          align="center"
          label="备注">
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  import AddOrUpdate from './oessurveys-add-or-update'
  import Copy from './oessurveys-copy'
  export default {
    data () {
      return {
        dataForm: {
          surveyName: '',
          status: '',
        },
        visible: false,
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        copyVisible: false,
        detailDataListLoading: false,
        detaildataList: [],
        addOrUpdateForm: {},
        options: [{
          value: '0',
          label: '未开始'
        }, {
          value: '1',
          label: '进行中'
        },{
          value: '2',
          label: '已结束'
        }],
      }
    },
    components: {
      AddOrUpdate,Copy
    },
    activated () {
      this.getDataList()
    },
    methods: {
      //关闭模态框
      closeModal(val) {
          this.addOrUpdateVisible = val;
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/surveys/oessurveys/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'surveyName': this.dataForm.surveyName,
            'status': this.dataForm.status
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
      // 克隆
      copyHandle (id) {
        this.copyVisible = true
        this.$nextTick(() => {
          this.$refs.copy.init(id)
        })
      },
      // 查看详情
      jumpHandle (id) {
        this.detailDataListLoading = true
        this.detaildataList=[];
        this.$http({
          url: this.$http.adornUrl('/surveys/oesevaluation/select'),
          method: 'get',
          params: this.$http.adornParams({
            'surveyId': id,
          })
        }).then(({data}) => {
          if(data && data.code === 0){
            this.detaildataList = data.evaluationList;
            this.detailDataListLoading = false
            this.visible=true;
          }else{
            this.visible=false;
          }
        })
      },
      // 清除调研数据
      clearHandle(id){
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(` 此功能为清除本次调研数据，包括登录信息，测评问卷收集数据，在测评结束并得到统计结果后，可清除本此调研数据，确认操作后数据不可恢复，请慎重操作！是否清除?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/surveys/oessurveys/clear'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
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
            url: this.$http.adornUrl('/surveys/oessurveys/delete'),
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
