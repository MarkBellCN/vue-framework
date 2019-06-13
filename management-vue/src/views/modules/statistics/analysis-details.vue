<template>

  <el-dialog
    title="查看详情"
    :before-close="handleClose"
    :close-on-click-modal="false"
    width="50%"
    :visible.sync="visible">
    <el-row type="flex" class="row-bg" justify="end">
      <el-button @click="exportHandle()">导出</el-button>
    </el-row>
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="24"><div class="grid-content bg-purple-light">测评名称：{{surveyName}}</div></el-col>
    </el-row>
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="24"><div class="grid-content bg-purple-light">测评表名称：{{evalName}}</div></el-col>
    </el-row>
    <el-row v-if="dataForm.grade"  type="flex" class="row-bg" justify="space-between">
      <el-col :span="6"><div class="grid-content bg-purple-light">员工层级：{{dataForm.grade}}</div></el-col>
    </el-row>
    <el-row type="flex" class="row-bg" justify="space-between">
      <el-col :span="6"><div class="grid-content bg-purple-light">投票人数：{{votesTotal}}</div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light">有效投票数：{{validTickets}}</div></el-col>
      <el-col :span="6"><div class="grid-content bg-purple-light">弃票人数：{{discardedTickets}}</div></el-col>
    </el-row>
    <div v-loading="!organizingData" element-loading-text="正在努力加载中..."></div>
    <div v-if="organizingData">
      <div v-if="subItemStatisticsSource==null||subItemStatisticsSource.length<=0">
        暂无统计数据
      </div>
      <div v-else>
        <el-table
          :data="subItemStatisticsData"
          style="width: 100%">
          <el-table-column
            prop="memberName"
            label="姓名"
            fixed
            width="100">
          </el-table-column>
          <el-table-column :key="index_q" v-for="(question,index_q) in questionsIds" :label="questions['q'+question]">
            <el-table-column :key="index_r" v-for="(rst,index_r) in questions['r'+question]" :label="(rst=='average'?'平均分':rst)">
              <el-table-column :key="index_g" v-for="(grd,index_g) in grades"
                               :prop="'q'+question+'r'+rst+'g'+grd"
                               :label="grd+'票'"
                               width="60">
                               <template slot-scope="scope">
                                 <span v-if="scope.row['q'+question+'r'+rst+'g'+grd]">{{scope.row['q'+question+'r'+rst+'g'+grd]}}</span>
                                 <span v-else>--</span>
                               </template>
              </el-table-column>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        url: '',
        surveyName: '',
        evalName: '',
        deptName: '',
        votesTotal: '',
        validTickets:'',
        discardedTickets: '',
        organizingData:false,
        subItemStatisticsSource:{},
        memberIds:[],
        questionsIds:[],
        questions:{},
        grades:[],
        subItemStatistics:{},
        subItemStatisticsData:[],
        opinion: '',
        dataForm: {
          surveyId: '',
          evalId: '',
          grade: '',
          type: ''
        },
        dataRule: {},
      }
    },
    methods: {
      init (surveyId,evalId,grade,type) {
        this.organizingData=false;
        this.visible = true
        this.dataForm.surveyId = surveyId
        this.dataForm.evalId = evalId
        this.dataForm.grade = grade
        this.dataForm.type = type
        this.getStatisticsInfo(surveyId,evalId,grade,type)
      },
      getStatisticsInfo(surveyId,evalId,grade){
        this.$http({
          url: this.$http.adornUrl('/statistics/analysis/info'),
          method: 'get',
          params: this.$http.adornParams({
            'surveyId': this.dataForm.surveyId,
            'evalId': this.dataForm.evalId,
            'grade': this.dataForm.grade,
            'type': this.dataForm.type
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.evalName = data.statistics.evalName
            this.surveyName = data.statistics.surveyName
            this.votesTotal = data.statistics.votesTotal
            this.validTickets = data.statistics.validTickets
            this.discardedTickets = data.statistics.discardedTickets
            this.subItemStatisticsSource=data.subItemStatistics
            this.grades=data.grades;
            this.organizingSubItemStatisticsData(data.subItemStatistics)
             this.organizingData=true;
          }else{
            this.organizingData=true;
          }
        })
      },
      organizingSubItemStatisticsData(subItemStatistics){
        if(!subItemStatistics||subItemStatistics.length<=0){
          return;
        }
        subItemStatistics.forEach(ststis=>{
          if(this.memberIds.indexOf(ststis.memberId)<0){
            this.memberIds.push(ststis.memberId)
          }
          if(this.questionsIds.indexOf(ststis.questionId)<0){
            this.questionsIds.push(ststis.questionId)
            this.questions['q'+ststis.questionId]=ststis.questionName

          }
          if(!this.questions['r'+ststis.questionId]){
            this.questions['r'+ststis.questionId]=[];
          }
          if(this.questions['r'+ststis.questionId].indexOf(ststis.result)<0){
            this.questions['r'+ststis.questionId].push(ststis.result)
          }
          if(!this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade]){
            this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade]={}
          }
          this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade].memberName=ststis.memberName
          this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade].result=ststis.result
          if(this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade].statistics){
            let statisticsOld=this.subItemStatistics['m'+ststis.memberId+'r'+ststis.result+'q'+ststis.questionId+'g'+ststis.grade].statistics
            this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade].statistics=parseFloat(statisticsOld)+parseFloat(ststis.statistics);
          }else{
            this.subItemStatistics['m'+ststis.memberId+'q'+ststis.questionId+'r'+ststis.result+'g'+ststis.grade].statistics=ststis.statistics
          }
        })
        this.memberIds.forEach(member=>{
          let statisticsData={};
          this.questionsIds.forEach(quest=>{
            this.questions['r'+quest].forEach(rst=>{
              this.grades.forEach(grd=>{
                if(this.subItemStatistics['m'+member+'q'+quest+'r'+rst+'g'+grd]){
                  statisticsData.memberName=this.subItemStatistics['m'+member+'q'+quest+'r'+rst+'g'+grd].memberName
                  statisticsData['q'+quest+'r'+rst+'g'+grd]=parseFloat(this.subItemStatistics['m'+member+'q'+quest+'r'+rst+'g'+grd].statistics)
                }
              })
            })
          })
          this.subItemStatisticsData.push(statisticsData);
        })
        this.grades=this.grades.sort();
      },
      // 导出
      exportHandle () {
        this.$http({
          url: this.$http.adornUrl('/statistics/analysis/export'),
          method: 'post',
          data: this.$http.adornData({
            "evalName":this.evalName,
            "surveyName":this.surveyName,
            "deptName":this.deptName,
            "votesTotal":this.votesTotal,
            "validTickets":this.validTickets,
            "discardedTickets":this.discardedTickets,
            "memberIds":this.memberIds,
            "questionsIds":this.questionsIds,
            "grades":this.grades,
            "questions":this.questions,
            "subItemStatistics":this.subItemStatistics,
          }),
          responseType: 'blob',
        }).then(res => {
          this.download(res.data)
        });
      },
      download (data) {
        if (!data) {
            return
        }
        let url = window.URL.createObjectURL(new Blob([data]))
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', '分项统计.xls')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link);
      },
      handleClose(){
        this.memberIds=[];
        this.questionsIds=[];
        this.questions={};
        this.grades=[];
        this.subItemStatistics={};
        this.subItemStatisticsData=[];
        this.evalName = '';
        this.surveyName = '';
        this.votesTotal = '';
        this.validTickets = '';
        this.discardedTickets = '';
        this.visible = false;
      }

    },
  }
</script>


<style lang="scss">

.el-row {
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 30px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }

</style>

