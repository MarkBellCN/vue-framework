<template>

<el-dialog
  title="预览测评表"
  :close-on-click-modal="false"
  :before-close="handleClose"
  width="50%"
  :visible.sync="visible">
    <el-row >
      <el-col :span="24">
        <div class="grid-content">{{evalName}}</div>
      </el-col>
    </el-row>
    <template v-if="evaluation.type==0">
      <div v-loading="isloading" element-loading-text="正在努力加载中..."></div>
      <div v-if="!isloading">
        <div v-if="questions==null||questions.length<=0||members==null||members.length<=0">
          暂无测评选题
        </div>
        <div v-else>
          <el-table
            :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
            :max-height="tableHeight"
            border
            style="width: 100%">
            <el-table-column prop="memberName" fixed width="150" label="姓名">
            </el-table-column>
            <oescolunm ref="oescolunm" :items="tableHeader"></oescolunm>
          </el-table>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pagesizes"
            :page-size="pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.length">
          </el-pagination>
        </div>
      </div>
    </template>
    <template v-if="evaluation.type==1">
      <div v-loading="isloading" element-loading-text="正在努力加载中..."></div>
      <div v-if="!isloading">
        <div v-if="questions==null||questions.length<=0">
          暂无测评选题
        </div>
        <div v-else>
          <div v-for="item in questions">
            <div>{{item.questionName}}</div>
            <div>
              <!--单选题 start-->
              <el-radio-group v-if="item.type===1">
                <template v-for="itemRadio in item.oesAnswers">
                  <el-radio disabled  :label="itemRadio.answerDesc">
                    {{itemRadio.answerDesc}}
                  </el-radio>
                </template>
              </el-radio-group>
              <!--单选题 end-->
              <!--多选题 start-->
              <el-checkbox-group v-if="item.type===2">
                <template v-for="itemCheck in item.oesAnswers">
                  <el-checkbox disabled :label="itemCheck.answerDesc" :key="itemCheck.id"></el-checkbox>
                </template>
              </el-checkbox-group>
              <!--多选题 end-->
              <!--判断题 start-->
              <el-radio-group v-if="item.type===3">
                <template v-for="itemRadio in item.oesAnswers">
                  <el-radio :label="itemRadio.answerDesc">
                    {{itemRadio.answerDesc}}
                  </el-radio>
                </template>
              </el-radio-group>
              <!--判断题 end-->
              <!--打分题 start-->
              <el-select disabled v-if="item.type===4" placeholder="请选择">
                <el-option
                  v-for="option in parseInt(item.oesAnswers[0].answerDesc)"
                  :key="option"
                  :label="option+'分'"
                  :value="option">
                </el-option>
              </el-select>
              <!--打分题 end-->
            </div>
          </div>
        </div>
      </div>
    </template>
  <span slot="footer" class="dialog-footer">
    <el-button @click="handleClose">取消</el-button>
  </span>
</el-dialog>

</template>

