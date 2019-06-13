<!--测栏滑块组件-->
<template>
    <AsidePanle 
    :propTitle="propTitle"
    :propShow="propShow"
    :propWidth="width"
    :propType="type"
    @close ="closePanle"
    @submit="submit">
    <div id="asidePanle">
        <el-form :model="data" label-width="90px">
            <el-row>
                <el-col :span="11">
                    <el-form-item label="姓名：">
                        <el-input v-model="data.name" :disabled="disabled"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="11">
                    <el-form-item label="地址：">
                        <el-input v-model="data.address" :disabled="disabled"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="时间：">
                <el-date-picker
                v-model="data.date"
                type="date"
                :disabled="disabled"
                placeholder="选择日期">
                </el-date-picker>
            </el-form-item>
            
            <el-form-item label="物体类型：">
                <el-checkbox-group :disabled="disabled"  v-model="data.check">
                    <el-checkbox label="航空器" ></el-checkbox>
                    <el-checkbox label="车辆" ></el-checkbox>
                    <el-checkbox label="人员" ></el-checkbox>
                    <el-checkbox label="跑道" ></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
             <el-form-item label="性别：">
                <el-radio-group :disabled="disabled" v-model="data.radio">
                <el-radio label="男的"></el-radio>
                <el-radio label="女的"></el-radio>
                </el-radio-group>
            </el-form-item>
            
        </el-form>
        <el-row class="bigBox" v-if=" type!=='add'">
            <img src="http://www.sasac.gov.cn/n2588025/n2588124/c3817689/part/3817690.jpg"/>
        </el-row>
    </div>
    </AsidePanle>
</template>

<script>
  //import {formCheck,trim} from "../../config/utils";
  import AsidePanle from "../../components/asidePanle"; 
  import {deepClone} from "../../config/utils"
  export default {
    components:{
        AsidePanle
    },
    props:{
       showPanle:Boolean,
       title:String,
       panleType:String,
       panelData:Object,
    },
    data() {
        return {
            propShow:false,
            width:800,
            propTitle:"新增",
            type:"form",
            data:{},
            oldData:{},
            disabled:false
        }
    },
    methods:{
        init(){
            this.propShow = this.showPanle;
            this.propTitle = this.title;
            this.type = this.panleType;
            this.disabledFuc(this.type)
        },
        disabledFuc(type){
            if(type =="info"){
                this.disabled = true;
                this.data = deepClone(this.oldData);
            }else{
                this.disabled = false;
            }
        },
        closePanle(val){
            this.propShow = val;
            this.data = deepClone(this.oldData);
        },
        submit(){
            this.$message({
                 message: JSON.stringify(this.data),
                 type:'success'
            });
        }
    },
    mounted(){
        this.init()
    },
    watch:{
        showPanle(val){
            this.propShow = val;
        },
        title(val){
            this.propTitle = val;
        },
        panleType(val){
            this.type =val
            this.disabledFuc(val)
        },
        propShow(val){
            this.$emit('close',val);
        },
        panelData(val){
            this.data = deepClone(val);
            this.oldData =deepClone(val);
        }
    }
  }
</script>
<style lang="less">
    #asidePanle{  
        padding-top: 20px;
        width: 95%;
        margin-left: 2.5%;
        .el-form-item{
            margin-bottom: 20px;
            label{
                font-weight: bold;
            }
            .el-form-item__content label{
                font-weight: 100;
            }
        }
        .bigBox{
            width: 100%;
            height: 600px;
            margin-bottom: 20px;
            background-color: #eee;
            border-radius: 4px;
            overflow: hidden;
            img{
                width: 100%;
            }
        }
        hr{
            border: 1px solid #eee;
        }
    }
</style>