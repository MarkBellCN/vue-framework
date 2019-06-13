<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="modalHandleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="测评名称" prop="surveyName" >
      <el-input v-model="dataForm.surveyName" placeholder="测评名称" maxlength="20"></el-input>
    </el-form-item>
    <el-form-item label="起止时间" prop="startTime">
      <el-date-picker
      v-model="value"
      :clearable="false"
      :picker-options="pickerOptions"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期">
    </el-date-picker>
    </el-form-item>
    <el-form-item label="测评等级" prop="gradList" >
      <el-tag
        :key="tag"
        v-for="(tag,index) in dynamicTags"
        closable
        :disable-transitions="false"
        @close="handleClose(index)">
        {{tag}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        maxlength="2"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 测评等级</el-button>
    </el-form-item>
    <el-form-item label="排序号" prop="sort">
      <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" label="排序号"></el-input-number>
    </el-form-item>
    <el-form-item label="备注" prop="remark" >
      <el-input v-model="dataForm.remark" placeholder="备注" maxlength="50"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="modalHandleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit('dataForm')">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { dateFormat }from "../../../utils/validate"
  export default {
    data () {
      //测评等级校验
      const checkGradList = (rule, value, callback) => {
        let grads = this.dynamicTags
        if (grads.length <= 0) {
          return callback(new Error("请设置测评等级"));
        }
        callback();
      };
      const validateTime = (rule, value, callback) => {
        if (value.getTime() == this.dataForm.endTime.getTime()) {
          callback(new Error('开始结束时间不能相同!'));
        } else {
          callback();
        }
      };
      return {
        visible: false,
        value:[],
        dynamicTags: [],
        inputVisible: false,
        inputValue: '',
        pickerOptions: {},
        dataForm: {
          id: 0,
          companyId: '',
          surveyName: '',
          startTime: '',
          endTime: '',
          sort: '',
          gradList:[],
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          surveyName: [
            { required: true, message: '测评名称不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          startTime: [
            { type: 'date',required: true, message: '请选择起止时间', trigger: 'blur,change' },
            { validator: validateTime, trigger: 'blur,change' },
          ],
          gradList: [
            { required: true, validator: checkGradList, trigger: 'blur' },
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
    created () {
      this.pickerOptions = {
        disabledDate:(time)=>{
          let now=new Date();
          now.setHours(0);
          now.setMinutes(0);
          now.setSeconds(0);
          now.setMilliseconds(0);
          if(!this.dataForm.id){
            return time.getTime() <= now.getTime();
          }else{
            return time.getTime() < now.getTime();
          }
        }
      }
    },
    methods: {
      init(id){
        this.value =  []
        this.dynamicTags = []
        this.dataForm.id = id
        this.visible = true
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/surveys/oessurveys/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm = Object.assign({},data.oessurveys);
              this.value.push(new Date(data.oessurveys.startTime))
              this.value.push(new Date(data.oessurveys.endTime))
              data.oessurveys.gradList.forEach(element => {
                this.dynamicTags.push(element.grade)
              });
            }
          })
        }
      },
      handleClose(tag) {
        this.dynamicTags.splice(tag, 1);
      },

      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },

      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.dynamicTags.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      /**
       * 日期格式化
       */
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit(formName) {
        let date = this.value;
        if(date&&date.length>1){
          this.dataForm.startTime = date[0]
          this.dataForm.endTime = date[1]
        }
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oessurveys/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'surveyName': this.dataForm.surveyName,
                'startTime': this.format(this.dataForm.startTime,'yyyy-MM-dd'),
                'endTime': this.format(this.dataForm.endTime,'yyyy-MM-dd'),
                'sort': this.dataForm.sort,
                'grads': this.dynamicTags,
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
                    this.modalHandleClose()
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
      modalHandleClose(){
        this.value =  []
        this.dynamicTags = []
        this.visible = false;
        this.$refs['dataForm'].resetFields()
      }
    }
  }
</script>

<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>

