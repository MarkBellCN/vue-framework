<!--测栏滑块组件-->
<template>
    <div :class="'asidePanle'+' '+show" :style="'width:'+(width?(width>1200?1200:(width<600?600:width)):600)+'px'">
        <div class="title">{{title||'新增'}}<i class="fa fa-close" @click="close" title="关闭"></i></div>
        <div :class="'panleMain'+' '+(type||'info')" >
            <div class="box">
                <slot></slot>
            </div>
            <div class="btn" v-if="type =='info'?false:true">
                <el-button size="small" @click="submit" type="primary">确定</el-button>
                <el-button size="small" @click="close">取消</el-button>
            </div>
        </div>
    </div>
</template>
<script>
  export default {
    props:{
        propTitle:String,
        propShow:Boolean,
        propWidth:Number,
        propType:String,
    },
    data() {
        return {
            title:"标题",
            show:"false",
            width:600,
            type:'info',
        }
    },
    methods:{
        init(){
            this.title = this.propTitle;
            this.show = this.propShow;
            this.width = this.propWidth;
            this.type = this.propType;
        },
        close(){
            this.show = "false" 
            this.$emit('close',false);
        },
        submit(){
            this.$emit('submit');
            this.close();
        }
    },
    mounted(){
        this.init()
    },
    watch:{
        propTitle(val){
            this.title = val;
        },
        propShow(val){
            this.show = val;
        },
        propWidth(val){
            this.width = val;
        },
        propType(val){
            this.type = val;
        }
    }
  }
</script>
<style lang="less">
    .asidePanle{
        transition: all .3s;
        position:absolute;
        background-color: #fff;
        z-index: 10;
        height: 100%;
        box-shadow: -5px 0 18px rgba(0 ,0,0,.06);
        bottom: 0;
        border-left: 1px solid #ddd;
        .title{
            position: relative;
            padding:10px 0;
            text-indent: 10px;
            border-bottom: 1px solid #ddd;
            background-color: #f9f9f9;
            .fa-close{
                position:absolute;
                right: 10px;
                top: 10px;
                cursor: pointer;
                font-size: 20px;
                color:#666;
            }
        }
        .panleMain{
            width:100%;
            height:calc(100% - 40px);
            overflow:hidden;
            .box{
                height: 100%;
                overflow: auto;
            }
            .btn{
                height: 32px;
                border-top: 1px solid #ddd;
                text-align: center;
                padding: 5px 0;
            }
        }
        .panleMain.form,.panleMain.add{
            .box{
                height: calc(100% - 44px);
            }
        }
    }
    .true{
        right: 0
    }
    .false{
        transition: all .3s;
        right: -900px;
        display: none; 
    }
</style>