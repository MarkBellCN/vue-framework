<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="单位部门" prop="departmentId">
      <el-input v-model="dataForm.departmentId" placeholder="单位部门"></el-input>
    </el-form-item>
    <el-form-item label="测评问卷" prop="surverId">
      <el-input v-model="dataForm.surverId" placeholder="测评问卷"></el-input>
    </el-form-item>
    <el-form-item label="测评表" prop="evaluationId">
      <el-input v-model="dataForm.evaluationId" placeholder="测评表"></el-input>
    </el-form-item>
    <el-form-item label="测评表名称" prop="grade">
      <el-input v-model="dataForm.grade" placeholder="测评表名称"></el-input>
    </el-form-item>
    <el-form-item label="等级对应账号数" prop="gradeNum">
      <el-input v-model="dataForm.gradeNum" placeholder="等级对应账号数"></el-input>
    </el-form-item>
    <el-form-item label="权重占比" prop="proportion">
      <el-input v-model="dataForm.proportion" placeholder="权重占比"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间"></el-input>
    </el-form-item>
    <el-form-item label="更新时间" prop="updateTime">
      <el-input v-model="dataForm.updateTime" placeholder="更新时间"></el-input>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="dataForm.remark" placeholder="备注"></el-input>
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
        dataForm: {
          id: 0,
          departmentId: '',
          surverId: '',
          evaluationId: '',
          grade: '',
          gradeNum: '',
          proportion: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          departmentId: [
            { required: true, message: '单位部门id不能为空', trigger: 'blur' }
          ],
          surverId: [
            { required: true, message: '测评问卷id不能为空', trigger: 'blur' }
          ],
          evaluationId: [
            { required: true, message: '测评表id不能为空', trigger: 'blur' }
          ],
          grade: [
            { required: true, message: '测评表名称不能为空', trigger: 'blur' }
          ],
          gradeNum: [
            { required: true, message: '等级对应账号数不能为空', trigger: 'blur' }
          ],
          proportion: [
            { required: true, message: '权重占比不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '创建时间不能为空', trigger: 'blur' }
          ],
          updateTime: [
            { required: true, message: '更新时间不能为空', trigger: 'blur' }
          ],
          remark: [
            { required: true, message: '备注不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
        init (id) {
            this.dataForm.id = id || 0
            this.visible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
            if (this.dataForm.id) {
                this.$http({
                    url: this.$http.adornUrl(`/surveys/oesevaluationgrade/info/${this.dataForm.id}`),
                        method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
                    if (data && data.code === 0) {
                      this.dataForm.departmentId = data.oesevaluationgrade.departmentId
                      this.dataForm.surverId = data.oesevaluationgrade.surverId
                      this.dataForm.evaluationId = data.oesevaluationgrade.evaluationId
                      this.dataForm.grade = data.oesevaluationgrade.grade
                      this.dataForm.gradeNum = data.oesevaluationgrade.gradeNum
                      this.dataForm.proportion = data.oesevaluationgrade.proportion
                      this.dataForm.createTime = data.oesevaluationgrade.createTime
                      this.dataForm.updateTime = data.oesevaluationgrade.updateTime
                      this.dataForm.remark = data.oesevaluationgrade.remark
                }
            })
            }
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
              url: this.$http.adornUrl(`/surveys/oesevaluationgrade/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'departmentId': this.dataForm.departmentId,
                'surverId': this.dataForm.surverId,
                'evaluationId': this.dataForm.evaluationId,
                'grade': this.dataForm.grade,
                'gradeNum': this.dataForm.gradeNum,
                'proportion': this.dataForm.proportion,
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
