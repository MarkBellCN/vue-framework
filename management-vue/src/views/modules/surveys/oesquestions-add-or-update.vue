<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属测评表" prop="evaluationId">
            <el-select disabled v-model="dataForm.evaluationId" filterable placeholder="请选择">
              <el-option
                v-for="item in evaluationList"
                :key="item.id"
                :label="item.evaluationName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选项类型" prop="type">
            <el-select v-model="dataForm.type" @change="changeTabs()" filterable placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="选题描述" prop="questionName">
        <el-input v-model="dataForm.questionName" placeholder="选题描述" maxlength="50"></el-input>
      </el-form-item>
      <el-form-item label="上级选题" prop="parentName">
        <el-popover
          :disabled="oesEvaluation.type==1?true:false"
          ref="questionListPopover"
          placement="bottom-start"
          trigger="click">
          <el-tree
            :data="questionList"
            :props="questionListTreeProps"
            node-key="id"
            ref="questionListTree"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="questionListTreeCurrentChangeHandle">
            <div class="custom-tree-node" slot-scope="{ node, data }"
                 :class="(node.data.hasOwnProperty('disabled') && node.data.disabled) ? 'node-disabled' : ''">
              <div>{{ node.data.questionName }}</div>
            </div>
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:questionListPopover :disabled="oesEvaluation.type==1?true:false" :readonly="true" placeholder="点击选择上级选题"
                  class="menu-list__input"></el-input>
      </el-form-item>
      <el-form-item label="参考准则" prop="questionDesc">
        <el-input type="textarea" :rows="4" v-model="dataForm.questionDesc" placeholder="选题参考准则"
                  maxlength="255"></el-input>
      </el-form-item>
      <el-form-item label="选项设置">
        <el-tabs v-model="activeName" @tab-click="handleClick" type="border-card">
          <el-tab-pane name="1" label="单选题">
            <el-row :gutter="20" :lable="'选项设置'" v-if="dataForm.type==1">
              <el-form-item :span="20" label="单选模板组">
                <el-select v-model="radioGroup" @change="chooseRadioTemp()" clearable filterable placeholder="请选择">
                  <el-option
                    v-for="item in radioList"
                    :key="item.id"
                    :label="item.radioName"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button round @click="addDomain">增加选项</el-button>
              </el-form-item>
              <div v-for="(domain, index) in dataForm.domains">
                <el-col :span="20">
                  <el-form-item style="margin-bottom: 22px" :label="'选项' + (index+1)"
                                :prop="'domains.' + index + '.radio'">
                    <el-input maxlength="20" placeholder="单选" v-model="domain.radio"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button @click.prevent="removeDomain(domain)">删除</el-button>
                </el-col>
              </div>
            </el-row>
          </el-tab-pane>
          <el-tab-pane name="2" label="多选题">
            <el-row v-if="dataForm.type==2" :gutter="20" :lable="'选项设置'">
              <el-form-item>
                <el-button round @click="addDomain">增加选项</el-button>
              </el-form-item>
              <div v-for="(domain, index) in dataForm.domains">
                <el-col :span="20">
                  <el-form-item style="margin-bottom: 22px" :label="'选项' + (index+1)"
                                :prop="'domains.' + index + '.checkbox'">
                    <el-input maxlength="20" placeholder="多选" v-model="domain.checkbox"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button @click.prevent="removeDomain(domain)">删除</el-button>
                </el-col>
              </div>
            </el-row>
          </el-tab-pane>
          <el-tab-pane name="3" label="判断题">
            <template>
              <el-radio-group v-model="judge">
                <el-radio label='正确'>正确</el-radio>
                <el-radio label='错误'>错误</el-radio>
              </el-radio-group>
            </template>
          </el-tab-pane>
          <el-tab-pane name="4" label="打分题">
            <el-form-item v-if="dataForm.type==4" style="margin-bottom: 22px" label="最高分" prop="score">
              <el-input-number placeholder="最高分" v-model="dataForm.score" :max="100"></el-input-number>
            </el-form-item>
            <el-form-item v-if="dataForm.type==4" style="margin-bottom: 22px" label="默认值" prop="scoreDefult">
              <el-input-number v-model="dataForm.scoreDefult" :max="100" placeholder="默认值"></el-input-number>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序号" prop="orderNum">
            <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0"
                             label="排序号"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" maxlength="50"></el-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import {treeDataTranslate, disableTreeByPid} from '@/utils'
  import {dateFormat, isEmpty} from "../../../utils/validate"

  export default {
    data() {
      var validateType = (rule, value, callback) => {
        let type = this.dataForm.type
        if (isEmpty(type)) {
          callback(new Error('选项类型不能为空'))
        } else {
          callback()
        }
      }
      var validateScore = (rule, value, callback) => {
        if (value > this.dataForm.score) {
          callback(new Error('默认值不能大于最大值'));
        } else {
          callback();
        }
      };
      return {
        visible: false,
        radio: '',
        activeName: '1',
        answer: '',
        oesEvaluation:{},
        judge: '',
        evaluationList: [],
        radioList: [],
        radioGroup: '',
        radioDefult: '',
        checkboxDefult: [],
        judgeDefult: '',
        options: [{
          value: '1',
          label: '单选题'
        }, {
          value: '2',
          label: '多选题'
        }, {
          value: '3',
          label: '判断题'
        }, {
          value: '4',
          label: '打分'
        }],
        dataForm: {
          id: 0,
          parentId: 0,
          parentName: '',
          evaluationId: '',
          questionName: '',
          questionDesc: '',
          type: '1',
          score: '',
          scoreDefult: '',
          orderNum: 0,
          createTime: '',
          updateTime: '',
          remark: '',
          answerDefult: '',
          domains: []
        },
        dataRule: {
          questionName: [
            {required: true, message: '选题名称不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_,.;?!\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线,.;?!',
              trigger: 'blur'
            }
          ],
          parentName: [
            {required: true, message: '上级选题不能为空', trigger: 'change'}
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_,.;?!\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线,.;?!',
              trigger: 'blur'
            }
          ],
          score: [
            {required: true, message: '最高分不能为空', trigger: 'blur'},
          ],
          scoreDefult: [
            {validator: validateScore, trigger: 'blur'},
          ],
          domains: []
        },

        questionList: [],
        questionListTemp: [],
        questionListTreeProps: {
          label: 'questionName',
          children: 'children'
        }
      }
    },
    methods: {
      init(id, evalId) {
        this.dataForm.id = id || 0
        this.activeName = '1'
        this.getRadioTempList()
        this.$http({
          url: this.$http.adornUrl(`/surveys/oesevaluation/info/${evalId}`),
          method: 'get',
        }).then(({data}) => {
          this.oesEvaluation= data.oesevaluation
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/surveys/oesquestions/select'),
            method: 'get',
            params: this.$http.adornParams({
              'evaluationId': evalId
            })
          }).then(({data}) => {
            this.questionListTemp = treeDataTranslate(data.questionList, 'id')
          }).then(() => {
            this.getEvaluationList()
            this.visible = true
            if (!this.dataForm.id) {
              // 新增
              this.radioDefult = ''
              this.dataForm.evaluationId = evalId
              this.questionList = this.questionListTemp;
              this.$nextTick(() => {
                this.questionListTreeSetCurrentNode()
              })
            } else {
              // 修改
              this.$http({
                url: this.$http.adornUrl(`/surveys/oesquestions/info/${this.dataForm.id}`),
                method: 'get',
                params: this.$http.adornParams()
              }).then(({data}) => {
                if (data && data.code === 0) {
                  this.dataForm.parentId = data.oesquestions.parentId
                  this.dataForm.evaluationId = data.oesquestions.evaluationId
                  this.dataForm.questionName = data.oesquestions.questionName
                  this.dataForm.questionDesc = data.oesquestions.questionDesc
                  this.dataForm.orderNum = data.oesquestions.orderNum
                  this.dataForm.createTime = data.oesquestions.createTime
                  this.dataForm.updateTime = data.oesquestions.updateTime
                  this.dataForm.remark = data.oesquestions.remark
                  if (data.oesquestions.answerDesc && data.oesquestions.type) {
                    this.dataForm.type = data.oesquestions.type.toString()
                    this.activeName = data.oesquestions.type.toString()
                    if (data.oesquestions.answerDesc && data.oesquestions.type === 1) {
                      let answers = data.oesquestions.answerDesc.split(",")
                      for (let i of answers) {
                        let obj = {
                          radio: i,
                          key: Date.now()
                        }
                        this.addDomain(obj)

                      }
                      this.radioDefult = ''
                      let index = answers.indexOf(data.oesquestions.answerDefult)
                      this.radioDefult = index
                    } else if (data.oesquestions.answerDesc && data.oesquestions.type === 2) {
                      let answers = data.oesquestions.answerDesc.split(",")
                      for (let i of answers) {
                        let obj = {
                          checkbox: i,
                          key: Date.now()
                        }
                        this.addDomain(obj)
                      }
                      if(data.oesquestions.answerDefult){
                        let defArr = data.oesquestions.answerDefult.split(',')
                        this.checkboxDefult = []
                        defArr.forEach(element => {
                          let index = data.oesquestions.answerDesc.split(",").indexOf(element)
                          this.checkboxDefult.push(index)
                        });
                      }
                    } else if (data.oesquestions.answerDesc && data.oesquestions.type === 3) {
                      this.judge = data.oesquestions.answerDesc
                      let index = data.oesquestions.answerDefult
                      this.judge = index
                    } else {
                      this.dataForm.score = data.oesquestions.answerDesc
                      this.dataForm.scoreDefult = data.oesquestions.answerDefult
                    }
                  }
                  disableTreeByPid(this.questionListTemp, this.dataForm.id)
                  this.questionList = this.questionListTemp;
                  this.$nextTick(() => {
                    this.questionListTreeSetCurrentNode()
                  })
                }
              })
            }
          })
        })
      },
      /**
       * 删除一条选项设置
       */
      removeDomain(item) {
        var index = this.dataForm.domains.indexOf(item);
        if (index !== -1) {
          this.dataRule.domains.splice(index, 1);
          this.dataForm.domains.splice(index, 1);
        }
      },
      /**
       * 新增一条选项设置
       */
      addDomain(obj) {
        if (this.dataForm.domains.length > 9) {
          this.$message({
            message: '最多是十选项',
            type: 'info',
          })
          return;
        }
        this.dataRule.domains.push({
          radio: [
            {required: true, message: '选项不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_,.;?!\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线,.;?!',
              trigger: 'blur'
            }
          ],
          checkbox: [
            {required: true, message: '选项不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_,.;?!\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线,.;?!',
              trigger: 'blur'
            }
          ]
        })
        if (obj) {
          this.dataForm.domains.push(obj);
        } else {
          this.dataForm.domains.push({
            radio: '',
            checkbox: '',
            key: Date.now()
          });
        }
      },
      // 菜单树选中
      questionListTreeCurrentChangeHandle(data, node) {
        if (data.disabled) {
          return;
        }
        this.dataForm.parentId = data.id
        this.dataForm.parentName = data.questionName
      },
      // 菜单树设置当前选中节点
      questionListTreeSetCurrentNode() {
        this.$refs.questionListTree.setCurrentKey(this.dataForm.parentId)
        this.dataForm.parentName = (this.$refs.questionListTree.getCurrentNode() || {})['questionName']
      },
      //点击切换tabs 并改变下拉框
      handleClick(tab, event) {
        this.dataForm.type = this.activeName
      },
      //下拉框改变tabs
      changeTabs() {
        this.activeName = this.dataForm.type
      },
      //获取测评表列表
      getEvaluationList() {
        this.$http({
          url: this.$http.adornUrl('/surveys/oesevaluation/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.evaluationList = data.evaluationList;
        })
      },
      // 获取单选模板列表
      getRadioTempList() {
        this.$http({
          url: this.$http.adornUrl('/surveys/tempradio/list'),
          method: 'get',

        }).then(({data}) => {
          this.radioList = data.page.list
        })
      },
      //选择单选模板中单选 选项
      chooseRadioTemp() {
        this.dataForm.domains = []
        let radioId = this.radioGroup
        if (this.radioGroup) {
          this.radioList.forEach(i => {
            if (radioId == i.id) {
              let answers = i.radioDesc.split(",")
              for (let i of answers) {
                let obj = {
                  radio: i,
                  key: Date.now()
                }
                this.addDomain(obj)
              }
            }
          });
        }
      },
      format(val) {
        return dateFormat(val);
      },
      // 表单提交
      dataFormSubmit() {
        this.answer = ''
        if (this.dataForm.type === '1') {
          if (this.dataForm.domains.length <= 0) {
            this.$message.error("单选题必须添加选项")
            return;
          }
          for (let index = 0; index < this.dataForm.domains.length; index++) {
            this.answer += this.dataForm.domains[index].radio + ','
            if (this.radioDefult && this.radioDefult === index) {
              this.dataForm.answerDefult = this.dataForm.domains[index].radio
            }
          }
          this.answer = this.answer.substring(0, this.answer.length - 1)
        } else if (this.dataForm.type === '2') {
          if (this.dataForm.domains.length <= 0) {
            this.$message.error("多选题必须添加选项")
            return;
          }
          for (let index = 0; index < this.dataForm.domains.length; index++) {
            this.answer += this.dataForm.domains[index].checkbox + ','
            if (this.checkboxDefult.length > 0) {
              for (let cb of this.checkboxDefult) {
                if (cb === index) {
                  this.dataForm.answerDefult += this.dataForm.domains[index].checkbox + ','
                }
              }
            }
          }
          this.dataForm.answerDefult = this.dataForm.answerDefult.substring(0, this.dataForm.answerDefult.length - 1)
          this.answer = this.answer.substring(0, this.answer.length - 1)
        } else if (this.dataForm.type === '3') {
          this.answer = "正确,错误"
          if (this.judge) {
            this.dataForm.answerDefult = this.judge
          }
        } else {
          debugger;
          this.answer = this.dataForm.score
          if (this.dataForm.scoreDefult) {
            this.dataForm.answerDefult = this.dataForm.scoreDefult
          }
        }
        if (this.answer === "") {
          this.dataForm.type = '',
            this.dataForm.answerDefult = ''
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oesquestions/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'parentId': this.dataForm.parentId,
                'evaluationId': this.dataForm.evaluationId,
                'questionName': this.dataForm.questionName,
                'questionDesc': this.dataForm.questionDesc,
                'orderNum': this.dataForm.orderNum,
                'createTime': this.dataForm.id ? this.dataForm.createTime : this.format(new Date),
                'updateTime': this.format(new Date),
                'answerDesc': this.answer,
                'type': this.dataForm.type,
                'remark': this.dataForm.remark,
                'answerDefult': this.dataForm.answerDefult
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
        this.$refs['dataForm'].resetFields()
        this.dataForm.parentId = 0
        this.dataForm.domains = []
        this.radioDefult = '';
        this.checkboxDefult = [];
        this.judgeDefult = '';
        this.scoreDefult = '';
        this.dataForm.answerDefult = '';
        this.radioGroup = '';
        this.score = '';
        this.visible = false;
      }
    },
  }
</script>

<style>
  .node-disabled {
    cursor: not-allowed;
  }
</style>

