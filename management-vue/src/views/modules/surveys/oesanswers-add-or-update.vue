<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="选题id" prop="questionId">
        <el-input v-model="dataForm.questionId" placeholder="选题id"></el-input>
      </el-form-item>
      <el-form-item label="选项描述" prop="answerDesc">
        <el-input maxlength="50"  v-model="dataForm.answerDesc" placeholder="选项描述"></el-input>
      </el-form-item>
      <el-form-item label="选项类型（1.单选  2.多选 3.判断 4.打分）" prop="type">
        <el-input maxlength="50"  v-model="dataForm.type" placeholder="选项类型（1.单选  2.多选 3.判断 4.打分）"></el-input>
      </el-form-item>
      <el-form-item label="选项排序" prop="orderNum">
        <el-input maxlength="50"  v-model="dataForm.orderNum" placeholder="选项排序"></el-input>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm.createTime" placeholder="创建时间"></el-input>
      </el-form-item>
      <el-form-item label="更新时间" prop="updateTime">
        <el-input v-model="dataForm.updateTime" placeholder="更新时间"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input maxlength="50"  v-model="dataForm.remark" placeholder="备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import {dateFormat} from "../../../utils/validate"

  export default {
    data() {
      return {
        visible: false,
        dataForm: {
          id: 0,
          questionId: '',
          answerDesc: '',
          type: '',
          orderNum: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          questionId: [
            {required: true, message: '选题id不能为空', trigger: 'blur'}
          ],
          answerDesc: [
            {required: true, message: '选项描述不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          type: [
            {required: true, message: '选项类型（1.单选  2.多选 3.判断 4.打分）不能为空', trigger: 'change'}
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      init(id) {
        this.dataForm.id = id || 0
        this.visible = true
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/surveys/oesanswers/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.questionId = data.oesanswers.questionId
              this.dataForm.answerDesc = data.oesanswers.answerDesc
              this.dataForm.type = data.oesanswers.type
              this.dataForm.orderNum = data.oesanswers.orderNum
              this.dataForm.createTime = data.oesanswers.createTime
              this.dataForm.updateTime = data.oesanswers.updateTime
              this.dataForm.remark = data.oesanswers.remark
            }
          })
        }
      },
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oesanswers/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'questionId': this.dataForm.questionId,
                'answerDesc': this.dataForm.answerDesc,
                'type': this.dataForm.type,
                'orderNum': this.dataForm.orderNum,
                'createTime': this.dataForm.createTime,
                'updateTime': this.dataForm.updateTime,
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
