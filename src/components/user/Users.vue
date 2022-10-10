<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 数据表格展示区域 -->
      <el-table :data="userList" stripe border style="width: 100%">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditUser(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showAssignRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
    title="添加用户"
    :visible.sync="dialogVisible"
    width="50%"
    @close="addDialogClosed">
      <!-- 内容主体 -->
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="Email">
          <el-input v-model="addUserForm.Email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobileNumber">
          <el-input v-model="addUserForm.mobileNumber"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
    title="修改用户"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClosed">
      <!-- 对话框主体 -->
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除用户的对话框 -->
    <el-dialog
    title="删除用户"
    :visible.sync="deleteDialogVisible"
    width="50%">
      <span>是否删除该用户</span>
      <span slot="footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
    title="分配角色"
    :visible.sync="assignRoleDialogVisible"
    width="50%"
    @close="assignDialogClosed">
      <p>用户名：{{userInfo.username}}</p>
      <p>用户的角色：{{userInfo.role_name}}</p>
      <p>分配角色
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer">
        <el-button @click="assignRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 自定义规则
    // 校验邮箱
    var validateEmail=(rule, value, callback)=>{
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if(regEmail.test(value)){
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }
    // 校验手机号
    var validateMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      //返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页几条数据/容量
        pagesize: 2
      },

      // 获取的用户列表的数据
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      dialogVisible:false,

      // 添加用户对话框的表单
      addUserForm:{
        username:'',
        password:'',
        Email:'',
        mobileNumber:''
      },
      addUserFormRules:{
        username:[{required: true, message: '请输入用户名', trigger: 'blur'},
        {min:3,max:10,message:'用户名的字符在3~10之间',trigger:'blur'}],
        password:[{required: true, message: '请输入密码', trigger: 'blur'},
        {min:6,max:15,message:'密码的字符在6~15之间',trigger:'blur'}],
        Email:[{required: true, message: '请输入邮箱', trigger: 'blur'},
        {validator: validateEmail,trigger:'blur'}],
        mobileNumber:[{required: true, message: '请输入手机号', trigger: 'blur'},
        {validator: validateMobile,trigger:'blur'}],
      },

      // 控制编辑对话框的显示和隐藏
      editDialogVisible:false,
      // 删除用户对话框的显示和隐藏
      deleteDialogVisible:false,

      // 编辑用户的表单
      editUserForm:{id: 0,username:'',rid: 0,mobile: '', email: ''},
      editUserFormRules:{
        email:[{required: true, message: '请输入邮箱', trigger: 'blur'},
        {validator: validateEmail,trigger:'blur'}],
        mobile:[{required: true, message: '请输入手机号', trigger: 'blur'},
        {validator: validateMobile,trigger:'blur'}],
      },

      // 分配角色对话框
      assignRoleDialogVisible:false,
      userInfo:{},// 所有用户列表
      rolesList:[],// 所有角色列表
      selectedRoleId:'',// 已选中的角色Id
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获取用户数据
    async getUserList() {
      const { data: result } = await this.$http.get('users', {
        params: this.queryInfo
      });
      if (result.meta.status !== 200)
        return this.$message.error('获取用户列表失败');
      this.userList = result.data.users;
      this.total = result.data.total;
      // console.log(result)//输出查看ajax获取的对象
    },

    // 分页处理
    // 切换分页的容量
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getUserList()
      console.log(`每页 ${val} 条`);
    },
    // 当前页码改变会触发此方法
    handleCurrentChange(val) {
      this.queryInfo.pagenum=val
      this.getUserList()
      console.log(`当前页: ${val}`);
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo){
      const {data:result} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if(result.meta.status!==200){
        userInfo.mg_state=!userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },

    // 关闭表单时重置表单
    addDialogClosed(){
      this.$refs.addUserFormRef.resetFields();
    },

    // 点击对话框的确定按钮，添加新用户
    addUser(){
      // 表单验证
      this.$refs.addUserFormRef.validate( async valid => {
        // 如果验证失败，则返回error
        if(!valid) return this.$message.error('数据错误')
        // 验证成功，则向数据库发送请求，并把数据库的返回值解构赋值给result
        const {data:result} =await this.$http.post('users',this.addUserForm)
        console.log(result)
        // 从返回的数据，判断是否添加成功
        if(result.meta.status!==201) return this.$message.error('添加失败')
        // 成功则提示
        this.$message.success('添加成功')
        // 关闭对话框
        this.dialogVisible = false
        // 重新获取数据
        this.getUserList()
      })
    },

    // 展示编辑用户对话框
    async showEditUser(id){
      const {data:result} = await this.$http.get(`users/${id}`)
      if (result.meta.status !== 200) return this.$message.error('获取用户信息失败')
      this.editUserForm=result.data
      this.editDialogVisible=true
    },
    // 确定编辑用户
    editUser(){
      // 表单验证
      this.$refs.editUserFormRef.validate(async valid=>{
        // 如果验证失败，则返回且error
        if(!valid) return this.$message.error('数据错误')
        // 验证成功，则向数据库发出请求，修改数据
        const {data:result}= await this.$http.put(`users/${this.editUserForm.id}`,this.editUserForm)
        // 根据返回数据判断操作是否成功
        if(result.meta.status!==200) return this.$message('修改失败')
        this.$message.success('修改成功')
        console.log(result)
        this.getUserList()
        this.editDialogVisible=false
      })
    },
    // 关闭表单，取消编辑用户
    editDialogClosed(){
      this.$refs.editUserFormRef.resetFields()
    },
    // 根据id删除用户
    async removeUserById(id){
      // 弹出确认框，是否删除用户
      const confirmResult = await this.$confirm('请问是否要永久删除该用户','删除提示',{
        confirmButtonText:'确认删除',
        cancelButtonText:'取消',
        type:'warning'
      }).catch(err=>err)
      //如果用户点击确认，则confirmResult 为'confirm'
      //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if(confirmResult=='cancel') return console.log('取消删除')
      // 根据id发送请求
      const {data:result} =await this.$http.delete(`users/${id}`)
      // 根据返回的值判断是否删除成功
      if(result.meta.status!==200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      // 重新获取表格
      this.getUserList()
    },

    // 展示分配用户对话框
    async showAssignRoleDialog(role){
      this.userInfo=role

      // 展示之前获取所有角色列表
      const {data:result} = await this.$http.get('roles')
      if(result.meta.status!==200) return this.$message.error('获取角色列表失败')
      this.rolesList = result.data

      this.assignRoleDialogVisible=true
    },
    // 确认分配角色
    async assignRole(){
      // 判断用户是否选择了角色
      if(!this.selectedRoleId)return this.$message.error('请选择角色')
      const {data:result} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(result.meta.status!==200) return this.$message.error(result.meta.msg)
      this.$message.success(result.meta.msg)
      this.getUserList();
      this.assignRoleDialogVisible=false

    },
    // 关闭分配角色对话框
    assignDialogClosed(){
      this.selectedRoleId=''
      this.userInfo={}
    }
  },


};
</script>

<style lang="less" scoped>
</style>