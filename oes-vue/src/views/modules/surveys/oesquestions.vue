<template>
<!-- 测评选题 -->
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-select v-model="dataForm.evaluationId" filterable placeholder="请选择">
          <el-option
            v-for="item in evaluationList"
            :key="item.id"
            :label="item.evaluationName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.questionName" placeholder="选题描述" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('surveys:oesquestions:save')" type="primary" :disabled="this.dataForm.evaluationId?false:true"  @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%;">
      <el-table-column
        prop="evaluationName"
        header-align="center"
        align="center"
        label="测评表">
      </el-table-column>
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
        label="上级选题">
        <template slot-scope="scope">
          <span v-if="!scope.row.parentName">一级选题</span>
          <span v-else>{{scope.row.parentName}}</span>
        </template>
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
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getEvalList"></add-or-update>
  </div>
</template>

<script>
  import TableTreeColumn from '@/components/table-tree-column'
  import {treeDataTranslate} from '@/utils'
  import AddOrUpdate from './oesquestions-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          evaluationId: '',
          questionName: ''
        },
        dataList: [],
        evaluationList: [],
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
      }
    },
    components: {
      TableTreeColumn,
      AddOrUpdate
    },
    activated () {
      this.getEvalList()
    },
    methods: {
      //获取测评表列表
      getEvalList(){
        this.$http({
          url: this.$http.adornUrl('/surveys/oesevaluation/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.evaluationList = data.evaluationList;
          if(!this.dataForm.evaluationId&&data.evaluationList.length>0){
            this.dataForm.evaluationId = data.evaluationList[0].id
          }
          this.getDataList()
        })
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/surveys/oesquestions/list'),
          method: 'get',
          params: this.$http.adornParams({
            'evaluationId': this.dataForm.evaluationId,
            'questionName': this.dataForm.questionName
          })
        }).then(({data}) => {
          this.dataList = treeDataTranslate(data, 'id')
          this.dataListLoading = false
        })
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        let evalId = this.dataForm.evaluationId
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id,evalId)
        })
      },
      // 删除
      deleteHandle (id) {
        this.$confirm(`确定进行[删除]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl(`/surveys/oesquestions/delete/${id}`),
            method: 'post',
            data: this.$http.adornData()
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
    }
  }
</script>
