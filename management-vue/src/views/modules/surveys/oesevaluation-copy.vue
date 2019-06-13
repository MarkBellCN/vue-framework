<template>

<el-dialog
  title="克隆测评表"
  :close-on-click-modal="false"
  :visible.sync="visible">

  <el-form :model="dataForm" :rules="dataRule" ref="dataForm" >
    <el-form-item label="请填写新的测评表名称" prop="evaluationName">
      <el-input v-model="dataForm.evaluationName" placeholder="测评表名称"  oninput="if(value.length > 100) value = value.slice(0, 100)"></el-input>
    </el-form-item>
  </el-form>

  <span slot="footer" class="dialog-footer">
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
  </span>

</el-dialog>

</template>

<script>
  import ChooseMember from './oesmembers'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          evaluationName: ''
        },
        dataRule: {
          evaluationName: [
            { required: true, message: '测评表名称不能为空', trigger: 'blur' },
            { min: 1, max: 100, message: "长度不超过100个字符",  trigger: "blur"}
          ]
        },
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.dataForm.id = id || 0
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oesevaluation/copy`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'evaluationName': this.dataForm.evaluationName
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 500,
                  onClose: () => {
                      this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>


