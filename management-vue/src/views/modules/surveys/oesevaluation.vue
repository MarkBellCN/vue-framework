<template>
<!-- 测评表 -->
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-select v-model="dataForm.surveyId" filterable placeholder="请选择">
          <el-option
            v-for="item in surveyList"
            :key="item.id"
            :label="item.surveyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.evaluationName" placeholder="测评表名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('surveys:oesevaluation:save')" :disabled="this.dataForm.surveyId?false:true" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('surveys:oesevaluation:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
      <el-table-column
        prop="surveyName"
        header-align="center"
        align="center"
        label="测评名称">
      </el-table-column>
      <el-table-column
        prop="evaluationName"
        header-align="center"
        align="center"
        label="测评表名称">
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间">
      </el-table-column>
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
          <el-button type="text" size="small" @click="previewHandle(scope.row)">预览</el-button>
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
    <!-- 弹窗, 预览 -->
    <preview v-if="previewVisible" ref="previewBox" @refreshDataList="getDataList" v-on:priviewClose="priviewClose"></preview>
    <el-dialog
      :title="'详情'"
      :close-on-click-modal="false"
      :visible.sync="visible">
      <el-table
        :data="detaildataList"
        border
        v-loading="detailDataListLoading"
        style="width: 100%;">
        <table-tree-column
          prop="questionName"
          header-align="center"
          align="center"
          treeKey="id"
          label="选题描述">
        </table-tree-column>
        <el-table-column
          prop="parentName"
          header-align="center"
          align="center"
          label="上级测评内容">
        </el-table-column>
        <el-table-column
          prop="questionDesc"
          header-align="center"
          align="center"
          label="选题参考准则">
        </el-table-column>
        <el-table-column
          prop="answerDesc"
          header-align="center"
          align="center"
          label="选项描述">
        </el-table-column>
        <el-table-column
          prop="type"
          header-align="center"
          align="center"
          label="选项类型">
          <template slot-scope="scope">
            <el-tag type='success' v-if="scope.row.type === 1" size="small">单选题</el-tag>
            <el-tag type='success' v-else-if="scope.row.type === 2" size="small">多选题</el-tag>
            <el-tag type='success' v-else-if="scope.row.type === 3" size="small">判断题</el-tag>
            <el-tag type='success' v-else-if="scope.row.type === 4" size="small">打分题</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="orderNum"
          header-align="center"
          align="center"
          width="80"
          label="选题排序">
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
  import TableTreeColumn from '@/components/table-tree-column'
  import AddOrUpdate from './oesevaluation-add-or-update'
  import Copy from './oesevaluation-copy'
  import {treeDataTranslate} from '@/utils'
  import Preview from './oesevaluation-preview'
  export default {
    data () {
      return {
        dataForm: {
          surveyId: '',
          evaluationName: ''
        },
        visible: false,
        evaluationList: [],
        surveyList: [],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        copyVisible: false,
        previewVisible: false,
        detailDataListLoading: false,
        detaildataList: [],
      }
    },
    components: {
      AddOrUpdate,Copy,Preview,TableTreeColumn,
    },
    activated () {
      this.getSurveyList()
    },
    methods: {
      // 获取测评数据列表
      getSurveyList () {
        this.$http({
          url: this.$http.adornUrl('/surveys/oessurveys/select'),
          method: 'get',
        }).then(({data}) => {
          this.surveyList = data.surveyList
          if(!this.dataForm.surveyId&&data.surveyList&&data.surveyList.length>0){
            this.dataForm.surveyId = data.surveyList[0].id
            this.getDataList()
          }
        })
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/surveys/oesevaluation/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'surveyId': this.dataForm.surveyId,
            'evaluationName': this.dataForm.evaluationName
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
          id = id
          this.$refs.addOrUpdate.init(id,this.dataForm.surveyId)
        })
      },
      // 查看详情
      jumpHandle (id) {
        this.detailDataListLoading = true
        this.detaildataList=[];
        this.$http({
          url: this.$http.adornUrl('/surveys/oesquestions/list'),
          method: 'get',
          params: this.$http.adornParams({
            'evaluationId': id,
          })
        }).then(({data}) => {
          if(data instanceof Array){
            this.detaildataList = treeDataTranslate(data, 'id')
            this.detailDataListLoading = false
            this.visible=true;
          }else{
            this.visible=false;
          }
        })
      },
      //预览
      previewHandle(data){
        this.previewVisible = true
        this.$nextTick(() => {
          this.$refs.previewBox.init(data)
        })
      },
      //克隆
      copyHandle (id) {
        this.copyVisible = true
        this.$nextTick(() => {
          this.$refs.copy.init(id)
        })
      },
      //
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
            url: this.$http.adornUrl('/surveys/oesevaluation/delete'),
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
      },
      priviewClose(data){
        this.previewVisible=data;
      },
    }
  }
</script>
