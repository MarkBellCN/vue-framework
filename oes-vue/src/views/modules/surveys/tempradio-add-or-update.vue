<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="90px">
    <el-form-item label="单选组" prop="radioName">
      <el-input v-model="dataForm.radioName" placeholder="单选组" maxlength="20"></el-input>
    </el-form-item>
    <el-form :model="radioValidateForm" :rules="radioValidateRule" ref="radioValidateForm" label-width="90px" class="demo-dynamic">
      <el-row :gutter="8">
        <el-form-item v-for="(domain, index) in radioValidateForm.domains" :label="'选项' + (index+1)" :key="domain.key" :prop="'domains.' + index + '.value'">
          <el-col :span="20">
            <el-input v-model="domain.value" placeholder="选项描述" maxlength="50"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button @click.prevent="removeDomain(domain)">删除</el-button>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button @click="addDomain">增加选项</el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <el-form-item label="备注" prop="remark">
      <el-input maxlength="50" v-model="dataForm.remark" placeholder="备注"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
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
        radioList: [],
        dataForm: {
          id: 0,
          radioName: '',
          radioDesc: '',
          orderNum: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          radioName: [
            { required: true, message: '单选组不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
        },
        radioValidateRule:{
          domains: []
        },
        radioValidateForm: {
          domains: []
        },
      }
    },
    methods: {
        init (id) {
          this.dataForm.id = id || 0
          this.visible = true
          this.radioList = []
          this.radioValidateForm.domains = []
          this.$nextTick(() => {
              this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
              this.$http({
                url: this.$http.adornUrl(`/surveys/tempradio/info/${this.dataForm.id}`),
                method: 'get',
                params: this.$http.adornParams()
          }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.radioName = data.tempradio.radioName
                this.dataForm.radioDesc = data.tempradio.radioDesc
                this.dataForm.orderNum = data.tempradio.orderNum
                this.dataForm.createTime = data.tempradio.createTime
                this.dataForm.updateTime = data.tempradio.updateTime
                this.dataForm.remark = data.tempradio.remark
                this.radioList = data.tempradio.radioDesc.split(",")
                if(data.tempradio.radioDesc){
                  for (let i of this.radioList) {
                    let obj = {
                      value: i,
                      key: Date.now()
                    }
                    this.radioValidateForm.domains.push(obj)
                  }
                }
              }
            })
          }
        })
      },
      /**
       * 删除一条选项
       */
      removeDomain(item) {
        var index = this.radioValidateForm.domains.indexOf(item);
        if (index !== -1) {
          this.radioValidateForm.domains.splice(index, 1);
          this.radioValidateRule.domains.splice(index, 1);
        }
      },
      /**
       * 新增一条选项
       */
      addDomain() {
        if(this.radioValidateForm.domains.length>9){
          this.$message({
            message: '最多是十选项',
            type: 'info',
          })
          return;
        }
        this.radioValidateForm.domains.push({
          value: '',
          key: Date.now()
        });
        this.radioValidateRule.domains.push({
          value: [
            { required: true, message: '选项描述不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
        });
      },
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit () {
        //封装参数
        this.radioList = []
        if(!this.radioValidateForm.domains|| this.radioValidateForm.domains.length<=0){
          this.$message({
            message: '请添加选项描述',
            type: 'info',
          })
          return;
        }
        for (let i of this.radioValidateForm.domains) {
          this.radioList.push(i.value);
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$refs['radioValidateForm'].validate((valid) => {
              if (valid) {
                this.$http({
                  url: this.$http.adornUrl(`/surveys/tempradio/${!this.dataForm.id ? 'save' : 'update'}`),
                  method: 'post',
                  data: this.$http.adornData({
                    'id': this.dataForm.id || undefined,
                    'radioName': this.dataForm.radioName,
                    'radioDesc': this.dataForm.radioDesc,
                    'radioList': this.radioList,
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
                        this.visible = false
                        this.$emit('refreshDataList')
                      }
                    })
                  } else {
                    this.$message.error(data.msg)
                  }
                })
              }
            });
          }
        })
      },
    },
  }
</script>
