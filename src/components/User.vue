<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input prefix-icon="el-icon-search" placeholder="请输入用户名" v-model="queryInfo.user"
                    @change="inputChange" clearable>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handlerAddUser">
            添加
          </el-button>
        </el-col>
      </el-row>
      <el-table
          :data="tableData"
          border
          stripe>
        <el-table-column
            type="index"
            label="序号"
            align="center"
            width="100px">
        </el-table-column>
        <el-table-column
            label="用户"
            prop="username"
            align="center">
        </el-table-column>
        <el-table-column
            label="邮箱"
            prop="email"
            align="center">
        </el-table-column>
        <el-table-column
            label="角色"
            prop="role"
            align="center">
        </el-table-column>
        <el-table-column
            label="部门"
            prop="department"
            align="center">
        </el-table-column>
        <el-table-column
            label="状态"
            prop="status"
            align="center"
            width="100px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status=='正常'? true: false" type="success">
              <span class="el-icon-success"></span>
            </el-tag>
            <el-tag v-else type="danger">
              <span class="el-icon-error"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            label="操作"
            align="center">
          <template slot-scope="scope">
            <el-button type="success" icon="el-icon-edit" size="mini"
                       :disabled="scope.row.username==='admin'?true:false"
                       @click="editUser(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       :disabled="scope.row.username==='admin'?true:false"
                       @click="deleteUser(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change=" handleSizeChange
                        "
          @current-change="handleCurrentChange"
          :current-page="queryInfo.offset"
          :page-sizes="[10,20,50,100]"
          :page-size="queryInfo.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          hide-on-single-page>
      </el-pagination>
      <el-dialog :title="autofocus?'新增用户':'编辑用户'"
                 width="35%"
                 :visible="dialogVisible"
                 @close="closeDialog('addUserRef')">
        <el-form :model="addUser" ref="addUserRef" :rules="addUserRule" label-width="70px">
          <el-form-item
              label="用户名"
              prop="username">
            <el-input v-model="addUser.username" :autofocus="autofocus" clearable
                      :disabled="!autofocus"
                      prefix-icon="iconfont icon-account"
            >
            </el-input>
          </el-form-item>
          <el-form-item
              label="邮箱"
              prop="email">
            <el-input v-model="addUser.email" :autofocus="autofocus" clearable

                      prefix-icon="iconfont icon-account"
            >
            </el-input>
          </el-form-item>
          <el-form-item v-if="!autofocus" label="重置密码">
            <el-switch
                v-model="swithValue"
                active-text="是"
                inactive-text="否">
            </el-switch>
          </el-form-item>
          <el-form-item
              label="密码"
              prop="password"
              v-if="autofocus || swithValue ? true:false"
          >
            <el-input v-model="addUser.password" type="password" show-password clearable
                      prefix-icon="iconfont icon-password" style="width: 226.4px">
            </el-input>
            <el-button type="info" size="medium" style="margin-left: 20px;width: 180px"
                       @click="makePwd">
              {{ autofocus ? '生成随机密码' : '重置密码' }}
            </el-button>
          </el-form-item>
          <el-form-item
              label="角色"
              prop="role">
            <el-select v-model="addUser.role" placeholder="请选择角色" @change="getRole">
              <el-option
                  label="admin"
                  value="admin">
              </el-option>
              <el-option
                  label="DBA"
                  value="DBA">
              </el-option>
              <el-option
                  label="主管"
                  value="主管">
              </el-option>
              <el-option
                  label="员工"
                  value="员工">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
              label="部门"
              prop="role_id">
            <el-select v-model="addUser.role_id" placeholder="请选择部门">
              <el-option
                  v-for="item in options"
                  :key="item.id"
                  :label="item.department"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
              label="状态"
              prop="status">
            <el-radio v-model="addUser.status" label="正常">正常</el-radio>
            <el-radio v-model="addUser.status" label="锁定">锁定</el-radio>
          </el-form-item>
          <el-form-item>
            <el-row>
              <el-col :span="4">
                <el-button type="info" @click="closeDialog('addUserRef')">取消</el-button>
              </el-col>
              <el-col :push="10" :span="16">
                <el-button v-if='autofocus' type="info" @click="resetForm('addUserRef')">重置
                </el-button>
                <el-button type="primary" @click="commitForm('addUserRef')">提交</el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import '../assets/fonts/iconfont.css'

