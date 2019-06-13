<template>
  <el-dialog
    title="导入"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
  <div class="dialog__body">
    <div class="upload__content">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm">
        <el-form-item label="上级单位部门" prop="departmentId">
          <el-select filterable clearable  placeholder="请选择" v-model="dataForm.departmentId" >
            <el-option
              v-for="item in deptList"
              :key="item.id"
              :label="item.departmentName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
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
        <a href="./static/excelTemp/department-temp.xlsx" download="单位部门模板"><el-button size="small" type="success">下载模板</el-button></a>
        <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过5MB</div>
        <div slot="tip" class="el-upload-list__item-name">{{fileName}}</div>
      </el-upload>
    </div>
  </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitUpload()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        deptList: '',
        dataForm: {
          departmentId:''
        },
        dataRule: {
          departmentId: [
            {required: true, message: '单位部门不能为空', trigger: 'change'},
          ],
        },
        files:"",
        fileName: '',
        fileList: [],
        url: '',
        num: 0,
        successNum: 0,
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.getDeptList()
      },
      //获取单位部门列表
      getDeptList(){
          this.$http({
          url: this.$http.adornUrl('/surveys/oesdepartment/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.deptList =data.deptList
        });
      },
      submitUpload() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if(this.fileName == ""){
              this.$message.warning('请选择要上传的文件！')
              return false
            }
            let fileFormData = new FormData();
            fileFormData.append('file', this.files, this.fileName);
            let requestConfig = {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
            }
            this.$http.post(this.$http.adornUrl(`/surveys/oesdepartment/import?departmentId=`+this.dataForm.departmentId), fileFormData, requestConfig).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.handleClose()
                    this.$emit('refreshDataList')
                  }
                })
              } else if(data.code === -1){
                this.$message.warning(data.msg)
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      // 上传前对文件的大小的判断
      beforeUpload(file){
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
      handleClose() {
        this.visible = false;
        this.fileList=[];
        this.fileName='';
        this.files='';
        this.url='';
        this.departmentId='';
        this.$refs['dataForm'].resetFields()

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
