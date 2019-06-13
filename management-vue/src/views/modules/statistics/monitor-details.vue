<template>
  <div class="mod-config">
    <el-dialog
      :close-on-click-modal="false"
      :before-close="handleClose"
      width="50%"
      :visible.sync="visible">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
        <el-form-item>
          <el-select v-model="dataForm.grade" clearable filterable placeholder="测评等级">
            <el-option
              v-for="item in grades"
              :key="item.grade"
              :label="item.grade"
              :value="item.grade">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="dataForm.isOver" clearable filterable placeholder="是否填写完问卷">
            <el-option
              v-for="item in isOver"
              :key="item.grade"
               :label="item.label"
               :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="getDataList()">查询</el-button>
          <el-button type="primary" @click="exportHandle()">导出</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="dataList"
        border
        v-loading="dataListLoading"
        style="width: 100%;">
        <el-table-column
          prop="departmentName"
          header-align="center"
          align="center"
          label="单位部门">
        </el-table-column>
        <el-table-column
          prop="grade"
          header-align="center"
          align="center"
          label="测评等级">
        </el-table-column>
        <el-table-column
          prop="loginName"
          header-align="center"
          align="center"
          label="登录名称">
        </el-table-column>
        <el-table-column
          prop="isOver"
          header-align="center"
          align="center"
          label="是否填写完问卷">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isOver === 1" size="small" type="danger">是</el-tag>
            <el-tag v-else size="small">否</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @current-change="currentChangeHandle"
        :current-page="pageIndex"
        :page-size="pageSize"
        :total="totalPage"
        layout="total, prev, pager, next, jumper">
      </el-pagination>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name:"monitorDetails",
    data() {
      return {
        visible: false,
        dataForm: {
          grade: '',
          departmentId: '',
          isOver:''
        },
        surveyId: '',
        grades: [],
        isOver: [
          {
            value: '0',
            label: '否'
          }, {
            value: '1',
            label: '是'
          }
        ],
        surveyList: [],
        deptList: [],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
      }
    },

    methods: {
      init(deptId,surveyId) {
        this.visible=true;
        this.dataForm.grade = ''
        this.surveyId = surveyId;
        this.getDataList();
        this.getGrades()
      },
      // 获取测评等级
      getGrades() {
        this.$http({
          url: this.$http.adornUrl(`/surveys/oesevaluationgrade/info/${this.surveyId}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.grades = data.oesevaluationgrade
          }
        })
      },
      // 获取数据列表
      getDataList() {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/surveys/oeslogins/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'grade': this.dataForm.grade,
            'surveyId': this.surveyId,
            'isOver':this.dataForm.isOver,
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
      // 导出
      exportHandle () {
        this.$http({
          url: this.$http.adornUrl('/statistics/monitor/export'),
          method: 'get',
          params: this.$http.adornParams({
            'grade': this.dataForm.grade,
            'surveyId': this.surveyId,
            'isOver':this.dataForm.isOver,
          }),
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
        link.setAttribute('download', '测评用户填写情况.xlsx')
        document.body.appendChild(link)
        link.click()
      },

      // 每页数
      sizeChangeHandle(val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle(val) {
        this.pageIndex = val
        this.getDataList()
      },
      handleClose() {
        this.visible = false;
        this.$emit("monitorDetailsClose", false);
      }
    }
  }
</script>