export default {
  name: "User",
  data() {
    return {
      tableData: [],
      queryInfo: {
        offset: 1,
        limit: 10,
        user: '',
      },
      addUser: {
        username: '',
        email: '',
        status: '正常',
        password: '',
        role_id: '',
        role: ''
      },
      userid: 0,
      total: 0,
      dialogVisible: false,
      addUserRule: {
        username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 12, message: '密码长度在6-12个字符', trigger: 'blur'}],
        role_id: [{required: true, message: '请选择用户部门', trigger: 'change'}],
        role: [{required: true, message: '请选择用户角色', trigger: 'change'}]
      },
      options: [],
      resetPwd: false,
      autofocus: true,
      swithValue: false,
    }
  },
  mounted() {
    this.getUser()
  }
  ,
  methods: {
    deleteUser(row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).then(async () => {
        console.log(row)
        const {data: res} = await this.$ajax.delete(`/user/?id=${row.id}`)
        if (res.msg != 'success') return this.message.error('删除失败')
        this.getUser()
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    editUser(row) {
      this.getRole()
      this.autofocus = false
      this.userid = row.id
      this.addUser.username = row.username
      this.addUser.password = ''
      this.addUser.status = row.status
      this.addUser.role_id = row.role_id
      this.addUser.role = row.role
      this.dialogVisible = true
    },
    async makePwd() {
      const {data: res} = await this.$ajax.post('/pwd/')
      this.addUser.password = res.data
    },
    commitForm(form) {
      this.$refs[form].validate(async valid => {
        if (!valid) return this.$message.error('请正确填写完整信息')
        if (this.autofocus) {
          var userInfo = this.addUser
          delete userInfo.role
          const {data: res} = await this.$ajax.post('/user/', userInfo).catch(() => {
            return this.$notify.error({title: '错误', message: '发起添加用户失败'})
          })
          if (res.msg != 'success') return this.$message.error('添加新用户失败')
          this.getUser()
          this.closeDialog(form)
          this.$message.success('添加新用户成功')
        } else {
          var userInfo = this.addUser
          delete userInfo.role
          userInfo.id = this.userid
          const {data: res} = await this.$ajax.patch('/user/', userInfo)
          if (res.msg != 'success') return this.$message.error('修改用户信息失败')
          this.getUser()
          this.closeDialog(form)
          this.$message.success('修改用户信息成功')
        }
      })
    }
    ,
    resetForm(form) {
      this.addUser.role_id = ''
      this.addUser.username = ''
      this.addUser.password = ''
      this.addUser.status = '正常'
      this.addUser.role = ''
      this.$refs[form].clearValidate()
    }
    ,
    closeDialog(form) {
      this.dialogVisible = false
      this.autofocus = true
      this.resetForm(form)
    }
    ,
    handlerAddUser() {
      this.getRole()
      this.dialogVisible = true
    }
    ,
    inputChange() {
      this.getUser()
    }
    ,
    handleCurrentChange(val) {
      this.queryInfo.offset = val
      this.getUser()
    }
    ,
    handleSizeChange(val) {
      this.queryInfo.limit = val
      this.getUser()
    }
    ,
    async getUser() {
      const {data: res} = await this.$ajax.get('/user/', {params: this.queryInfo})
      if (res.msg != 'success') return this.$message.error('获取用户列表失败')
      this.tableData = res.data
      this.total = res.total
    }
    ,
    async getRole() {
      this.addUser.role_id = ''
      const {data: res} = await this.$ajax.get(`/role/?role=${this.addUser.role}`)
      if (res.msg != 'success') return this.$message.error('获取角色列表失败')
      this.options = res.data

    }
    ,
  }
  ,
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
  min-height: 630px;
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 30px;
}

</style>
