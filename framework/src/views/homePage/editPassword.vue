<!--默认显示首页内容-->
<template>
    <el-dialog title="修改密码" :close-on-click-modal='false' :visible.sync="passBoxBoole" width="600px" @close="handleClose('ruleForm')">
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item label="旧密码" prop="oldPass">
                <el-input type="password" v-model.trim="ruleForm.oldPass" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPass">
                <el-input type="password" v-model.trim="ruleForm.newPass" auto-complete="off" placeholder="请输入6-16位数字或字母"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
                <el-input type="password" v-model.trim="ruleForm.checkPass" auto-complete="off"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose('ruleForm')">取 消</el-button>
            <el-button type="primary" @click="updatePass">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
  import {mapState,mapMutations} from 'vuex';
  import {formCheck,trim} from "../../config/utils";
  export default {
    props:{
        passBox:Boolean,
    },
    data() {
        //密码校验
        const checkNewPass = (rule, value, callback) => {
            let reg = /^[0-9a-zA-Z]{6,16}$/;
            let str = trim(value);
            if (value === '') {
                callback(new Error('请输入新密码'));
            }else if (!reg.test(str)) {
                return callback(new Error("密码格式不正确"));
            }else{
                callback();
            }
        };
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.ruleForm.newPass) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            ruleForm: {
                oldPass: '',
                newPass: '',
                checkPass: '',
            },
            passBoxBoole:false,
            rules: {
                oldPass: [{
                    required: true,
                    message: '请输入旧密码',
                    trigger: 'blur'
                    },{
                    min: 6,
                    max: 16,
                    message: '密码长度不大于15个字符',
                    trigger: 'blur'
                    }],
                newPass: [{
                    required: true,
                    validator: checkNewPass,
                    trigger: 'blur'
                    }],
                checkPass: [{
                    required: true,
                    validator: validatePass2,
                    trigger: 'blur'
                }],
            }
        }
    },
    methods:{
        async updatePass() {
            let flag = formCheck(this, 'ruleForm');
            if (!flag) {
                return;
            }
            let param = {
                newPassword: this.ruleForm.newPass,
                oldPassword: this.ruleForm.oldPass
            };
            if (param.newPassword === param.oldPassword) {
                this.$message({
                    type: 'warning',
                    message: '新旧密码不能相同,请重新输入'
                });
                return;
            }else{
                console.log(param)
                this.$emit('closeBox',false)
            }
        },
        handleClose(formName) {
            this.$emit('closeBox',false)
            this.$refs[formName].resetFields();
        },
    },
    watch:{
       passBox(n,o){
           this.passBoxBoole = n;
       } 
    }
  }
</script>
<style lang="less">
    #editPassword{
        
    }
</style>