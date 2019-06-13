<template>
<!-- 测评对象 -->
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-select v-model="dataForm.deptId" :disabled="isShow" filterable placeholder="请选择" clearable>
          <el-option
            v-for="item in deptList"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="dataForm.memberName" placeholder="姓名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('surveys:oesmembers:save'),!isShow" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('surveys:oesmembers:delete'),!isShow" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
        <el-button v-if="isAuth('surveys:oesmembers:import'),!isShow" type="primary" @click="uploadHandle()">导入</el-button>
        <el-button v-if="isAuth('surveys:oesmembers:export'),!isShow" type="primary" @click="exportHandle()">导出</el-button>
        <el-button v-if="isShow" type="primary" @click="chooseMenber()" :disabled="dataListSelections.length <= 0">批量插入</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="multipleTable"
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
      </el-table-column>
      <el-table-column
        prop="companyId"
        header-align="center"
        align="center"
        label="企业id">
      </el-table-column> -->
      <el-table-column
        prop="departmentName"
        header-align="center"
        align="center"
        label="单位部门">
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
        label="性别">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.memberSex === 1" size="small" >女</el-tag>
          <el-tag v-else size="small">男</el-tag>
        </template>
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
        label="是否新任">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isNew === 1" size="small" type="danger">否</el-tag>
          <el-tag v-else size="small">是</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column
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
      </el-table-column> -->
      <el-table-column
        prop="remark"
        header-align="center"
        align="center"
        label="备注">
      </el-table-column>
      <el-table-column v-if="!isShow"
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <!-- 弹窗, 导入 -->
    <upload v-if="uploadVisible" ref="upload" @refreshDataList="getDataList"></upload>
  </div>
</template>

<script>
  import AddOrUpdate from './oesmembers-add-or-update'
  import Upload from './oesmember-upload'
  export default {
    props: {
      isShow: {
        type: Boolean
      },
      members: {
        type: Array
      },
      domainIndex: {
        type: Number
      },
      deptId:{
        type: Number
      }
    },
    data () {
      return {
        dataForm: {
          memberName: '',
          deptId: ''
        },
        deptList: [],
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
      AddOrUpdate,Upload
    },
    created () {
      this.getDataList();
      this.getDeptList();
    },
    methods: {
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
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        if(this.deptId){
          this.dataForm.deptId = this.deptId
        }
        this.$http({
          url: this.$http.adornUrl('/surveys/oesmembers/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'memberName': this.dataForm.memberName,
            'deptId': this.dataForm.deptId,
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
        }).then(() => {
          //比对数据
          if(this.members){
            this.dataList.forEach(item => {
              this.members.forEach(e => {
                if(item.id === e.id){
                  this.$refs.multipleTable.toggleRowSelection(item,true);
                }
              })
            })
          }
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
      //选择对象
      chooseMenber(){
        let obj = {};
        obj.index = this.domainIndex;
        obj.dataListSelectionsArr = this.dataListSelections.concat(this.members);
        this.$emit('childByValue', obj);
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id)
        })
      },
      // 导入
      uploadHandle () {
        this.uploadVisible = true
        this.$nextTick(() => {
          this.$refs.upload.init()
        })
      },
      // 导出
      exportHandle () {
        this.$http({
          url: this.$http.adornUrl('/surveys/oesmembers/export'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'memberName': this.dataForm.memberName,
            'deptId': this.dataForm.deptId,
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
        link.setAttribute('download', '测评对象导出数据.xlsx')
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
            url: this.$http.adornUrl('/surveys/oesmembers/delete'),
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
    },
  }
</script>
