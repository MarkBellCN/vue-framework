<template>
  <div class="site-wrapper site-page--login">
    <div class="site-content__wrapper">
      <div class="site-content parent">
        <div class="login-main child" v-bind:style="{width:widthMain}">
          <div class="title0">网上测评系统</div>
          <div class="login-first" ref="loginMain">
            <h3 class="login-title">欢迎登录</h3>
            <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
                     status-icon>
              <el-form-item prop="userName">
                <el-input maxlength="16" v-model="dataForm.userName" autofocus="autofocus" placeholder="帐号"></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input maxlength="18" v-model="dataForm.password" type="password" placeholder="密码"></el-input>
              </el-form-item>
              <el-form-item prop="captcha">
                <el-row :gutter="20">
                  <el-col :span="14">
                    <el-input maxlength="5" v-model="dataForm.captcha" placeholder="验证码">
                    </el-input>
                  </el-col>
                  <el-col :span="10" class="login-captcha">
                    <img :src="captchaPath" @click="getCaptcha()" alt="">
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item>
                <el-button class="login-btn-submit" type="primary" @click="dataFormSubmit()">登录</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import {getUUID} from '@/utils'

  export default {
    data() {
      return {
        widthMain: '',
        dataForm: {
          userName: '',
          password: '',
          uuid: '',
          captcha: ''
        },
        dataRule: {
          userName: [
            {required: true, message: '帐号不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/,
              message: '3-16位字母开头数字下划线',
              trigger: 'blur'
            }
          ],
          password: [
            {required: true, message: '密码不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_]{4,18}$/,
              message: '4-18位数字字母下划线',
              trigger: 'blur'
            }
          ],
          captcha: [
            {required: true, message: '验证码不能为空', trigger: 'blur'},
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9]{5}$/,
              message: '5位数字字母',
              trigger: 'blur'
            }
          ]
        },
        captchaPath: ''
      }
    },
    created() {
      this.getCaptcha()
    },
    mounted() {
      //获取高度值
      var height = this.$refs.loginMain.offsetHeight;
      this.widthMain = height + 'px';
    },
    methods: {
      // 提交表单
      dataFormSubmit() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/sys/login'),
              method: 'post',
              data: this.$http.adornData({
                'username': this.dataForm.userName,
                'password': this.dataForm.password,
                'uuid': this.dataForm.uuid,
                'captcha': this.dataForm.captcha
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$cookie.set('token', data.token)
                this.$router.replace({name: 'home'})
              } else {
                this.getCaptcha()
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      // 获取验证码
      getCaptcha() {
        this.dataForm.uuid = getUUID()
        this.captchaPath = this.$http.adornUrl(`/captcha.jpg?uuid=${this.dataForm.uuid}`)
      },
    }
  }
</script>

<style lang="scss">
  .parent {
    display: table
  }

  .child {
    display: table-cell;
    vertical-align: middle;
  }

  .el-input__inner {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #0a0a0a;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    width: 100%;
  }

  .site-wrapper.site-page--login {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(38, 50, 56, .6);
    overflow: hidden;
    &:before {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: "";
      background-image: url(../../assets/img/login_bg.jpg);
      background-size: cover;
    }
    .site-content__wrapper {
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      bottom: 0;
      left: 0;
      padding: 0;
      margin: 0;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: transparent;
    }
    .site-content {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .brand-info {
      margin: 220px 100px 0 90px;
      color: #fff;
    }
    .title0 {
      left: 0;
      width: 100%;
      text-align: center;
      color: #fff;
      font-size: 40px;
      height: 70px;
      line-height: 70px;
      z-index: 1;
      color: #0BB2D4;
    }
    .brand-info__text {
      margin: 0 0 22px 0;
      font-size: 48px;
      font-weight: 400;
      text-transform: uppercase;
    }
    .brand-info__intro {
      margin: 10px 0;
      font-size: 16px;
      line-height: 1.58;
      opacity: .6;
    }
    .login-main {
      height: 50%;
    }
    .login-first {
      padding: 20px;
      background-color: #111623;
      padding-top: 1px;
      opacity: 0.9
    }
    .login-title {
      font-size: 16px;
      color: #2ec0f6;
      text-align: center;
    }
    .login-captcha {
      overflow: hidden;
      > img {
        width: 100%;
        cursor: pointer;
      }
    }
    .login-btn-submit {
      width: 100%;
      margin-top: 38px;
      background: #2ec0f6;
      border-radius: 6px;
      border: 1px solid #2ec0f6;
    }
  }
</style>
