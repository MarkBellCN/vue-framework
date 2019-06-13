<template>
  <div style="height:100%;" id="c-main">   
    <el-container class="c-el-cont">
        <!-- Aside -->
        <Aside></Aside>
        <el-main class="c-no-padding">
            <!-- Header -->
            <Header></Header>
            <el-main class="c-main c-no-padding">
                <router-view class="router-view"></router-view>
            </el-main>
        </el-main>
    </el-container>
  </div>
</template>

<script>
import Header from "./homePage/header.vue";
import Aside from "./homePage/aside.vue";
export default {
    components: {
      Header,
      Aside
    },
    data() {
      return {
      };
    },
    methods:{
        /**
         * 获取token
         */
        getToken(){
            let token = localStorage.getItem("token")
            return token
        }
    },
    mounted(){
        if(!this.getToken()){
            this.$router.push('/login')
        }
    }
}
</script>

<style lang='less'>
#c-main{
    .badge-item > sup{
        right: 20px !important;
        top: 5px!important;
    }
    .header-sch > input{
        border-radius: 50px;
        margin-left: 10px;
    }
    .c-el-aside{
        width: auto !important
    }
    .el-aside-menu{
        overflow-x: hidden;
        height:100%;
    }
    .el-aside-menu:not(.el-menu--collapse) {
        width: 200px;
    }
    .c-el-aside,.c-el-cont{
        height:100%;
    }
    .c-no-padding{
        padding: 0;
    }
    .c-header{
        border-bottom: 1px solid rgba(148, 168, 189, 0.3);
        background:linear-gradient(to left, rgba(148, 168, 189, 0.3), rgb(255, 255, 255));
        padding: 10px 0;
    }
    .c-main{
        background-color: #eee;
        /* box-shadow: 0px 5px 15px rgba(0,0,0,.08) inset; */
        max-height:calc(100% - 53px);
        height: calc(100% - 53px);
        overflow: auto;
    }
    .c-muen-set{
        margin-left: 10px;
    }
    .user-set{
        margin:0 10px;
    }
    .badge-item{
        margin-right: 5px;
    }
}
</style>