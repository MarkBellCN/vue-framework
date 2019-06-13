<template>
<div id="login">
  <div class="login-box">
        <h1>YueTai VUE FrameWork V.1.0</h1>
        <el-form :label-position="'left'" :model="loginForm" class="login-from" status-icon :rules="rules" ref="loginForm" label-width="0px">
            <el-form-item label="" prop="userName">
                <el-input type="text" prefix-icon="fa fa-user-circle-o" placeholder="请输入用户名" v-model.trim="loginForm.userName" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="" prop="password">
                <el-input type="password" prefix-icon="fa fa-key" placeholder="请输入密码"  v-model.trim="loginForm.password" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="" prop="verification">
                <el-input placeholder="请输验证码" prefix-icon="fa fa-code" v-model.trim="loginForm.verification">
                    <template slot="append"><img src="http://www.pdsti.cn/u/cms/www/201509/071018298f34.jpg"/></template>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button class="login-but" type="primary" @click="submitForm('loginForm')">登录</el-button>
            </el-form-item>
        </el-form>
        <p id="footer">Author:YueTai frontend team XlChao</p>
  </div>
</div>
</template>

<script>
  import {formCheck} from "../../config/utils";
  export default {
    data() {
        return {
            loginForm: {
                userName: '',
                password: '',
                verification:''
            },
            rules: {
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' },
                ],
                userName: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' },
                ],
                verification:[
                    {required: true, message: '验证码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        /**
         * 获取表单内容
         * @param formName Object 表单数据对象
         */
        submitForm(formName) {
            let flag = formCheck(this, 'loginForm');
            if (!flag) {
                return;
            };
            this.$refs[formName].validate((valid) => {
            if (valid) {
                    localStorage.setItem('token','随便写的token');
                    this.$router.push('/')
                } else {
                    return false;
                }
            });
        },
        /**
         * 获取token
         */
        getToken(){
            let token = localStorage.getItem("token")
            return token
        }
    },
    mounted(){
        //如果登陆后还访问登录页面那么验证token的真实性，这里只是随便写了个token是否存在。
        if(this.getToken()){
            this.$router.push('/')
        }
    }
  }
</script>
<style lang="less">
    #login{
        height: 100%;
        position:absolute;
        width: 100%;
        background:linear-gradient( 45deg, rgb(5, 126, 255), rgb(0, 255, 200));
        .login-box{
            width: 320px;
            height: 350px;
            position:absolute;
            left: 50%;
            top: 50%;
            padding: 20px;
            transform: translate(-50%,-50%);
            background-color: #fff;
            border-radius: 2px;
            box-shadow: 0 8px 28px rgba(5, 126, 255,.3);
            h1{
                width: 100%;
                font-size: 18px;
                padding: 10px 0;
                border-bottom: 2px solid rgb(5, 126, 255)
            }
        }
        .login-from{
            margin-top: 20px;
            .login-but{
                width: 100%;
                margin-top: 30px;
                box-shadow: 0 5px 20px rgba(5, 126, 255,.3);
            }
        }
        #footer{
            padding: 2px 0;
            font-size: 12px;
            color:#999;
        }
        .el-input-group__append{
            padding: 0;
        }
        .el-input-group__append img{
            width: 80px;
            height: 35px;
        }
    }
</style>