<template>
  <div>
    <el-dialog
      :title="!dataForm.id ? '新增' : '修改'"
      :close-on-click-modal="false"
      :before-close="dialogHandleClose"
      :visible.sync="visible">
      <div>
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
                 label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="测评" prop="surverId">
                <el-select disabled v-model="dataForm.surverId" filterable placeholder="请选择">
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
              <el-form-item label="测评表" prop="evaluationName">
                <el-input v-model="dataForm.evaluationName" maxlength="50" placeholder="测评表名称"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="dataForm.remark" maxlength="50" placeholder="备注"></el-input>
          </el-form-item>
        </el-form>

        <el-form :model="evaluationForm" ref="evaluationForm" :rules="evaluationDataRule" label-width="120px"
                 id="evaluationForm">
          <el-row :gutter="20" v-for="(domain, index) in evaluationForm.domains" :label="'测评组' + (index+1)"
                  :key="domain.key" :prop="'domains.' + index + '.deptId'" style="{ padding:20px}">
            <el-col :span="22">
              <el-form-item :label="'测评组' + (index+1)" :key="domain.key">
                <el-card class="box-card">
                  <el-form-item label="单位部门" :prop="'domains.' + index + '.deptId'">
                    <el-select v-model="domain.deptId" @change="deptSelectChange(index)" filterable placeholder="请选择">
                      <el-option
                        v-for="item in deptList"
                        :key="item.id"
                        :disabled="deptListIsDisable(item.id)"
                        :label="item.departmentName"
                        :value="item.id">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="测评对象" :prop="'domains.' + index + '.members'">
                    <el-button type="info" plain @click="chooseMember(index,domain.members,domain.deptId)">选择测评对象
                    </el-button>
                    <el-button type="danger" plain @click="clearMember(index)">清空</el-button>
                    <br>
                    <el-tag
                      closable
                      v-for="tag in domain.members"
                      :key="tag.id"
                      @close="handleClose(index,tag,domain.members)">
                      {{tag.memberName}}
                    </el-tag>
                  </el-form-item>
                </el-card>
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <el-button type="danger" icon="el-icon-delete" circle @click.prevent="removeDomain(domain)"></el-button>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button @click="addDomain">新增测评组</el-button>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="dialogHandleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
      <el-dialog
        width="80%"
        title="选择测评对象"
        :visible.sync="innerVisible"
        append-to-body>
        <choose-member :isShow="isShow" v-on:childByValue="childByValue" v-if="innerVisible" ref="chooseMember"
                       :members="members" :domainIndex="domainIndex" :deptId="deptId"></choose-member>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
  import ChooseMember from './oesmembers'
  import {dateFormat} from "../../../utils/validate"

  export default {
    data() {
      return {
        membersValidator: (rule, value, callback) => {
          if (!value || value.length <= 0) {
            callback(new Error('测评对象不能为空'));
          } else {
            callback();
          }
        },
        isShow: true,
        visible: false,
        innerVisible: false,
        surveyList: [],
        deptList: [],
        members: [],
        grades: [],
        dataForm: {
          id: 0,
          surverId: 0,
          evaluationName: '',
          createTime: '',
          updateTime: '',
          grade: '',
          remark: ''
        },
        dataRule: {
          evaluationName: [
            {required: true, message: '测评表名称不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
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
          ]
        },
        evaluationDataRule:{
          domains: []
        },
        evaluationForm: {
          domains: []
        },
        domainIndex: 0
      }
    },
    components: {
      ChooseMember
    },
    methods: {
      init(id, surveyId) {
        let tempSurveyId = null;
        tempSurveyId = surveyId;
        this.dataForm.id = id || 0
        this.getGrade(tempSurveyId)
        this.visible = true
        this.getSurveyList()
        this.getDeptList()
        this.dataForm.surverId = tempSurveyId || 0
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/surveys/oesevaluation/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.evaluationName = data.oesevaluation.evaluationName
              this.dataForm.createTime = data.oesevaluation.createTime
              this.dataForm.updateTime = data.oesevaluation.updateTime
              this.dataForm.remark = data.oesevaluation.remark
              if (data.oesevaluation.evaluationGroupForms) {
                data.oesevaluation.evaluationGroupForms.forEach(()=>{
                  this.evaluationDataRule.domains.push({
                      deptId: [
                        { required: true, message: '测评组单位部门不能为空', trigger: 'change' },
                      ],
                      members:[
                        {
                          validator: this.membersValidator ,trigger: 'change'
                        }
                      ]
                    }
                  )
                })
              }
              this.evaluationForm.domains = data.oesevaluation.evaluationGroupForms
            }
          })
        }
      },
      deptListIsDisable(id){
        for(let i=0;i<this.evaluationForm.domains.length;i++){
          let data=this.evaluationForm.domains[i];
          if(data.deptId==id){
            return true
          }
        }
        return false
      },
      deptSelectChange(index){
        this.evaluationForm.domains[index].members=[];
      },
      /**
       * 删除一条测评组
       */
      removeDomain(item) {
        var index = this.evaluationForm.domains.indexOf(item);
        this.evaluationForm.domains.splice(index, 1);
        this.evaluationDataRule.domains.splice(index, 1);
      },

      /**
       * 新增一条测评组
       */
      addDomain() {
        this.$refs['evaluationForm'].validate((valid) => {
          if (valid) {
            this.evaluationDataRule.domains.push({
                deptId: [
                  {required: true, message: '测评组单位部门不能为空', trigger: 'change'},
                ],
                members: [
                  {
                    validator: this.membersValidator, trigger: 'change'
                  }
                ]
              }
            )
            this.evaluationForm.domains.push({
              deptId: '',
              key: Date.now(),
              members: []
            });
          }else{

          }
        })
      },

      handleClose(index, tag, members) {
        this.members = members;
        this.domainIndex = index;
        this.members.splice(this.members.indexOf(tag), 1);

      },
      //选择对象
      chooseMember(index, members, deptId) {
        if (!deptId) {
          this.$message({
            message: '请选择单位部门',
            type: 'warn',
            duration: 1500,
          })
          return;
        }
        this.innerVisible = true
        this.domainIndex = index;
        this.members = members;
        this.deptId = deptId;
      },
      //清空对象
      clearMember(index) {
        this.evaluationForm.domains[index].members = []
        this.$refs['evaluationForm'].validate();
      },
      //获取选中的测评对象
      childByValue: function (childValue) {
        let membersCount=0;
        this.evaluationForm.domains.forEach(data=>{
          membersCount+=data.members.length;
        })
        if(membersCount>=200){
          this.$message({
            message: '每个测评表测评对象最多200人',
            type: 'warn',
            duration: 1000,
          })
          return;
        }
        // childValue就是子组件传过来的值
        this.evaluationForm.domains[childValue.index].members = childValue.dataListSelectionsArr;
        this.innerVisible = false
        this.$refs['evaluationForm'].validate();
      },
      //获取单位部门列表
      getDeptList() {
        this.$http({
          url: this.$http.adornUrl('/surveys/oesdepartment/selectAll'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.deptList = data.deptList;
        })
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
      //获取测评等级
      getGrade(id) {
        this.grades = [],
        this.dataForm.surverId = id || 0
        if (this.dataForm.surverId) {
          this.$http({
            url: this.$http.adornUrl(`/surveys/oesevaluationgrade/info/${this.dataForm.surverId}`),
            method: 'get',
          }).then(({data}) => {
            if (data && data.code === 0 && data.oesevaluationgrade != null) {
              this.grades = data.oesevaluationgrade
            }
          })
        }
      },
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit() {
        //封装参数
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$refs['evaluationForm'].validate((valid) => {
              if (valid) {
                this.$http({
                  url: this.$http.adornUrl(`/surveys/oesevaluation/${!this.dataForm.id ? 'save' : 'update'}`),
                  method: 'post',
                  data: this.$http.adornData({
                    'id': this.dataForm.id || undefined,
                    'surverId': this.dataForm.surverId,
                    'evaluationName': this.dataForm.evaluationName,
                    'evaluationGroupForms': this.evaluationForm.domains,
                    'createTime': this.dataForm.id?this.dataForm.createTime:this.format(new Date),
                    'updateTime': this.format(new Date),
                    'remark': this.dataForm.remark
                  })
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.$message({
                      message: data.msg||'操作成功',
                      type: 'success',
                      duration: 500,
                      onClose: () => {
                        this.dialogHandleClose()
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
        })
      },
      dialogHandleClose() {
        this.visible = false;
        this.evaluationForm.domains = []
        this.$refs['dataForm'].resetFields()
      }
    }
  }
</script>


