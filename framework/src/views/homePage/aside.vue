<template>
   <el-aside class="c-el-aside">
        <!-- 导航 -->
        <el-menu
        :default-active="activeMenu"
        class="el-aside-menu"
        :open = "openMenu"
        background-color="#000"
        :collapse="asideShow"
        active-text-color="#fff"
        @select = "chooseNav"
        text-color="#fff">
            <!-- logo -->
            <h1 v-if="!asideShow"><i class="fa fa-soccer-ball-o"></i> YueTai Vue</h1>
            <h1 v-else><i class="fa fa-soccer-ball-o"></i></h1>
            <el-submenu :index="''+index" v-for="(menu,index) in menuList" :key="index" v-if="menu.children.length > 0">
                <template slot="title">
                    <i :class="menu.icon"></i>
                    <span>{{menu.name}}</span>
                </template>
                <el-menu-item v-for="(item,index) in menu.children" :key="index" :index="index+'c'">{{item.name}}</el-menu-item>
            </el-submenu>
            <el-menu-item :index="''+index" v-else>
                <i :class="menu.icon"></i>
                <span slot="title">{{menu.name}}</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>

<script>
import {mapState,mapMutations} from 'vuex';
export default {
    computed:{
        /**
         * 读取状态suore状态
         */
        ...mapState({
            asideShow: state => state.asideShow,
        }),
    },
    data() {
      return {
        navAdrss:'',
        logoWidth:"",
        activeMenu:"0",
        openMenu:"",    
        menuList:[{     //导航数据结构
                id:"1",
                name:"首页",
                path:"/",
                icon:"fa fa-home",
                children:[]
            },{
                id:"2",
                name:"一个二级下拉",
                path:"",
                icon:"fa fa-road",
                children:[{
                        id:"2-1",
                        name:"VUE框架",
                        path:"",
                    },{
                        id:"2-2",
                        name:"VUE框架",
                        path:"",
                    },{
                        id:"2-3",
                        name:"VUE框架",
                        path:"",
                    },{
                        id:"2-4",
                        name:"VUE框架",
                        path:"",
                    }]
            },{
                id:"3",
                name:"Demo",
                path:"/demo",
                icon:"el-icon-menu",
                children:[]
            },{
                id:"4",
                name:"基础数据",
                path:"",
                icon:"el-icon-menu",
                children:[]
            },{
                id:"5",
                name:"基础数据",
                path:"",
                icon:"el-icon-menu",
                children:[]
        }]
      };
    },
    methods:{
        /**
         * 载入VUX mutations
         * "SET_BREAD" 设置面包屑状态的方法
         */
        ...mapMutations([
            "SET_BREAD"
        ]),
        /**
         * 选择测栏导航触发该事件
         * @param index string 导航所选index值
         * @param path Array 导航所选index的集合
         */
        chooseNav(index,path){
            this.navAdrss = [];
            let navArr = [];
            this.navAdrss.menuState = path;
            for (let i in path){
                let arr = parseFloat(path[i]);
                navArr.push(arr);
            };
            for (let j in navArr){
                let navObj = {};
                let i = navArr[j];
                if(j == '0'){
                    navObj.name = this.menuList[i].name,
                    navObj.path = this.menuList[i].path;
                }else if(j == '1'){
                    let _i = navArr[j-1]
                    navObj.name = this.menuList[_i].children[i].name,
                    navObj.path = this.menuList[_i].children[i].path;
                }
                this.navAdrss.push(navObj);
            }
            //跳转路由
            let lang = this.navAdrss.length;
            this.$router.push(this.navAdrss[lang-1].path)
            //改变状态，用于面包屑导航
            this.SET_BREAD(this.navAdrss);
            //存储面包屑导航，防止页面刷新状态改变
            localStorage.setItem('breadState',JSON.stringify(this.navAdrss));
            //存储澳航选中状态
            localStorage.setItem('menuState',path);
            //设置导航状态数据
            this.setMunuState(path)
        },
        /**
         * 设置导航状态
         * @param arr Array 导航选中的数组
         */
        setMunuState(arr){
            if(arr.length > 1){
                this.activeMenu = arr[arr.length - 1];
                this.openMenu = arr[arr.length - 2]
            }else{
                this.activeMenu = arr[0];
            }
        },
        /**
         * 初始化
         */
        async init(){
            this.$nextTick(() => {
                let str = localStorage.getItem("menuState"),arr;
                    str ? arr = str.split(',') : arr = ['0'];
                    this.setMunuState(arr)
            })
        }
    },
    watch:{
        /**
         * 监听测栏收缩状态，改变logo的样式
         */
        asideShow(newVal,oldVal){
            if(newVal){
               this.logoWidth = "logoMini" 
            }
        }
    },
    mounted(){
        this.init()
    }
}
</script>

<style lang='less'>
    .c-el-aside{
        .is-active{
            background:linear-gradient( 45deg, rgb(5, 126, 255), rgb(0, 255, 200)) !important;
        }
        h1{
            height: 50px;
            line-height: 50px;
            margin-right: 1px;
            color:#fff;
            background-color: #000;
            text-indent: 10px;
        }
        a{
            color:#fff;
            display: block;
        }
        .fa{
            vertical-align: middle;
            margin-right: 5px;
            width: 24px;
            text-align: center;
            font-size: 18px;
        }
    }
</style>