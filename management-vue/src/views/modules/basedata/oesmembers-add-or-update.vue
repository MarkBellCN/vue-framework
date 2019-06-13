<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    :before-close="handleClose"
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="企业名称" prop="companyId">
        <el-select v-model="dataForm.companyId" filterable placeholder="请选择">
          <el-option
            v-for="item in companies"
            :key="item.id"
            :label="item.companyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="memberName">
        <el-input maxlength="20" v-model="dataForm.memberName" placeholder="姓名"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="memberSex">
        <el-radio v-model="dataForm.memberSex" label="男">男</el-radio>
        <el-radio v-model="dataForm.memberSex" label="女">女</el-radio>
      </el-form-item>
      <el-form-item label="出生日期" prop="memberBirth">
        <el-date-picker
          v-model="dataForm.memberBirth"
          type="month"
          placeholder="出生日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="现任职务" prop="memberPost">
        <el-input maxlength="30" v-model="dataForm.memberPost" placeholder="现任职务"></el-input>
      </el-form-item>
      <el-form-item label="任职时间" prop="tenureTime">
        <el-date-picker
          v-model="dataForm.tenureTime"
          type="month"
          placeholder="任职时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="原任职务" prop="originalPost">
        <el-input maxlength="30" v-model="dataForm.originalPost" placeholder="原任职务"></el-input>
      </el-form-item>
      <el-form-item label="新任选拔" prop="isNew">
        <el-radio v-model="dataForm.isNew" label="是">是</el-radio>
        <el-radio v-model="dataForm.isNew" label="否">否</el-radio>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input maxlength="50" v-model="dataForm.remark" placeholder="备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import {
    dateFormat
  } from "../../../utils/validate"

  export default {
    props: {
      companies: {
        type: Array
      }
    },
    data() {
      return {
        visible: false,
        // companies: [],
        dataForm: {
          id: 0,
          companyId: '',
          memberName: '',
          memberSex: '',
          memberBirth: '',
          memberPost: '',
          tenureTime: '',
          originalPost: '',
          isNew: '',
          sort: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          companyId: [
            {required: true, message: '企业不能为空', trigger: 'blur'}
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
          radio: [
            {required: true, message: '性别不能为空', trigger: 'blur'}
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
            {required: true, message: '新任选拔不能为空', trigger: 'blur'}
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
        }
      }
    },
    methods: {
      init(id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.getMemberInfo(this.dataForm.id)
        // this.getCompaniesList()
      },
      /**
       * 获取成员详细信息
       */
      getMemberInfo(id) {
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/basedata/oesmembers/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.companyId = data.oesmembers.companyId
              this.dataForm.memberName = data.oesmembers.memberName
              this.dataForm.memberSex = data.oesmembers.memberSex
              this.dataForm.memberBirth = data.oesmembers.memberBirth
              this.dataForm.memberPost = data.oesmembers.memberPost
              this.dataForm.tenureTime = data.oesmembers.tenureTime
              this.dataForm.originalPost = data.oesmembers.originalPost
              this.dataForm.isNew = data.oesmembers.isNew
              this.dataForm.createTime = data.oesmembers.createTime
              this.dataForm.updateTime = data.oesmembers.updateTime
              this.dataForm.remark = data.oesmembers.remark
            }
          })
        }
      },
      /**
       * 日期格式化
       */
      format(val, fmt) {
        return dateFormat(val, fmt);
      },
      // 表单提交
      dataFormSubmit() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/basedata/oesmembers/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'companyId': this.dataForm.companyId,
                'memberName': this.dataForm.memberName,
                'memberSex': this.dataForm.memberSex,
                'memberBirth': this.format(this.dataForm.memberBirth, 'yyyy-MM'),
                'memberPost': this.dataForm.memberPost,
                'tenureTime': this.format(this.dataForm.tenureTime, 'yyyy-MM'),
                'originalPost': this.dataForm.originalPost,
                'isNew': this.dataForm.isNew,
                'createTime': this.dataForm.id ? this.dataForm.createTime : this.format(new Date),
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
                    this.handleClose()
                    this.$message({
                      message: '操作成功',
                      type: 'success',
                      duration: 500,
                      onClose: () => {
                        this.handleClose()
                        this.$emit('refreshDataList')
                      }
                    })
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
