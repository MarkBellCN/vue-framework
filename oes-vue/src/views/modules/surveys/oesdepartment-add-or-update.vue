<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
    <el-form-item label="单位部门名称" prop="departmentName">
      <el-input v-model="dataForm.departmentName" placeholder="单位部门名称" maxlength="20"></el-input>
    </el-form-item>
    <el-form-item label="上级单位" prop="parentName">
      <el-popover
        ref="deptListPopover"
        placement="bottom-start"
        trigger="click">
        <el-tree
          :data="deptList"
          node-key="id"
          ref="deptListTree"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="deptListTreeCurrentChangeHandle">
          <div class="custom-tree-node" slot-scope="{ node, data }" :class="(node.data.hasOwnProperty('disabled') && node.data.disabled) ? 'node-disabled' : ''">
            <div>{{ node.data.departmentName }}</div>
          </div>
        </el-tree>
      </el-popover>
      <el-input v-model="dataForm.parentName" v-popover:deptListPopover :readonly="true" placeholder="点击选择上级单位部门" class="menu-list__input"></el-input>
    </el-form-item>
    <el-form-item label="排序号" prop="sort">
      <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" label="排序号"></el-input-number>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input maxlength="50" v-model="dataForm.remark" placeholder="备注" ></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { dateFormat }from "../../../utils/validate"
  import { treeDataTranslate,disableTreeByPid } from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          departmentName: '',
          companyId: '',
          parentId: 0,
          parentName: '',
          sort: '',
          createTime: '',
          updateTime: '',
          remark: ''
        },
        dataRule: {
          departmentName: [
            { required: true, message: '单位部门名称不能为空', trigger: 'blur' },
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,20}$/,
              message: '1-20位数字字母汉字下划线',
              trigger: 'blur'
            }
          ],
          parentName: [
            { required: true, message: '上级单位部门不能为空', trigger: 'change' }
          ],
          remark: [
            {
              validator: this.$elementValidate.validatePattern,
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,50}$/,
              message: '1-50位数字字母汉字下划线',
              trigger: 'blur'
            }
          ]
        },
        deptList: [],
        deptListTemp:[],
        deptListTreeProps: {
          label: 'departmentName',
          children: 'children'
        },
      }
    },
    methods: {
      init (id) {
        this.dataForm.parentId = 0
        this.dataForm.id = id || 0
        this.$http({
          url: this.$http.adornUrl('/surveys/oesdepartment/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.deptListTemp = treeDataTranslate(data.deptList, 'id')
        }).then(() => {
          this.visible = true
          if (!this.dataForm.id) {
            this.deptList=this.deptListTemp
            // 新增
            this.$nextTick(()=>{
              this.deptListTreeSetCurrentNode()
            })
          } else {
            // 修改
            this.$http({
              url: this.$http.adornUrl(`/surveys/oesdepartment/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              this.dataForm.id = data.oesdepartment.id
              this.dataForm.departmentName = data.oesdepartment.departmentName
              this.dataForm.companyId = data.oesdepartment.companyId
              this.dataForm.parentId = data.oesdepartment.parentId
              this.dataForm.sort = data.oesdepartment.sort
              this.dataForm.createTime = data.oesdepartment.createTime
              this.dataForm.updateTime = data.oesdepartment.updateTime
              this.dataForm.remark = data.oesdepartment.remark
              disableTreeByPid(this.deptListTemp ,this.dataForm.id)
              this.deptList=this.deptListTemp
              this.$nextTick(()=>{
                this.deptListTreeSetCurrentNode()
              })

            })
          }
        })
      },
      // 单位部门树树选中
      deptListTreeCurrentChangeHandle (data, node) {
        if(data.disabled){
          return;
        }
        this.dataForm.parentId = data.id
        this.dataForm.parentName = data.departmentName
      },
      // 单位部门树设置当前选中节点
      deptListTreeSetCurrentNode (node) {
        this.$refs.deptListTree.setCurrentKey(this.dataForm.parentId)
        this.dataForm.parentName = (this.$refs.deptListTree.getCurrentNode() || {})['departmentName']
      },
      format(val) {
        return dateFormat(val);
      },
      renderContent(h, { node, data, store }) {
        if(data.disabled){
          return (
            '<span class="custom-tree-node"><span>{node.label}</span><span>'
          );
        }else{
          return (
            '<span class="custom-tree-node"><span>{node.label}</span><span>'
          );
        }

      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/surveys/oesdepartment/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'departmentName': this.dataForm.departmentName,
                'companyId': this.dataForm.companyId,
                'sort': this.dataForm.sort,
                'parentId': this.dataForm.parentId,
                'createTime': this.dataForm.id?this.dataForm.createTime:this.format(new Date),
                'updateTime': this.format(new Date),
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 500,
                  onClose: () => {
                    this.handleClose();
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      handleClose() {
        this.visible = false;
        this.$refs['dataForm'].resetFields()

      }
    }
  }
</script>

<style>
  .node-disabled {
    cursor: not-allowed;
  }
  .el-popover{
    max-height: 230px;
    overflow: scroll;
  }
</style>
