<template>
  <el-dialog
    title="导入"
    :close-on-click-modal="false"
    @close="closeHandle"
    :visible.sync="visible">
  <div class="dialog__body">
    <div class="upload__content">
      <span class="upload_lable">企业</span>
      <el-select filterable placeholder="请选择" v-model="company" >
        <el-option
          v-for="item in companies"
          :key="item.id"
          :label="item.companyName"
          :value="item.id">
        </el-option>
      </el-select>
    </div><br>

    <div class="upload__content">
      <span class="upload_lable">上传文件</span>
      <el-upload
        class="upload-demo"
        ref="upload"
        action="doUpload"
        :limit="1"
        :file-list="fileList"
        :before-upload="beforeUpload">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <a href="./static/moban.xlsx" download="模板"><el-button size="small" type="success">下载模板</el-button></a>
        <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
        <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过5MB</div>
        <div slot="tip" class="el-upload-list__item-name">{{fileName}}</div>
      </el-upload>
    </div>
  </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitUpload()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    props: {
      companies: {
        type: Array
      }
    },
    data () {
      return {
        visible: false,
        files:"",
        fileName: '',
        fileList: [],
        url: '',
        num: 0,
        successNum: 0,
        company: '',
      }
    },
    methods: {
      init (id) {
        // this.url = this.$http.adornUrl(`/sys/oss/upload?token=${this.$cookie.get('token')}`)
        this.visible = true
      },
      submitUpload() {
        console.log('上传'+this.files.name)
        if(this.fileName == ""){
          this.$message.warning('请选择要上传的文件！')
          return false
        }
        let fileFormData = new FormData();
        fileFormData.append('file', this.files, this.fileName);//filename是键，file是值，就是要传的文件，test.zip是要传的文件名
        let requestConfig = {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        }
        this.$http.post(this.$http.adornUrl(`/basedata/oesmembers/upload?companyId=`+this.company), fileFormData, requestConfig).then((res) => {
            if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.$emit('refreshDataList')
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      },
      // 上传前对文件的大小的判断
      beforeUpload(file){
        console.log(file,'文件');
        this.files = file;
        const extension = file.name.split('.')[1] === 'xls'
        const extension2 = file.name.split('.')[1] === 'xlsx'
        const isLt2M = file.size / 1024 / 1024 < 5
        if (!extension && !extension2) {
          this.$message.warning('上传模板只能是 xls、xlsx格式!')
          return
        }
        if (!isLt2M) {
          this.$message.warning('上传模板大小不能超过 5MB!')
          return
        }
        this.fileName = file.name;
        return false // 返回false不会自动上传
      },
      // 弹窗关闭时
      closeHandle () {
        this.fileList = []
        this.$emit('refreshDataList')
      }
    },
    //初始化
    mounted() {
    },
  }
</script>

<style lang="scss">
  .upload_lable {
      text-align: right;
      float: left;
      font-size: 14px;
      color: #606266;
      line-height: 40px;
      padding: 0 12px 0 0;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      margin-bottom: 22px;
      width: 80px;
  }

  .upload__content {
    line-height: 40px;
    position: relative;
    font-size: 14px;
}

.el-dialog__body {
    padding: 30px 20px;
    color: #606266;
    line-height: 24px;
    font-size: 14px;
}

.el-dialog {
    position: relative;
    margin: 0 auto 50px;
    background: #fff;
    border-radius: 2px;
    -webkit-box-shadow: 0 1px 3px rgba(0,0,0,.3);
    box-shadow: 0 1px 3px rgba(0,0,0,.3);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 30%;
}

.el-upload-list__item-name {
    color: #606266;
    display: block;
    margin-right: 40px;
    overflow: hidden;
    padding-left: 4px;
    text-overflow: ellipsis;
    -webkit-transition: color .3s;
    transition: color .3s;
    white-space: nowrap;
    margin-left: 80px;
}

</style>
