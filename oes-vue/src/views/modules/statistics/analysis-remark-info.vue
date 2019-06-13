<template>

  <el-dialog
    title="查看评价"
    :before-close="handleClose"
    :close-on-click-modal="false"
    width="50%"
    :visible.sync="visible">
    <!-- <el-row type="flex" class="row-bg" justify="end">
      <el-button @click="exportHandle()">导出</el-button>
    </el-row> -->
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        prop="loginName"
        header-align="center"
        align="center"
        label="用户名">
      </el-table-column>
      <el-table-column
        prop="remark"
        header-align="center"
        align="center"
        label="评价内容">
      </el-table-column>
    </el-table>
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
        organizingData:false,
        opinion: '',
        dataList: [],
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
        this.dataList=[]
        this.dataForm.surveyId = surveyId
        this.dataForm.evalId = evalId
        this.dataForm.grade = grade
        this.dataForm.type = type
        this.getStatisticsInfo(surveyId,evalId,grade,type)
      },
      getStatisticsInfo(surveyId,evalId,grade){
        this.$http({
          url: this.$http.adornUrl('/statistics/analysis/remarkInfo'),
          method: 'get',
          params: this.$http.adornParams({
            'surveyId': this.dataForm.surveyId,
            'evalId': this.dataForm.evalId,
            'grade': this.dataForm.grade,
            'type': this.dataForm.type
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.organizingData=true;
            this.dataList=data.remarkInfo;
          }else{
            this.organizingData=true;
          }
        })
      },
      // 导出
      exportHandle () {
        this.$http({
          url: this.$http.adornUrl('/statistics/analysis/exportRemarkInfo'),
          method: 'post',
          data: this.$http.adornData({
            'surveyId': this.dataForm.surveyId,
            'evalId': this.dataForm.evalId,
            'grade': this.dataForm.grade,
            'type': this.dataForm.type
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
        this.dataList=[];
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

