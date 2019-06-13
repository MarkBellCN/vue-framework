<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <!--<el-form-item>
        <el-select v-model="dataForm.surveyId" clearable  filterable placeholder="测评">
          <el-option
            v-for="item in surveyList"
            :key="item.id"
            :label="item.surveyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>-->
      <!--<el-form-item>
        <el-select v-model="dataForm.deptId" clearable  filterable placeholder="单位部门">
          <el-option
            v-for="item in deptList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>-->
      <el-form-item>
        <el-select v-model="dataForm.status" clearable  filterable placeholder="测评状态">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      style="width: 100%;">
      <!-- <el-table-column
        prop="deptId"
        header-align="center"
        align="center"
        width="50">
      </el-table-column> -->
      <el-table-column
        prop="surveyName"
        header-align="center"
        align="center"
        label="测评问卷">
      </el-table-column>
      <!--<el-table-column
        prop="deptName"
        header-align="center"
        align="center"
        label="单位部门">
      </el-table-column>-->
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="是否结束">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small">未开始</el-tag>
          <el-tag v-if="scope.row.status === 1" size="small" >进行中</el-tag>
          <el-tag v-if="scope.row.status === 2" size="small" type="danger">已结束</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="detailsHandle(scope.row.deptId,scope.row.surveyId)">查看详情</el-button>
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
    <monitorDetails v-if="monitorDetailsVisible" ref="monitorDetailsBox" v-on:monitorDetailsClose="monitorDetailsClose"></monitorDetails>
  </div>
</template>

<script>
  import monitorDetails from './monitor-details'
  export default {
    data () {
      return {
        monitorDetailsVisible:false,
        statusList:[
          {
            value: '0',
            label: '未开始'
          }, {
            value: '1',
            label: '进行中'
          },{
            value: '2',
            label: '已结束'
          }
        ],
        dataForm: {
          surveyId: '',
          deptId: '',
          status: ''
        },
        surveyList:[],
        deptList:[],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
      }
    },
    components:{
      monitorDetails
    },
    activated () {
      this.getDataList()
      this.getSurveyList()
      this.getDeptList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistics/monitor/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'surveyId': this.dataForm.surveyId,
            'deptId': this.dataForm.deptId,
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
      // 获取测评数据列表
      getSurveyList () {
        this.$http({
          url: this.$http.adornUrl('/surveys/oessurveys/select'),
          method: 'get',
        }).then(({data}) => {
          this.surveyList = data.surveyList
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
      // 查看详情
      detailsHandle(deptId,surveyId){
        this.monitorDetailsVisible=true;
        this.$nextTick(() => {
          this.$refs.monitorDetailsBox.init(deptId,surveyId);
        })
      },
      monitorDetailsClose(){
        this.monitorDetailsVisible=false;
      }
    }
  }
</script>
