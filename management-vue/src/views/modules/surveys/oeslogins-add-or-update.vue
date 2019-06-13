<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="90px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="测评问卷" prop="surveyId">
            <el-select @change="getGradesList(dataForm.surveyId)" v-model="dataForm.surveyId" disabled filterable
                       placeholder="请选择">
              <el-option
                v-for="item in surveyList"
                :key="item.id"
                :label="item.surveyName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label-width="'110px'"  label="全部测评表" prop="type">
            <el-switch @change="typeChange" :disabled="true"
              v-model="dataForm.type"
              active-value=1 active-color="#ff4949"
              inactive-value=0 inactive-color="#13ce66">
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form :model="gradeValidateForm" ref="gradeValidateForm" label-width="90px" class="demo-dynamic">
        <el-row :gutter="20" v-for="(domain, index) in gradeValidateForm.domains" :label="'测评用户数' + (index+1)"
                :key="domain.key" :prop="'domains.' + index + '.departmentId'" style="{ padding: '20px' }">
          <el-col :span="24">
            <el-form-item :label="'测评用户' + (index+1)" :key="domain.key" :prop="'domains.' + index + '.departmentId'">
              <el-card class="box-card">
                <el-form-item label="测评表" :prop="'domains.' + index + '.evalId'">
                  <el-input :disabled="true" v-model="domain.evalName" placeholder="测评表"></el-input>
                </el-form-item>
                <el-form-item label="测评等级">
                  <el-card class="box-card">
                    <el-row :gutter="8" v-for="(grades, index) in domain.grades" :key="grades.key"
                            :label="'测评等级账号' + (index+1)" :prop="'grades.' + index + '.value'">
                      <el-form-item>
                        <el-col :span="4">
                          <el-input :disabled="true" v-model="grades.grade" placeholder="测评等级"></el-input>
                        </el-col>
                        <el-col :span="12">
                          <el-input-number v-model="grades.gradeNum" :min="1" :max="9999" label="用户数"></el-input-number>
                        </el-col>
                      </el-form-item>
                    </el-row>
                  </el-card>
                </el-form-item>
              </el-card>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

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
  import {dateFormat} from "../../../utils/validate"

  export default {
    data() {
      return {
        visible: false,
        surveyList: [],
        dataForm: {
          id: 0,
          surveyId: '',
          createTime: '',
          updateTime: '',
          remark: '',
          type: 0,
        },
        dataRule: {
          surveyId: [
            {required: true, message: '测评问卷不能为空', trigger: 'blur'}
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ]
        },

        gradeValidateForm: {
          domains: [
            {
              grades: [{
                grade: '',
                gradeNum: '',
              }],
              departmentId: '',
              departmentName: '',
              evalId: '',
              evalName: '',
              surveyId: '',
              key: Date.now()
            }
          ]
        }
      }
    },
    methods: {
      init(id,surveyId) {
        this.dataForm.id = id
        this.dataForm.surveyId = surveyId
        this.visible = true
        this.gradeValidateForm.domains = []
        this.getSurveyList()
        this.getGradesList(surveyId)
      },
      // 获取测评数据列表
      getSurveyList() {
        this.$http({
          url: this.$http.adornUrl('/surveys/oessurveys/select'),
          method: 'get',
        }).then(({data}) => {
          this.surveyList = data.surveyList
        })
      },
      getGradesList(id) {
        this.gradeValidateForm.domains = []
        this.dataForm.surveyId = id ? id : this.dataForm.surveyId
        this.$http({
          url: this.$http.adornUrl(`/surveys/oeslogins/grades/${this.dataForm.surveyId}/${this.dataForm.type}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.type = this.dataForm.type
            if (data.oeslogins) {
              data.oeslogins.forEach(i => {
                let obj = {
                  departmentId: i.departmentId,
                  departmentName: i.departmentName,
                  evalId: i.evalId,
                  evalName: i.evalName,
                  grades: i.grades,
                  key: Date.now()
                }
                this.gradeValidateForm.domains.push(obj)
              });
            }
          }
        })
      },
      typeChange(){
        debugger;
        this.getGradesList()
      },
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oeslogins/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'surveyId': this.dataForm.surveyId,
                'group': this.gradeValidateForm.domains,
                'createTime': this.dataForm.id ? this.dataForm.createTime : this.format(new Date),
                'updateTime': this.format(new Date),
                'remark': this.dataForm.remark,
                'type': this.dataForm.type
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
        this.dataForm.surveyId = '';
        this.surveyList = [];
        this.gradeValidateForm.domains = [];
        this.$refs['dataForm'].resetFields()
      }
    },
  }
</script>
