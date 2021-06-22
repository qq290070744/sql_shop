<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="inputValue"
            prefix-icon="el-icon-search"
            placeholder="请输入角色名"
            @change="inputChange"
            clearable
          ></el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">新增</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table size="mini" border stripe :data="props.row.ins">
              <el-table-column label="#" type="index" width="100px" align="center"></el-table-column>
              <el-table-column label="实例名称" prop="ins_name" width="200px" align="center"></el-table-column>
              <el-table-column label="操作权限" prop="privileges" align="center">
                <template slot-scope="scope">
                  <el-checkbox-group v-model="scope.row.privileges" @change="priCommit(scope.row)">
                    <el-checkbox label="select" border size="mini" disabled></el-checkbox>
                    <el-checkbox
                      label="insert"
                      border
                      size="mini"
                      :disabled="scope.row.type=='slave'"
                    ></el-checkbox>
                    <el-checkbox
                      label="update"
                      border
                      size="mini"
                      :disabled="scope.row.type=='slave'"
                    ></el-checkbox>
                    <el-checkbox
                      label="delete"
                      border
                      size="mini"
                      :disabled="scope.row.type=='slave'"
                    ></el-checkbox>
                    <el-checkbox
                      label="alter"
                      border
                      size="mini"
                      :disabled="scope.row.type=='slave'"
                    ></el-checkbox>
                    <el-checkbox
                      label="create"
                      border
                      size="mini"
                      :disabled="scope.row.type=='slave'"
                    ></el-checkbox>
                  </el-checkbox-group>
                </template>
              </el-table-column>
              <el-table-column label="删除操作" width="200px" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="delInstance(scope.row)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index" align="center" header-align="center" width="200px"></el-table-column>
        <el-table-column label="角色名称" prop="role" align="center"></el-table-column>
        <el-table-column label="部门名称" prop="department" align="center"></el-table-column>
        <el-table-column label="编辑" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              :disabled="scope.row.role==='admin'?true:false"
              @click="handlerEdit(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="scope.row.role==='admin'?true:false"
              @click="deleteRole(scope.row)"
            ></el-button>
            <el-button
              type="info"
              icon="el-icon-plus"
              size="mini"
              :disabled="scope.row.role==='admin'?true:false"
              @click="addPri(scope.row)"
            >新增实例权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handlerSizeChange"
        @current-change="handlerCurrentChange"
        :current-page="queryInfo.offset"
        :page-sizes="[ 10, 20, 50,100]"
        :page-size="queryInfo.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :hide-on-single-page="true"
      ></el-pagination>
      <el-dialog
        :visible="dialogVisible"
        width="30%"
        :title="isEdit? '编辑角色':'新增角色'"
        @close="dialogClose('formRef')"
      >
        <el-form
          :model="formData"
          ref="formRef"
          :rules="formRule"
          label-position="left"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="role">
            <el-select placeholder="请选择角色" v-model="formData.role" style="width: 340.8px">
              <el-option label="admin" value="admin"></el-option>
              <el-option label="DBA" value="DBA"></el-option>
              <el-option label="主管" value="主管"></el-option>
              <el-option label="员工" value="员工"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="部门名称" prop="department">
            <el-input v-model="formData.department"></el-input>
          </el-form-item>
          <el-form-item>
            <el-row>
              <el-col :push="4" :span="8">
                <el-button type="info" @click="dialogClose('formRef')">取消</el-button>
              </el-col>
              <el-col :push="4" :span="8">
                <el-button type="primary" @click="handlerCommit('formRef')">提交</el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog :title="addPriTitle[1]" width="60%" :visible="addPriVisible" @close="addPriCancel">
        <el-form :model="addPriData" ref="addPriRef">
          <el-row>
            <el-form-item>
              <el-col :span="8">
                <el-select v-model="addPriData.instance_id" placeholder="请选择实例" clearable>
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.ins_name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-col>
              <el-col :span="16">
                <el-checkbox-group v-model="addPriData.privileges">
                  <el-checkbox label="select" border size="mini" disabled></el-checkbox>
                  <el-checkbox label="insert" border size="mini" :disabled="status"></el-checkbox>
                  <el-checkbox label="update" border size="mini" :disabled="status"></el-checkbox>
                  <el-checkbox label="delete" border size="mini" :disabled="status"></el-checkbox>
                  <el-checkbox label="alter" border size="mini" :disabled="status"></el-checkbox>
                  <el-checkbox label="create" border size="mini" :disabled="status"></el-checkbox>
                </el-checkbox-group>
              </el-col>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item>
              <el-col :push="18">
                <el-button type="info" @click="addPriCancel">取消</el-button>
                <el-button type="primary" @click="addPriConfirm">确定</el-button>
              </el-col>
            </el-form-item>
          </el-row>
        </el-form>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Role",
  data() {
    return {
      inputValue: "",
      tableData: [],
      queryInfo: {
        role: "",
        offset: 1,
        limit: 10
      },
      total: 0,
      dialogVisible: false,
      formData: {
        role: "",
        department: ""
      },
      formRule: {
        role: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        department: [
          { required: true, message: "请输入部门名称", trigger: "blur" }
        ]
      },
      isEdit: false,
      addPriVisible: false,
      checkList: [],
      options: [],
      addPriTitle: [],
      addPriData: {
        instance_id: "",
        role_id: "",
        privileges: ["select"]
      }
    };
  },
  computed: {
    status() {
      var st;
      if (this.addPriData.instance_id !== "") {
        try {
          this.options.forEach(item => {
            if (
              item.id === this.addPriData.instance_id &&
              item.type === "slave"
            ) {
              st = true;
              throw Error();
            } else {
              st = false;
            }
          });
        } catch (e) {}
        return st;
      }
    }
  },
  mounted() {
    this.getRoles();
  },
  methods: {
    async delInstance(row) {
      this.$confirm("此操作将删除该对象对该实例全部操作, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$ajax.delete(
            `/rights/?pri_id=${row.privilege_id}`
          );
          if (res.msg != "success")
            return this.$message.error("删除实例权限失败");
          this.getRoles();
          this.$message({
            type: "success",
            message: "删除实例权限成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    async priCommit(row) {
      const pri = row.privileges.join(",");
      console.log(row);
      const { data: res } = await this.$ajax.patch(
        `/rights/?pri_id=${row.privilege_id}&pri=${pri}`
      );
      if (res.msg != "success")
        return this.$message("实例" + row.ins_name + "权限修改失败");
    },
    async addPriConfirm() {
      this.addPriData.role_id = this.addPriTitle[0];
      this.addPriData.privileges = this.addPriData.privileges.join(",");
      const { data: res } = await this.$ajax.post("/rights/", this.addPriData);
      if (res.msg != "success") return this.$message.error("添加权限失败");
      this.$message.success("添加权限成功");
      this.addPriCancel();
      this.getRoles();
    },
    addPriCancel() {
      this.addPriVisible = false;
      this.addPriData.instance_id = "";
      this.role_id = "";
      this.addPriData.privileges = ["select"];
    },
    async addPri(row) {
      this.addPriTitle = [row.id, "为角色" + row.role + "新增实例权限"];
      this.addPriVisible = true;
      const { data: res } = await this.$ajax.get(`/partins/?role_id=${row.id}`);
      if (res.msg != "success") return this.$message.error("获取实列失败");
      this.options = res.data;
    },
    async handlerEdit(row) {
      const { data: res } = await this.$ajax.get(`/role/?id=${row.id}`);
      this.formData = res.data;
      this.dialogVisible = true;
      this.isEdit = true;
    },
    deleteRole(row) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$ajax.delete(`/role/?id=${row.id}`);
          if (res.msg != "success") return this.$message.error("删除角色失败");
          this.getRoles();
          this.$message({
            type: "success",
            message: "角色删除成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handlerCommit(form) {
      this.$refs[form].validate(async valid => {
        if (!valid) return this.$message.error("请正确填写必要项");
        if (this.isEdit) {
          var { data: res } = await this.$ajax.patch("/role/", this.formData);
          if (res.msg != "success") return this.$message.error("修改角色失败");
          this.$message.success("修改角色成功");
        } else {
          var { data: res } = await this.$ajax.post("/role/", this.formData).catch(()=>{
            return this.$notify.error({title:'错误',message:'发起添加角色失败'})
          });
          if (res.msg != "success") return this.$message.error("添加角色失败");
          this.$message.success("添加角色成功");
        }
        this.dialogVisible = false;
        this.getRoles();
      });
    },
    dialogClose(form) {
      this.dialogVisible = false;
      this.formData.role = "";
      this.formData.department = "";
      this.isEdit = this.isEdit ? false : false;
    },
    inputChange() {
      this.queryInfo.role = this.inputValue;
      this.getRoles();
    },
    handlerSizeChange(val) {
      this.queryInfo.limit = val;
      this.getRoles();
    },
    handlerCurrentChange(val) {
      this.queryInfo.offset = val;
      this.getRoles();
    },
    async getRoles() {
      const { data: res } = await this.$ajax.get("/role/", {
        params: this.queryInfo
      });
      if (res.msg != "success") return this.$message.error("获取角色列表失败");
      res.data.forEach(item => {
        item.ins.forEach(i => {
          i.privileges = i.privileges.split(",");
        });
      });
      this.tableData = res.data;
      this.total = res.total;
    }
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
  min-height: 630px;
}

.el-table {
  margin-top: 20px;
}

.el-row {
  margin-top: 30px;
}

.el-pagination {
  margin-top: 30px;
}

.el-checkbox.is-bordered.el-checkbox--mini {
  padding: 3px 10px 3px 10px;
}

.el-checkbox {
  margin-top: 11px;
  margin-right: 12px;
}
</style>