<script>
  import {oesFormData} from '@/utils'
  import oescolunm from './column'
  export default {
    name:'preview',
    data () {
      return {
        currentPage: 1,
        pagesizes: [10, 20,50],
        pagesize: 10,
        evaluation:false,
        visible:false,
        isloading:true,//数据是否加载完成
        questions: [],//所有的问题
        members:[],//所有的测评对象
        answers:[],//所有供选择的答案
        tableHeight:(window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)-440,//表格高度
        tableHeader:null,//表头数据
        tableData: [],//表格数据
        evalName: '',
      }
    },
    components: {
      oescolunm
    },
    methods: {
      handleSizeChange: function (size) {
        this.pagesize = size
      },
      handleCurrentChange: function (currentPage) {
        this.currentPage = currentPage
      },
      init (data) {
        this.evaluation=data;
        this.visible=true;
        this.getQuestionsByEvaluation(this.evaluation.id);
      },
      /**
       * 根据编号加载测评数据
       * @param item
       */
      getQuestionsByEvaluation(item) {
        this.isloading=true;
        this.$http({
          url: this.$http.adornUrl('/surveys/oesevaluation/preview'),
          method: 'post',
          data:{id:item}
        }).then(({data}) => {
          if(this.evaluation.type==1){
            //初始化列表
            this.initOesPriviewList(data);
          }else if(this.evaluation.type==0){
            //初始化表格
            this.initOesPriviewTable(data);
          }
          this.isloading=false;
        })
      },
      //组织列表数据，没有测评对象，type=1
      initOesPriviewList(data){
        if(data.questions&&data.questions.length>0){
          data.questions.forEach(data=>{
            if(data.childrens&&data.childrens.length>0){
              this.findChildrenByList(data.childrens);
            }else{
              if(data.oesAnswers&&data.oesAnswers.length>0){
                this.questions.push(data);
              }
            }
          })
        }
      },
      //组织表格数据，有测评对象，type=0
      initOesPriviewTable(data){
        let tableHeader=[];
        this.questions = data.questions
        this.members = data.members
        /**
         *  组织表头数据
         *  表头是多级表头，有childrens的是有子标题的
         */
        this.questions.forEach(data=>{
          let header={}
          header.name=data.questionName;
          header.desc=data.questionName;
          header.prop='questions'+data.id;

          header.children=[];
          if(data.childrens&&data.childrens.length>0){
            this.findChildrenByTable(data.childrens,header);
          }else{
            if(data.oesAnswers&&data.oesAnswers.length>0){
              let answers={}
              answers['questions'+data.id]=data.oesAnswers;
              this.answers.push(answers);
              header.answersConut=data.oesAnswers.length;
              //根据内容和类型计算单元格宽度
              header.type=data.oesAnswers[0].type;
              header.maxFontLength=0;
              data.oesAnswers.forEach(ans=>{
                if(ans.answerDesc.length>header.maxFontLength){
                  header.maxFontLength=ans.answerDesc.length;
                }
              })
            }
          }
          tableHeader.push(header);
        })
        /**
         * 组织列表数据
         * formDataKey是列表v-model绑定的key，对应formData中的数据。m是测评对象的编号，q是问题的编号，t是问题的类型
         */
        this.members.forEach(data=>{
          let tableData={};
          this.answers.forEach(ans=>{
            tableData.memberId=data.id;
            tableData.memberName=data.memberName;
            for(let key in ans){
              tableData[key]={};
              tableData[key].data=ans[key];
              tableData[key].type=ans[key][0].type
              tableData[key].formDataKey=['m'+data.id+'q'+ans[key][0].questionId+'t'+ans[key][0].type]
              this.initOesFormData(key,data,ans);
            }
          })
          this.tableData.push(tableData);
        })
        this.tableHeader=tableHeader;
      },
      //初始化formData数据
      //oesFormData数据格式 m是测评对象的编号，q是问题的编号，t是问题的类型
      initOesFormData(key,data,ans){
        if(ans[key][0].type==1){
          oesFormData['m'+data.id+'q'+ans[key][0].questionId+'t'+ans[key][0].type]='';
        }else if(ans[key][0].type==2){
          oesFormData['m'+data.id+'q'+ans[key][0].questionId+'t'+ans[key][0].type]=new Array();
        }else if(ans[key][0].type==3){
          oesFormData['m'+data.id+'q'+ans[key][0].questionId+'t'+ans[key][0].type]=null;
        }else if(ans[key][0].type==4){
          oesFormData['m'+data.id+'q'+ans[key][0].questionId+'t'+ans[key][0].type]=ans[key][0].isDefult;
        }
      },
      findChildrenByList(data){
        if(data.childrens&&data.childrens.length>0){
          this.findChildrenByList(data.childrens);
        }else{
          if(data.oesAnswers&&data.oesAnswers.length>0){
            this.questions.push(data);
          }
        }
      },
      /**
       *  组织表头数据
       *  表头是多级表头，有childrens的是有子标题的
       */
      findChildrenByTable(childrens,header){
        childrens.forEach(data=>{
          let childrensHeader={};
          childrensHeader.name=data.questionName;
          childrensHeader.desc=data.questionName;
          childrensHeader.prop='questions'+data.id;
          childrensHeader.children=[];
          if(data.childrens&&data.childrens.length>0){
            this.findChildrenByTable(data.childrens,childrensHeader);
          }else{
            if(data.oesAnswers&&data.oesAnswers.length>0){
              let answers={}
              answers['questions'+data.id]=data.oesAnswers;
              this.answers.push(answers);
              childrensHeader.answersConut=data.oesAnswers.length;
              //根据内容和类型计算单元格宽度
              childrensHeader.type=data.oesAnswers[0].type;
              childrensHeader.maxFontLength=0;
              data.oesAnswers.forEach(ans=>{
                if(ans.answerDesc.length>childrensHeader.maxFontLength){
                  childrensHeader.maxFontLength=ans.answerDesc.length;
                }
              })
            }
          }
          header.children.push(childrensHeader);
        })
      },
      handleClose(){
        this.visible=false;
        this.$emit("priviewClose",false);
      }
    }
  }
</script>
<style lang="scss">
  .bg-purple-dark {
    background: #99a9bf;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
    text-align: center;
    font-size: 20px;
    margin: 15px;
  }

  .previewForm {
    margin-left: 50px
  }

  .el-table td, .el-table th {
    padding: 3px 20px;
  }

  .el-table .warning-row td:first-child {
    border-top: 1px solid red;
    border-bottom: 1px solid red;
    border-left: 1px solid red;
  }

  .el-table .warning-row td:not:first-child {
    border-top: 1px solid red;
    border-bottom: 1px solid red;
  }

  .el-table .warning-row td:last-child {
    border-top: 1px solid red;
    border-bottom: 1px solid red;
    border-right: 1px solid red;
  }

  .el-table .warning-row td {
    border-top: 1px solid red;
    border-bottom: 1px solid red;
  }

  .el-table .el-radio {
    margin: 10px 0;
    display: block;
  }
  .el-table .el-radio+.el-radio {
    margin-left: 0px;
  }

  .el-table .el-form-item {
    margin-bottom: 0px;
  }
  .el-table .el-form-item__content {
    text-align: left;
  }
  .el-table .el-checkbox {
    margin: 10px 0;
    display: block;
  }
  .el-table .el-checkbox+.el-checkbox {
    margin-left: 0px;
  }
</style>
