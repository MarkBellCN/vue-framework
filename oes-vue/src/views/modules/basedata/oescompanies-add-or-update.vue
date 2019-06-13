<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="modal">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="企业名称" prop="companyName">
      <el-input maxlength="30" v-model="dataForm.companyName"  placeholder="企业名称"></el-input>
    </el-form-item>
    <el-form-item label="企业代码" prop="companyCode">
      <el-input maxlength="30" v-model="dataForm.companyCode" placeholder="企业代码"></el-input>
    </el-form-item>
    <el-form-item label="排序号" prop="sort">
      <el-input-number maxlength="11" v-model="dataForm.sort" controls-position="right" :min="0" label="排序号"></el-input-number>
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
  import { treeDataTranslate } from '@/utils'
  import { dateFormat }from "../../../utils/validate"
  export default {
    props: {
      addOrUpdateVisible: {
        type: Boolean
      },
      addOrUpdateForm: {
        type: Object
      }
    },
    data () {
      return {
        modal: this.addOrUpdateVisible,
        dataForm: {
          id: 0,
          companyName: '',
          companyCode: '',
          sort: 0,
          parentId: '',
          parentName: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          companyName: [
            { required: true, message: '企业名称不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,30}$/,
              message: '1-30位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          companyCode: [
            { required: true, message: '企业代码不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9]{1,30}$/,
              message: '1-30位数字字母',
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
      }
    },
    methods: {
      /**
       * 日期格式化
       */
      format(val) {
        return dateFormat(val);
      },
      // 关闭模态框
      handleClose() {
        this.modal = false;
        this.$emit('closeModal', this.modal);
        this.$refs['dataForm'].resetFields();

      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/basedata/oescompanies/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'companyName': this.dataForm.companyName,
                'companyCode': this.dataForm.companyCode,
                'sort': this.dataForm.sort,
                'parentId': this.dataForm.parentId,
                'createTime': this.dataForm.id?this.dataForm.createTime:this.format(new Date),
                'updateTime': this.format(new Date),
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
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
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
    },
    watch: {
      addOrUpdateVisible(val) {
        this.modal = val;
      },
      addOrUpdateForm(val) {
        if(val) {
          this.dataForm = Object.assign({},val);
        }
      }
    }
  }
</script>

<style lang="scss">
  .mod-menu {
    .menu-list__input,
    .icon-list__input {
       > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      max-width: 370px;
    }
    &__icon-list {
      max-height: 180px;
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
  }
</style>
