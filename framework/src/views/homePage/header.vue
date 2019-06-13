<template>
    <el-header class="c-no-padding c-header" height="53px">
        <EditPassBox @closeBox = "closeBox" :passBox = "passBox"></EditPassBox>
        <!-- this header context -->
        <el-row type="flex" justify="space-between">
            <el-col  :span = "4">
                <el-row type="flex">
                    <!-- 设置侧栏的隐藏 -->
                    <el-button round size="small" @click=" $store.state.asideShow = !$store.state.asideShow" class="c-muen-set"><i class="fa fa-navicon"></i></el-button>
                    <!-- 搜索框 -->
                    <el-input
                        placeholder="请输入内容"
                        suffix-icon="el-icon-search"
                        class="header-sch"
                        size="small">
                    </el-input>
                </el-row>
            </el-col>
            <el-col :span = "12">
                <el-row type="flex" justify="end">
                    <el-breadcrumb separator-class="el-icon-arrow-right" class="c-bread">
                        <el-breadcrumb-item v-for="nav in navAdrss" v-bind:key="nav.id" :to="{path:nav.path}">{{nav.name}}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <!-- 消息 -->
                    <el-badge :value="100" :max="99" class="badge-item">
                        <el-button class="notice-set" size="small" round><i class="fa fa-bell"></i></el-button>
                    </el-badge>
                    <!-- 用户设置 -->
                    <el-dropdown @command="handleCommand" trigger="click" size="small">
                        <el-button class="user-set" round size="small"><i class="fa fa-user"></i></el-button>
                        <el-dropdown-menu slot="dropdown" >
                            <el-dropdown-item command="editPass"><i class="el-icon-edit"></i> 修改密码</el-dropdown-item>
                            <el-dropdown-item command="exit"><i class="el-icon-circle-close-outline"></i> 退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-row>
            </el-col>
        </el-row>
    </el-header>
</template>

<script>
import {mapState,mapMutations} from "vuex";
import EditPassBox from "./editPassword";
export default {
    components:{
        EditPassBox
    },
    computed:{
        ...mapState({
        navAdrss: state => state.navAdrss,
        }),
    },
    data() {
      return {
          passBox:false,
      };
    },
    methods:{
        ...mapMutations([
            "SET_BREAD"
        ]),
        closeBox(boole){
            this.passBox = false
        },
        /**
         * 触发退出事件
         */
        exit(){
            localStorage.clear();
            this.$router.push('/login')
        },
        /**
         * dropdown的选项判断
         * @param command String dropdown-item的command值
         */
        handleCommand(command){
            if(command == "exit"){
                this.$confirm('确定退出？', '询问', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    }).then(() => {
                        this.exit();
                    }).catch(() => {
                        return;
                });
            }else if(command == "editPass"){
                this.passBox = true;
            }
        },
        /**
         * 初始化
         */
        async init(){
            let str = localStorage.getItem("breadState");
            let defaultBread = [{
                id:"1",
                name:"首页",
                path:"/"
            }]
            str ? str =  JSON.parse(str) : str = defaultBread;
            this.SET_BREAD(str);
        }
    },
    mounted(){
        this.init()
    }
    
}
</script>
<style lang='less'>
    .c-header{
        .c-bread{
            line-height: 35px;
            padding-right: 20px;
        }
    }
</style>