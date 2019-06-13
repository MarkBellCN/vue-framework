<!--默认显示首页内容-->
<template>
<div id="indexMain">
    <el-form :inline="true" :model="formInline" ref="formInline">
    <el-row type="flex" justify="space-between" class="main-top">
        <el-col :span = "20">
            <el-form-item label="查询条件一" prop="user">
                <el-input v-model="formInline.user" size="small" placeholder="查询条件一"></el-input>
            </el-form-item>
            <el-form-item label="查询条件二" prop="region">
                <el-select v-model="formInline.region" size="small"  placeholder="查询条件二">
                    <el-option label="区域一" value="shanghai"></el-option>
                    <el-option label="区域二" value="beijing"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="时间段" prop="dataValue">
                <el-date-picker
                size="small" 
                v-model="formInline.dataValue"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
        </el-col>
        <el-form-item>
            <el-button size="small" type="primary" @click="onSubmit('formInline')">查询</el-button>
            <el-button size="small"  @click="resetForm('formInline')">重置</el-button>
        </el-form-item>
    </el-row>
    </el-form>
    <Panle :showPanle="show" :title = "panleTitle" @close = "closePanle" :panelData = "panelData" :panleType="panleType"></Panle>
    <el-header class="pageNum" height="auto">
        <el-col :span="5" class="button-group">
            <el-button size="small" type="primary" @click="addInfo">
                <i class="fa fa-plus"></i> 新增
            </el-button>
            <el-button size="small" type="danger" v-if="deteleShow">
                <i class="fa fa-trash"></i> 删除
            </el-button>
        </el-col>
        <el-pagination
            background
            layout="total,prev, pager, next"
            :total="1000">
        </el-pagination>
    </el-header>
    <el-table
    :data="tableData"
    stripe
    style="width: 100%"
    @selection-change="selectionVal">
        <el-table-column
        type="selection"
        width="55">
        </el-table-column>
        <el-table-column 
        prop="set"
        label="操作"
        width="280">
            <template slot-scope="scope">
                <el-button size="mini" @click="editInfo(scope.$index,scope.row)">编辑</el-button>
                <el-button size="mini" @click="infoDetail(scope.$index,scope.row)" type="primary" plain >详细</el-button>
                <el-button size="mini" type="danger">删除</el-button>
            </template>
        </el-table-column>
        <el-table-column
        prop="date"
        label="日期"
        width="180">
        </el-table-column>
        <el-table-column
        prop="name"
        label="姓名"
        width="180">
        </el-table-column>
        <el-table-column
        prop="address"
        label="地址">
        </el-table-column>
    </el-table>
</div>
</template>

<script>
  import {testApi} from "../../service/service";
  import Panle from "./asidePanle";
  export default {
    components:{
        Panle
    },
    data() {
      return {
        formInline: {
          user: '',
          dataValue: '',
          region: ''
        },
        deteleShow : false,
        tableData: [],
        show:false,
        panleTitle:"标题未定义……",
        panleType:"info",
        panelData:{},
      }
    },
    methods:{
        onSubmit(){
            console.log(this.formInline);
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        selectionVal(val){
            val.length > 0 ? this.deteleShow = true :this.deteleShow = false;
        },
        async testGetTableData(){
            let res = await testApi.test();
            if (res.success) {
                this.tableData = res.data;
            }
        },
        addInfo(){
            this.show = true;
            this.panleTitle = "新增";
            this.panleType = "add"
            this.panelData = {
                name:"",
                date:"",
                address:"",
                check:[],
                radio:'',
            } 
        },
        editInfo(index,row){
            this.show = true;
            this.panleTitle = "编辑"+row.name;
            this.panleType = "form"
            this.panelData = row;
        },
        infoDetail(index,row){
            this.show = true;
            this.panleTitle = row.name+"的详细信息";
            this.panleType = "info"
            this.panelData = row;
        },
        closePanle(val){
            this.show = val
        }
    },
    mounted(){
        this.testGetTableData()
    }
  }
</script>
<style lang="less">
    #indexMain{
        height: 100%;
        position: relative;
        .pageNum{
            padding: 10px;
            width: 100%;
            background-color: #fff;
            height: 10px;
            text-align: right;
            border-bottom: 1px solid #ddd;
        }
        .main-top{
            padding: 10px;
            height: auto;
            background-color: #fff;
            border-bottom: 1px solid #ddd;
        }
        .el-form-item{
            margin-bottom: 0;
        }
        .button-group{
            text-align: left
        }
    }
</style>