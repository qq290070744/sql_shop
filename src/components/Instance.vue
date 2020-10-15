<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实例管理</el-breadcrumb-item>
      <el-breadcrumb-item>实例列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input
            v-model="queryInfo.ins_name"
            clearable
            prefix-icon="el-icon-search"
            placeholder="输入实例名"
            @clear="handlerClear"
            @change="handlerChange"
          ></el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handlerAdd">添加</el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" border stripe>
        <el-table-column label="序号" type="index" width="50px"></el-table-column>
        <el-table-column prop="ins_name" label="实例名称" sortable align="center" header-align="center"></el-table-column>
        <el-table-column prop="user" label="账号" align="center" header-align="center"></el-table-column>
        <el-table-column prop="host" label="主机" align="center" header-align="center"></el-table-column>
        <el-table-column prop="port" label="端口" align="center" header-align="center"></el-table-column>
        <el-table-column prop="type" label="主从类型" align="center" header-align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type=='master'" type="success">master</el-tag>
            <el-tag v-else type="info">slave</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" header-align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==='1'" type="success" class="iconfont icon-zhengchang"></el-tag>
            <el-tag v-if="scope.row.status==='0'" type="danger" class="iconfont icon-yichang"></el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="handlerEdit(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="handlerDelete(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[5,10,20,50]"
        :page-size="queryInfo.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :hide-on-single-page="true"
      ></el-pagination>
    </el-card>
    <el-dialog
      :title="autofocus ? '添加新的实例':'编辑实例'"
      :visible.sync="dialogVisible"
      width="40%"
      @close="handleCancel"
    >
      <el-form
        :model="formData"
        :rules="formRule"
        ref="formRef"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="实例名称" prop="ins_name">
          <el-input
            placeholder="请输入内容"
            prefix-icon="iconfont icon-host"
            v-model="formData.ins_name"
            style="width: 80%"
            :autofocus="autofocus"
            :disabled="!autofocus"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="主机地址" prop="host">
          <el-input
            placeholder="请输入内容"
            prefix-icon="iconfont icon-database"
            v-model="formData.host"
            style="width: 80%"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="主机端口" prop="port">
          <el-input
            placeholder="请输入内容"
            prefix-icon="iconfont icon-duankoutance"
            v-model.number="formData.port"
            style="width: 80%"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="user">
          <el-input
            placeholder="请输入内容"
            prefix-icon="iconfont icon-account"
            v-model="formData.user"
            style="width: 80%"
            autofocus
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            placeholder="请输入内容"
            prefix-icon="iconfont icon-password"
            v-model="formData.password"
            show-password
            style="width: 80%"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="主从类型" prop="type">
          <el-radio v-model="formData.type" label="master">master</el-radio>
          <el-radio v-model="formData.type" label="slave">slave</el-radio>
        </el-form-item>
        <el-form-item>
          <el-row :gutter="15">
            <el-col :span="10">
              <el-button @click="handleCancel()">取消</el-button>
              <el-button v-if="autofocus" @click="resetForm" type="info">重置</el-button>
            </el-col>
            <el-col :span="13">
              <el-button @click="headlerCheck('formRef')" type="info">连接测试</el-button>
              <el-button type="primary" @click="handlerCommit('formRef')">确 定</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import qs from "qs";
import "../assets/fonts/iconfont.css";

export default {
  data() {
    var checkHost = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入服务器地址"));
      }
      var rule = /\d+\.\d+\.\d+\.\d+/g;
      if (!rule.exec(value)) {
        return callback(new Error("请输入正确的服务器地址"));
      }
      return callback();
    };
    return {
      autofocus: true,
      dialogTitle: "添加实例",
      tableData: [],
      total: 0,
      dialogVisible: false,
      formData: {
        ins_name: "",
        host: "",
        port: 3306,
        user: "",
        password: "",
        type: "master",
        status: "1"
      },
      formRule: {
        ins_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" }
        ],
        host: [
          { required: true, message: "请输入服务器地址", trigger: "blur" },
          { validator: checkHost, trigger: "blur" }
        ],
        port: [
          { required: true, message: "请输入服务器端口", trigger: "blur" },
          { type: "number", message: "端口只能是数字类型", trigger: "change" }
        ],
        user: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        type: [{ required: true, message: "请选择主从类型", trigger: "change" }]
      },
      queryInfo: {
        ins_name: "",
        page: 1,
        limit: 5
      }
    };
  },
  created() {
    this.getinstance();
  },
  methods: {
    async handlerEdit(row) {
      const { data: res } = await this.$ajax.get(`/instance/?id=${row.id}`);
      this.formData = res.data[0];
      this.dialogVisible = true;
      this.dialogTitle = "编辑实例";
      this.autofocus = false;
    },
    handlerDelete(row) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$ajax.delete(
            `/instance/?id=${row.id}`
          );
          if (res.msg != "success") return this.message.error("删除失败");
          this.getinstance();
          // console.log(res)
          this.$message({
            type: "success",
            message: "删除成功!"
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
        if (!valid) {
          return this.$message.error("请正确填写必要信息");
        }
        if (this.autofocus) {
          var { data: res } = await this.$ajax.post(
            "/instance/",
            this.formData
          ).catch(()=>{
            return this.$notify.error({title:'错误',message:'发起创建实例失败'})
          });
        } else {
          var { data: res } = await this.$ajax.patch(
            "/instance/",
            this.formData
          ).catch(()=>{
            return this.$notify.error({title:'错误',message:'发起创建实例失败'})
          });
        }
        if (res.msg != "success") {
          return this.$message.error(res.msg);
        }
        this.dialogVisible = false;
        this.resetForm();
        this.getinstance();
        return this.autofocus
          ? this.$message.success("添加实例成功")
          : this.$message.success("修改实例成功");
      });
    },
    headlerCheck(form) {
      this.$refs[form].validate(async valid => {
        if (!valid) {
          return this.$message.error("请正确填写必要信息");
        }
        const loading = this.$loading({
          lock: true,
          text: "Loading",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
        const { data: res } = await this.$ajax.post(
          "/concheck/",
          this.formData
        );
        if (res.msg != "success") {
          loading.close();
          return this.$message.error(res.msg);
        }
        loading.close();
        return this.$message.success("连接成功");
      });
    },
    // console.log(res)
    handleCancel() {
      this.resetForm();
      this.dialogVisible = false;
    },
    resetForm() {
      // console.log(this.$refs[form])

      this.formData.ins_name = "";
      this.formData.host = "";
      this.formData.port = 3306;
      this.formData.user = "";
      this.formData.password = "";
      this.formData.type = "master";
    },
    handlerAdd() {
      this.dialogVisible = true;
      this.autofocus = true;
    },
    handleSizeChange(val) {
      this.queryInfo.limit = val;
      this.getinstance();
    },
    handleCurrentChange(val) {
      this.queryInfo.page = val;
      this.getinstance();
    },
    async handlerChange() {
      const { data: tab } = await this.$ajax.get("/instance/", {
        params: this.queryInfo
      });
      // console.log(res)
      if (tab.msg != "success") return this.$message.error("查询实例失败");
      tab.data.forEach(async item => {
        const { data: res } = await this.$ajax.post(
          `/concheck2/?id=${item.id}`
        );
        res.msg === "success"
          ? this.$set(item, "status", "1")
          : this.$set(item, "status", "0");
      });
      this.tableData = tab.data;
      this.total = tab.total;
    },
    handlerClear() {
      this.getinstance();
    },
    async getinstance() {
      const { data: tab } = await this.$ajax.get("/instance/", {
        params: this.queryInfo
      });
      if (tab.msg != "success") return this.$message.error("实例列表获取失败");
      tab.data.forEach(async item => {
        const { data: res } = await this.$ajax.post(
          `/concheck2/?id=${item.id}`
        );
        res.msg === "success"
          ? this.$set(item, "status", "1")
          : this.$set(item, "status", "0");
      });
      this.tableData = tab.data;
      this.total = tab.total;
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
  width: 100%;
}

.el-pagination {
  margin-top: 20px;
}

.el-row {
  margin-top: 20px;
}
</style>
