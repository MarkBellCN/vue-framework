<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="单位部门" prop="deptId">
      <el-select v-model="dataForm.deptId" filterable placeholder="请选择">
        <el-option
          v-for="item in deptList"
          :key="item.id"
          :label="item.departmentName"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="姓名" prop="memberName">
      <el-input v-model="dataForm.memberName" placeholder="姓名" maxlength="20"></el-input>
    </el-form-item>
    <el-form-item label="性别" prop="memberSex">
      <el-radio-group v-model="dataForm.memberSex">
        <el-radio :label="0">男</el-radio>
        <el-radio :label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="出生日期" prop="memberBirth">
      <el-date-picker
        v-model="dataForm.memberBirth"
        :picker-options="pickerOptions"
        type="date"
        placeholder="选择日期">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="现任职务" prop="memberPost">
      <el-input v-model="dataForm.memberPost" placeholder="现任职务" maxlength="30"></el-input>
    </el-form-item>
    <el-form-item label="任职时间" prop="tenureTime">
      <el-date-picker
        v-model="dataForm.tenureTime"
        :picker-options="pickerOptions"
        type="date"
        placeholder="选择日期">
    </el-date-picker>
    </el-form-item>
    <el-form-item label="原任职务" prop="originalPost">
      <el-input v-model="dataForm.originalPost" placeholder="原任职务" maxlength="30"></el-input>
    </el-form-item>
    <el-form-item label="是否新任" prop="isNew">
      <el-switch
        v-model="dataForm.isNew"
        active-value=0 active-color="#13ce66"
        inactive-value=1 inactive-color="#ff4949">
      </el-switch>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input  maxlength="50"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4}"
        placeholder="请输入内容"
        v-model="dataForm.remark">
      </el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { dateFormat }from "../../../utils/validate"
  export default {
    data () {
      return {
        visible: false,
        pickerOptions: {},
        deptList: [],
        dataForm: {
          id: 0,
          companyId: '',
          deptId: '',
          memberName: '',
          memberSex: 0,
          memberBirth: '',
          memberPost: '',
          tenureTime: '',
          originalPost: '',
          isNew: 1,
          sort: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {

          deptId: [
            { required: true, message: "请选择单位部门", trigger: "change" }
          ],
          memberName: [
            {required: true, message: '姓名不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          memberSex: [
            { required: true, message: '性别不能为空', trigger: 'blur' }
          ],
          memberPost: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-30位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          originalPost: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-30位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          isNew: [
            { required: true, message: '是否新任', trigger: 'blur' }
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    created () {
      this.pickerOptions = {
        disabledDate(time) {
          let now=new Date();
          now.setHours(0);
          now.setMinutes(0);
          now.setSeconds(0);
          now.setMilliseconds(0);
          return time.getTime() > now.getTime();
        }
      }
    },
    methods: {
      init (id) {
          this.dataForm.id = id || 0
          this.visible = true
          this.getInfo()
          this.getDeptList()
      },
      getInfo(){
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/surveys/oesmembers/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.companyId = data.oesmembers.companyId
              this.dataForm.deptId = data.oesmembers.deptId
              this.dataForm.memberName = data.oesmembers.memberName
              this.dataForm.memberSex = data.oesmembers.memberSex
              this.dataForm.memberBirth = data.oesmembers.memberBirth
              this.dataForm.memberPost = data.oesmembers.memberPost
              this.dataForm.tenureTime = data.oesmembers.tenureTime
              this.dataForm.originalPost = data.oesmembers.originalPost
              this.dataForm.isNew = data.oesmembers.isNew
              this.dataForm.sort = data.oesmembers.sort
              this.dataForm.createTime = data.oesmembers.createTime
              this.dataForm.updateTime = data.oesmembers.updateTime
              this.dataForm.remark = data.oesmembers.remark
            }
          })
        }
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
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oesmembers/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'companyId': this.dataForm.companyId,
                'deptId': this.dataForm.deptId,
                'memberName': this.dataForm.memberName,
                'memberSex': this.dataForm.memberSex,
                'memberBirth': this.dataForm.memberBirth?this.format(this.dataForm.memberBirth,'yyyy-MM-dd'):"",
                'memberPost': this.dataForm.memberPost,
                'tenureTime': this.dataForm.tenureTime?this.format(this.dataForm.tenureTime,'yyyy-MM-dd'):'',
                'originalPost': this.dataForm.originalPost,
                'isNew': this.dataForm.isNew,
                'sort': this.dataForm.sort,
                'createTime': this.dataForm.id?this.dataForm.createTime:this.format(new Date),
                'updateTime': this.format(new Date),
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 500,
                  onClose: () => {
                    this.handleClose();
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      handleClose() {
        this.visible = false;
        this.$refs['dataForm'].resetFields()
      }
    },
  }
</script>
