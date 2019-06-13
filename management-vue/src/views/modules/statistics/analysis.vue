<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
       <el-form-item>
        <el-select v-model="dataForm.surveyId" filterable placeholder="测评">
          <el-option
            v-for="item in surveyList"
            :key="item.id"
            :label="item.surveyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item>
        <el-select v-model="dataForm.grade" clearable  filterable placeholder="测评等级">
          <el-option
            v-for="item in grades"
            :key="item.grade"
            :label="item.grade"
            :value="item.grade">
          </el-option>
        </el-select>
      </el-form-item>-->
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%;">
      <el-table-column
        prop="surveyName"
        header-align="center"
        align="center"
        label="测评">
      </el-table-column>
      <el-table-column
        prop="evalName"
        header-align="center"
        align="center"
        label="测评表">
      </el-table-column>
      <el-table-column
        prop="votesTotal"
        header-align="center"
        align="center"
        label="投票人数">
      </el-table-column>
      <el-table-column
        prop="validTickets"
        header-align="center"
        align="center"
        label="有效票数">
      </el-table-column>
      <el-table-column
        prop="discardedTickets"
        header-align="center"
        align="center"
        label="弃票人数">
      </el-table-column>
      <el-table-column
        prop="proportion"
        header-align="center"
        align="center"
        label="权重比">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="detailsHandle(scope.row.surveyId,scope.row.evalId)">查看详情</el-button>
          <el-button type="text" size="small" @click="remarkInfoHandle(scope.row.surveyId,scope.row.evalId)">查看评价</el-button>
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
    <!-- 弹窗, 查看详情 -->
    <analysis-details v-if="detailsVisible" ref="analysisDetails" @refreshDataList="getDataList"></analysis-details>
    <analysis-remark-info v-if="remarkInfoVisible" ref="analysisRemarkInfo" @refreshDataList="getDataList"></analysis-remark-info>

  </div>
</template>

<script>
  import AnalysisDetails from './analysis-details'
  import AnalysisRemarkInfo from './analysis-remark-info'
  export default {
    data () {
      return {
        dataForm: {
          surveyId: '',
          deptId: '',
          grade: ''
        },
        type: '',
        surveyId: '',
        grades: [],
        surveyList:[],
        deptList:[],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        updateVisible: false,
        detailsVisible: false,
        remarkInfoVisible: false,
        detailsNoMemberVisible: false
      }
    },
    components: {
      AnalysisDetails,AnalysisRemarkInfo
    },
    activated () {
      this.dataForm.grade = ''
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
          url: this.$http.adornUrl('/statistics/analysis/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'surveyId': this.dataForm.surveyId,
            'deptId': this.dataForm.deptId,
            'grade': this.dataForm.grade
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            if(data.page.list&&data.page.list.length>0){
              this.grades = data.page.list[0].grades
            }else{
              this.grades=[]
            }
            this.dataList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 获取单位部门列表
      getDeptList(){
        this.$http({
          url: this.$http.adornUrl('/surveys/oesdepartment/selectAll'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.deptList = data.deptList;
        })
      },
      // 查看详情
      detailsHandle (surveyId,evalId) {
        this.detailsVisible = true
        // this.detailsNoMemberVisible = true
        this.$nextTick(() => {
          let grade = this.dataForm.grade
          this.$refs.analysisDetails.init(surveyId,evalId,grade)
        })
      },
      // 查看评价
      remarkInfoHandle (surveyId,evalId) {
        this.remarkInfoVisible = true
        this.$nextTick(() => {
          let grade = this.dataForm.grade
          this.$refs.analysisRemarkInfo.init(surveyId,evalId,grade)
        })
      },
      // 修改
      updateHandle (id) {
        this.updateVisible = true
        this.$nextTick(() => {
          this.$refs.update.init(id)
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
    }
  }
</script>
