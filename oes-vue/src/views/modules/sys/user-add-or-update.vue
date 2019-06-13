<template>
  <el-dialog
    :title="dataForm.userId? '修改' : '新增'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
      <el-form-item label="企业名称" prop="companyId">
        <el-select v-model="dataForm.companyId" filterable clearable placeholder="请选择">
          <el-option
            v-for="item in companies"
            :key="item.id"
            :label="item.companyName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input maxlength="20" v-model="dataForm.name" placeholder="姓名"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input maxlength="16" v-model="dataForm.username" placeholder="登录帐号" :disabled="dataForm.userId?true:false"></el-input>
      </el-form-item>
      <el-form-item v-if="!dataForm.userId" label="密码" prop="password">
        <el-input maxlength="18" v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item v-if="!dataForm.userId" label="确认密码" prop="comfirmPassword">
        <el-input maxlength="18" v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input maxlength="50" v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input maxlength="13" v-model="dataForm.mobile" placeholder="手机号"></el-input>
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIdList">
        <el-checkbox-group v-model="dataForm.roleIdList">
          <el-checkbox v-for="role in roleList" :key="role.roleId" :label="role.roleId">{{ role.roleName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">禁用</el-radio>
          <el-radio :label="1">正常</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isMobile,isUserName, isPwd,isEmpty} from '@/utils/validate'
  export default {
    data () {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('密码不能为空'));
        } else {
          if (this.dataForm.comfirmPassword !== '') {
            this.$refs.dataForm.validateField('comfirmPassword');
          }
          callback();
        }
      };
      var validateComfirmPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('密码不能为空'));
        } else if (value !== this.dataForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        visible: false,
        roleList: [],
        companies: [],
        checked: true,
        dataForm: {
          userId: 0,
          name: '',
          username: '',
          name: '',
          password: '',
          comfirmPassword: '',
          salt: '',
          email: '',
          mobile: '',
          roleIdList: [],
          companyId: '',
          status: 1
        },
        dataRule: {
          companyId: [
            { required: true, message: '企业名称不能为空', trigger: 'change' },
          ],
          name: [
            { required: true, message: '姓名不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          username: [
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/,
              message: '3-16位字母开头数字下划线',
              trigger: 'blur'
            }
          ],
          password: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { validator: validatePass, trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_]{4,18}$/,
              message: '4-18位数字字母下划线',
              trigger: 'blur'
            }
          ],
          comfirmPassword: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { validator: validateComfirmPass, trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_]{4,18}$/,
              message: '4-18位数字字母下划线',
              trigger: 'blur'
            }
          ],
          email: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/,
              message: '邮箱格式如 admin_123@admin_123.com',
              trigger: 'blur'
            }
          ],
          mobile: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^0\d{2,3}-\d{7,8}$|^1[0-9]{10}$/,
              message: '电话号码为029-1234567或1开头的十一位号码',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.companyId = ''
        this.dataForm.userId = id || null
        this.$http({
          url: this.$http.adornUrl('/sys/user/getRoleBySysUser'),
          method: 'post',
          data: this.$http.adornData({
            'userId': this.dataForm.userId
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.roleList=data.roleList||[];
            this.dataForm.roleIdList = data.roleIdList||[]
          }
        }).then(() => {
          this.visible = true
          if (this.dataForm.userId) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/info/${this.dataForm.userId}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.username = data.user.username
                this.dataForm.name = data.user.name
                this.dataForm.salt = data.user.salt
                this.dataForm.email = data.user.email
                this.dataForm.mobile = data.user.mobile
                this.dataForm.status = data.user.status
                this.dataForm.companyId = data.user.companyId
              }
            })
          }
        })
        this.getCompaniesList()
      },

      getCompaniesList(){
        this.$http({
          url: this.$http.adornUrl('/basedata/oescompanies/select'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'key': this.dataForm.key
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.companies = data.companyList
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/${!this.dataForm.userId ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'userId': this.dataForm.userId || undefined,
                'name': this.dataForm.name,
                'companyId': this.dataForm.companyId,
                'username': this.dataForm.username,
                'password': this.dataForm.password,
                'salt': this.dataForm.salt,
                'email': this.dataForm.email,
                'mobile': this.dataForm.mobile,
                'status': this.dataForm.status,
                'roleIdList': this.dataForm.roleIdList
              })
            }).then(({data}) => {
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
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      handleClose() {
        this.$refs['dataForm'].resetFields()
        this.visible=false;
      }
    }

  }
</script>
