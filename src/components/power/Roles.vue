<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <el-row>
            <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-row>

        <!-- 角色列表 -->
        <el-table :data="rolesList" stripe border>
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                        <!-- 一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 二级三级权限 -->
                        <el-col :span="19">
                            <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <!-- 二级权限 -->
                                <el-col :span="6">
                                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <!-- 三级权限 -->
                                <el-col :span="18">
                                    <el-tag type="warning" closable @close="removeRightById(scope.row,item3.id)" v-for="item3 in item2.children" :key="item3.id">
                                        {{item3.authName}}
                                    </el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoleById(scope.row.id)">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAssignRightsDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
    title="添加角色"
    :visible.sync="addRoleDialogVisible"
    width="50%"
    @close="resetForm('addRoleFormRef')">
        <!-- 内容主体 -->
        <el-form ref="addRoleFormRef" :model="addRoleForm" :rules="addRoleFormRules" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addRoleForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部 -->
        <span slot="footer">
            <el-button @click="addRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
    title="编辑角色"
    :visible.sync="editRoleDialogVisible"
    width="50%"
    @close="resetForm('editRoleFormRef')">
        <!-- 内容主体 -->
        <el-form ref="editRoleFormRef" :model="editRoleForm" :rules="editRoleFormRules" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editRoleForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部 -->
        <span slot="footer">
            <el-button @click="editRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="assignRightsDialogVisible"
    width="50%"
    @close="resetDefKeys">
        <!-- 主体 -->
        <el-tree
        :data="rightsTree"
        ref="rightsTreeRef"
        node-key="id"
        :props="treeProps"
        :default-checked-keys="defKeys"
        default-expand-all
        show-checkbox>
        </el-tree>
        <!-- 底部 -->
        <span slot="footer">
            <el-button @click="assignRightsDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="assignRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    name:'Roles',
    data(){
        return{
            // 添加角色
            addRoleDialogVisible:false,
            addRoleForm:{roleId:'',roleName:'',roleDesc:''},
            addRoleFormRules:{
                roleName:[{required: true, message: '请输入角色名称', trigger: 'blur'},
                {min:1,max:10,message:'角色名称的字符在1~10之间',trigger:'blur'}]
            },
            // 编辑角色
            editRoleDialogVisible:false,
            editRoleForm:{roleId:'',roleName:'',roleDesc:''},
            editRoleFormRules:{
                roleName:[{required: true, message: '请输入角色名称', trigger: 'blur'},
                {min:1,max:10,message:'角色名称的字符在1~10之间',trigger:'blur'}]
            },
            // 分配权限
            assignRightsDialogVisible:false,
            rightsTree:[],
            treeProps:{
                label:'authName',
                children:'children'
            },
            defKeys:[],
            assignRightsRoleId:'',//当前分配权限的角色id

            rolesList:[]
        }
    },
    methods:{
        // 重置表单
        resetForm(ref){
            this.$refs[ref].resetFields()
        },
        // 添加角色
        addRole(){
            // 表单验证
            this.$refs.addRoleFormRef.validate(async valid=>{
                // 判断表单验证是否通过
                if(!valid)return this.$message.error('数据错误')
                // 通过表单验证，向数据库发送请求，并接受响应的参数
                const {data:result} =await this.$http.post('roles',this.addRoleForm)
                // 根据响应参数判断是否请求成功
                if(result.meta.status!==201)return this.$message.error('请求失败')
                this.$message.success('添加成功')
                // 重新获取表格数据
                this.getRolesList()
                // 关闭对话框
                this.addRoleDialogVisible=false
            })
        },
        // 展示编辑角色对话框
        showEditRoleDialog(id){
            this.getRoleById(id)
            this.editRoleDialogVisible=true
        },
        // 根据id获取数据
        async getRoleById(id){
            const {data:result}=await this.$http.get(`roles/${id}`)
            if(result.meta.status!==200)return this.$message.error('获取角色失败')
            this.editRoleForm=result.data
        },
        // 确定编辑角色
        editRole(){
            // 表单验证
            this.$refs.editRoleFormRef.validate(async valid=>{
                // 验证失败则返回
                if(!valid)return this.$message.error('数据错误')
                // 验证成功发起请求，并接收数据
                const {data:result} = await this.$http.put(`roles/${this.editRoleForm.roleId}`,this.editRoleForm)
                // 判断是否编辑成功，失败返回
                if(result.meta.status!==200)return this.$message.error('编辑失败')
                // 成功提示
                this.$message.success('编辑成功')
                // 重新获取列表
                this.getRolesList()
                // 关闭对话框
                this.editRoleDialogVisible=false
            })
        },
        // 获取角色列表数据
        async getRolesList(){
            const {data:result} =await this.$http.get('roles')
            if(result.meta.status!==200)return this.$message.error('获取数据失败')
            this.rolesList=result.data
        },
        // 根据id删除角色
        async deleteRoleById(id){
            // 弹出确认框，是否删除用户
            const confirmResult = await this.$confirm('请问是否要永久删除该用户','删除提示',{
                confirmButtonText:'确认删除',
                cancelButtonText:'取消',
                type:'warning'
            }).catch(err=>err)
            //如果用户点击确认，则confirmResult 为'confirm'
            //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
            if(confirmResult=='cancel') return
            const {data:result}=await this.$http.delete(`roles/${id}`)
            if(result.meta.status!==200)return this.$message.error('删除失败')
            this.getRolesList()
            this.$message.success('删除成功')
        },
        // 删除权限标签
        async removeRightById(role,rightsId){
            // 弹出确认框，是否删除用户
            const confirmResult = await this.$confirm('请问是否要删除该权限','删除提示',{
                confirmButtonText:'确认删除',
                cancelButtonText:'取消',
                type:'warning'
            }).catch(err=>err)
            if(confirmResult=='cancel') return
            const {data:result}= await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
            if(result.meta.status!==200) return this.$message.error('取消权限失败')
            this.$message.success('取消角色权限成功')
            role.children=result.data
        },
        // 展示分配权限对话框
        async showAssignRightsDialog(role){
            const {data:result} =await this.$http.get('rights/tree')
            if(result.meta.status!==200) return this.$message.error('获取权限列表失败')
            this.assignRightsRoleId=role.id
            this.rightsTree = result.data;
            this.getLeafKeys(role,this.defKeys)
            this.assignRightsDialogVisible=true
        },
        // 用递归函数取出权限数据树中所有三级权限的id
        // node用以判断该节点是否时最终节点，arr用以保存取出的数据
        getLeafKeys(node,arr){
            // 如果该属性不包含children属性，那么他就是最终节点，把该属性的id存进arr
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getLeafKeys(item,arr)
            });
        },
        // 关闭权限分配对话框时，清空当前数据
        resetDefKeys(){
            this.defKeys=[]
        },
        // 确定分配权限
        async assignRights(){
            const keys=[...this.$refs.rightsTreeRef.getCheckedKeys(),...this.$refs.rightsTreeRef.getHalfCheckedKeys()]
            const idStr=keys.join(',')
            console.log(idStr)
            const {data:result}=await this.$http.post(`roles/${this.assignRightsRoleId}/rights`,{rids:idStr})
            if(result.meta.status!==200) return this.$message.error('授权失败')
            this.$message.success('授权成功')
            console.log(result)
            this.getRolesList()
            this.assignRightsDialogVisible = false
        },
    },
    created(){
        this.getRolesList()
    }

}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 7px;
}

.bdtop{
    border-top: 1px solid #eee;
}

.bdbottom{
    border-bottom: 1px solid #eee;
}

.vcenter{
    display: flex;
    align-items: center;
}
</style>