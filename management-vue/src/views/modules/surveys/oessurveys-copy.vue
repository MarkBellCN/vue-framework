<template>

<el-dialog
  title="克隆测评"
  :close-on-click-modal="false"
  :visible.sync="visible">

  <el-form :model="dataForm" :rules="dataRule" ref="dataForm" >
    <el-form-item label="请填写新的测评名称:" prop="surveyName" maxlength="20">
      <el-input v-model="dataForm.surveyName" placeholder="测评名称"></el-input>
    </el-form-item>
    <el-form-item label="请选择起止时间:" prop="startTime"><br>
      <el-date-picker
      v-model="value"
      :clearable="false"
      type="daterange"
      :picker-options="pickerOptions"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期">
    </el-date-picker>
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
  import ChooseMember from './oesmembers'
  export default {
    data () {
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
        pickerOptions: {},
        dataForm: {
          id: 0,
          surveyName: '',
          startTime: '',
          endTime: '',
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
        },
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
          return time.getTime() <= now.getTime();
        }
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.dataForm.surveyName = ''
        this.dataForm.id = id || 0
      },
      /**
       * 日期格式化
       */
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit () {
        let date = this.value;
        this.dataForm.startTime = date[0]
        this.dataForm.endTime = date[1]
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oessurveys/copy`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'surveyName': this.dataForm.surveyName,
                'startTime': this.format(this.dataForm.startTime,'yyyy-MM-dd'),
                'endTime': this.format(this.dataForm.endTime,'yyyy-MM-dd'),
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


