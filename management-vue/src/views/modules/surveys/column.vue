<template>
  <div>
    <template v-for="item in items">
      <el-table-column :width="getWidthByItem(item)" v-if="item.name && item.name.length" :key="item.id" :label="item.name" :prop="item.prop"
                       align="center">
        <template slot-scope="scope">
          <!--单选题 start-->
          <el-radio-group v-if="scope.row[item.prop].type===1"
                          v-model="oesFormData[scope.row[item.prop].formDataKey]">
            <template v-for="itemRadio in scope.row[item.prop].data">
              <el-radio disabled :key="itemRadio.id+scope.row[item.prop].formDataKey"  :label="itemRadio.answerDesc">
                {{itemRadio.answerDesc}}
              </el-radio>
            </template>
          </el-radio-group>
          <!--单选题 end-->
          <!--多选题 start-->
          <el-checkbox-group v-if="scope.row[item.prop].type===2"
                             v-model="oesFormData[scope.row[item.prop].formDataKey]">
            <template v-for="itemCheck in scope.row[item.prop].data">
              <el-checkbox disabled :label="itemCheck.answerDesc" :key="itemCheck.id"></el-checkbox>
            </template>
          </el-checkbox-group>
          <!--多选题 end-->
          <!--判断题 start-->
          <el-radio-group v-if="scope.row[item.prop].type===3"
                          v-model="oesFormData[scope.row[item.prop].formDataKey]">
            <template v-for="itemRadio in scope.row[item.prop].data">
              <el-radio :key="itemRadio.id+scope.row[item.prop].formDataKey" :label="itemRadio.answerDesc">
                {{itemRadio.answerDesc}}
              </el-radio>
            </template>
          </el-radio-group>
          <!--判断题 end-->
          <!--打分题 start-->
          <el-select disabled v-if="scope.row[item.prop].type===4" placeholder="请选择"
                     v-model="oesFormData[scope.row[item.prop].formDataKey]">
            <el-option
              v-for="option in parseInt(scope.row[item.prop].data[0].answerDesc)"
              :key="option"
              :label="option+'分'"
              :value="option">
            </el-option>
          </el-select>
          <!--打分题 end-->
        </template>
        <column ref="childColumn" v-if="item.children && item.children.length" :items="item.children||[]"></column>
      </el-table-column>
    </template>
  </div>
</template>

<script>
  import {oesFormData} from '@/utils'

  export default {
    name: 'column',
    data() {
      return {
        oesFormData: oesFormData,
      }
    },
    props: {
      items: Array,
    },
    created() {
    },
    mounted() {

    },
    watch: {},
    methods: {
      getWidthByItem(item){
        if(item.type==1){
          return item.answersConut*80*item.maxFontLength;
        }else if(item.type==2){
          return item.answersConut*30*item.maxFontLength;
        }else if(item.type==3){
          return 400;
        }else if(item.type==4){
          return 200;
        }
      }

    }
  }
</script>

<style>

</style>
