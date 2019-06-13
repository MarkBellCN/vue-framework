<template>
  <div>
    <el-dialog
      :title="!dataForm.id ? '新增' : '修改'"
      :close-on-click-modal="false"
      :before-close="handleClose"
      :visible.sync="visible">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
               label-width="120px">
        <el-form-item label="图片" prop="url">
          <el-upload
            :action="fileUploadUrl"
            ref="upload"
            accept="image/jpeg,image/png"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :auto-upload="false"
            :limit=1
            :multiple="false"
            :before-upload="beforeUpload"
            :file-list="fileList"
            :data="picData"
            :on-exceed="handleExceed"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">建议上传高度180px的图片</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <Editor ref="ue" :defaultMsg="dataForm.content||''" :config="config" :ueId="'ue'"/>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contacts">
              <el-input v-model="dataForm.contacts" maxlength="20" placeholder="联系人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="tel">
              <el-input v-model="dataForm.tel" maxlength="13" placeholder="联系电话"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版权所属" prop="copyright">
              <el-input v-model="dataForm.copyright" maxlength="30" placeholder="版权所属"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系地址" prop="address">
              <el-input v-model="dataForm.address" maxlength="30" placeholder="地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dataForm.status"
                active-value='0' active-color="#13ce66"
                inactive-value='1' inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技术支持" prop="techSupport">
              <el-input v-model="dataForm.techSupport" maxlength="30" placeholder="技术支持"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" maxlength="50" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
  import Editor from "../../../components/editor/ue.vue";
  import {dateFormat} from "../../../utils/validate"

  export default {
    components: {
      Editor
    },
    data() {
      return {
        dialogImageUrl: '',
        dialogVisible: false,
        visible: false,
        fileList: [],
        fileUploadUrl: this.$http.adornUrl(`/basedata/oesbanner/upload?token=${this.$cookie.get('token')}`),
        picNames: [],
        picData: {'newName': ''},
        dataForm: {
          id: 0,
          companyId: '',
          url: '',
          status: '0',
          content: '',
          contacts: '',
          tel: '',
          copyright: '',
          address: '',
          techSupport: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          contacts: [
            {required: true, message: '联系人不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          content: [
            {required: true, message: '内容不能为空', trigger: 'blur'},
          ],
          tel: [
            {required: true, message: '联系电话不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^0\d{2,3}-\d{7,8}$|^1[0-9]{10}$/,
              message: '电话号码为029-1234567或1开头的十一位号码',
              trigger: 'blur'
            }
          ],
        },
        config: {
          elementPathEnabled: false,
          autoHeightEnabled: false,
          initialFrameWidth: null,
          initialFrameHeight: 300,
          toolbars: [
            [
              '|', 'undo', 'redo', '|',
              'bold', 'italic', 'underline', 'fontborder', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
              'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
              'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
              'directionalityltr', 'directionalityrtl', 'indent', '|',
              'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
              'horizontal', 'date', 'time'
            ]
          ]
        },
      }
    },
    methods: {
      init(id) {
        this.visible = true
        this.dataForm.id = id || 0
        this.getInfo(this.dataForm.id)
      },

      handleRemove(file, fileList) {
        var picName = file.url.split('?')[0].split('/')[file.url.split('?')[0].split('/').length - 1]
        this.picNames.splice(this.picNames.indexOf(picName), 1)
      },
      beforeUpload(file) {
        var timestamp = new Date().getTime();
        var newName = timestamp + "." + file.name.split('.')[1]
        this.picData.newName = newName;
        this.picNames.push(newName)
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      handleExceed(files, fileList) {
        this.$message.warning(`只能上传一张图片`);
      },
      submitUpload() {
        this.$refs.upload.submit();
      },
      //获取富文本内容
      getUEContent() {
        let content = this.$refs.ue.getUEContent();
        this.dataForm.content = content;
      },
      /**
       * 日期格式化
       */
      format(val) {
        return dateFormat(val);
      },
      //获取详情
      getInfo(id) {
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/basedata/oesbanner/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm = Object.assign({}, data.oesbanner);
                this.dataForm.status = data.oesbanner.status.toString()

                if (data.oesbanner.url != "") {
                  let urlArr = [];
                  urlArr = this.dataForm.url.split(',')
                  this.picNames = []
                  this.fileList = []
                  for (let index = 0; index < urlArr.length; index++) {
                    let fileObj = {};
                    const url = urlArr[index];
                    if (data.oesbanner.url != "") {
                      this.picNames.push(url)
                    }
                    fileObj.name = name;
                    fileObj.url = data.fileBaseUrl + url;
                    this.fileList.push(fileObj)
                  }
                } else {
                  this.picNames = []
                  this.fileList = []
                }
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit() {
        this.submitUpload();
        this.getUEContent();
        if(this.dataForm.content.length>5000){
          this.$message({
            message: '内容长度不能超过5000字符',
            type: 'warn',
          })
          return;
        }
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/basedata/oesbanner/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'companyId': this.dataForm.companyId,
                'url': this.picNames.toString(),
                'status': this.dataForm.status,
                'content': this.dataForm.content,
                'contacts': this.dataForm.contacts,
                'tel': this.dataForm.tel,
                'copyright': this.dataForm.copyright,
                'address': this.dataForm.address,
                'techSupport': this.dataForm.techSupport,
                'createTime': this.dataForm.id ? this.dataForm.createTime : this.format(new Date),
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
        this.$refs.upload.clearFiles()
        this.picNames = []
        this.fileList = []
        this.$refs['dataForm'].resetFields();
      },
    },
    watch: {}
  }
</script>
