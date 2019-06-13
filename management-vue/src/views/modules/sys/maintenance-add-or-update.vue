<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="当前登录用户" prop="userId">
      <el-input v-model="dataForm.userId" placeholder="当前登录用户"></el-input>
    </el-form-item>
    <el-form-item label="备份名称" prop="name">
      <el-input v-model="dataForm.name" placeholder="备份名称"></el-input>
    </el-form-item>
    <el-form-item label="备份路径" prop="url">
      <el-input v-model="dataForm.url" placeholder="备份路径"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          userId: '',
          name: '',
          url: '',
          createTime: ''
        },
        dataRule: {
          userId: [
            { required: true, message: '当前登录用户不能为空', trigger: 'blur' }
          ],
          name: [
            { required: true, message: '备份名称不能为空', trigger: 'blur' }
          ],
          url: [
            { required: true, message: '备份路径不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '创建时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/sys/maintenance/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.userId = data.maintenance.userId
              this.dataForm.name = data.maintenance.name
              this.dataForm.url = data.maintenance.url
              this.dataForm.createTime = data.maintenance.createTime
            }
          })
        }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/maintenance/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'userId': this.dataForm.userId,
                'name': this.dataForm.name,
                'url': this.dataForm.url,
                'createTime': this.dataForm.createTime
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
    }
  }
</script>
