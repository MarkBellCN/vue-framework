<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <!-- <el-input v-model="dataForm.surveyId" placeholder="测评" clearable></el-input> -->
        <el-select v-model="dataForm.surveyId"  filterable placeholder="测评">
          <el-option
            v-for="item in surveyList"
            :key="item.id"
            :label="item.surveyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <!-- <el-input v-model="dataForm.departmentId" placeholder="单位部门" clearable></el-input> -->
        <el-select v-model="dataForm.departmentId" clearable filterable placeholder="单位部门">
          <el-option
            v-for="item in deptList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('surveys:oeslogins:save')" type="primary" :disabled="this.dataForm.surveyId?false:true" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('surveys:oeslogins:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
        <el-button v-if="isAuth('surveys:oeslogins:export')" type="primary" @click="exportHandle()">导出</el-button>
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
        label="测评问卷">
      </el-table-column>
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
        prop="loginPwd"
        header-align="center"
        align="center"
        label="登录密码">
      </el-table-column>
      <!-- <el-table-column
        prop="isOver"
        header-align="center"
        align="center"
        label="是否填写完问卷">
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
          <!-- <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button> -->
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
  import AddOrUpdate from './oeslogins-add-or-update'
  export default {
    data () {
      return {
        dataForm: {
          surveyId: '',
          departmentId: '',
        },
        surveyList:[],
        deptList:[],
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
      }
    },
    components: {
      AddOrUpdate
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
          url: this.$http.adornUrl('/surveys/oeslogins/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'surveyId': this.dataForm.surveyId,
            'departmentId': this.dataForm.departmentId,
            'grade': '',
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
          if(data.surveyList&&data.surveyList.length>0){
            this.dataForm.surveyId=data.surveyList[0].id;
          }
          this.surveyList = data.surveyList
        })
      },
      //获取单位部门列表
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
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id,this.dataForm.surveyId)
        })
      },
      // 导出
      exportHandle () {
        if(!this.dataForm.surveyId){
          this.$message.error("请选择测评")
          return
        }
        this.$http({
          url: this.$http.adornUrl('/surveys/oeslogins/export'),
          method: 'get',
          params: this.$http.adornParams({
            'surveyId': this.dataForm.surveyId,
            'departmentId': this.dataForm.departmentId
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
        link.setAttribute('download', '测评用户.xlsx')
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
            url: this.$http.adornUrl('/surveys/oeslogins/delete'),
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
