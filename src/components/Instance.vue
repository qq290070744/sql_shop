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
            <el-tag v-if="scope.row.type==='master'" type="success">master</el-tag>
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
            <el-button
                type="danger"
                size="mini"
                @click="handlerClearBinlog(scope.row)"
            >binlog清理
            </el-button>
            <el-button
                type="primary"
                size="mini"
                @click="dialogTableVisible_instance_monitor = true;rowid=scope.row.id;"
            >实例监控
            </el-button>
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

    <el-dialog
        :title="dialogTitleBinlog"
        :visible.sync="dialogVisibleBinlog"
        width="40%"
        @close="handleCancelBlog"
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
              :disabled="autofocus"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="主机地址" prop="host">
          <el-input
              placeholder="请输入内容"
              prefix-icon="iconfont icon-database"
              v-model="formData.host"
              style="width: 80%"
              disabled
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="主机端口" prop="port" disabled>
          <el-input
              placeholder="请输入内容"
              prefix-icon="iconfont icon-duankoutance"
              v-model.number="formData.port"
              style="width: 80%"
              disabled
              clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="binlog" prop="port">
          <el-select v-model="formData.binlog" placeholder="请选择binlog">
            <el-option
                v-for="item in formData.binlog_list"
                :key="item[0]"
                :label="item"
                :value="item[0]">
            </el-option>
          </el-select>
        </el-form-item>
        <p>提示：该binlog前的所有binlog都会被删除！</p>
        <el-form-item>
          <el-row :gutter="15">
            <el-col :span="10">
              <el-button @click="handleCancelBlog()">取消</el-button>
            </el-col>
            <el-col :span="13">
              <el-button type="primary" @click="del_binlog()">确 定</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog style="width: 100%;" title="实例监控" :visible.sync="dialogTableVisible_instance_monitor">
      <el-table :data="instance_monitor_data">
        <el-table-column property="time" label="时间"></el-table-column>
        <el-table-column label=" -QPS- -TPS- ">
          <el-table-column property="ins" label="ins"></el-table-column>
          <el-table-column property="upd" label="upd"></el-table-column>
          <el-table-column property="del" label="del"></el-table-column>
          <el-table-column property="sel" label="sel"></el-table-column>
          <el-table-column property="iud" label="iud"></el-table-column>
        </el-table-column>

        <el-table-column label=" -Hit%- ">
          <el-table-column property="lor" label="lor"></el-table-column>
          <el-table-column property="hit" label="hit"></el-table-column>
        </el-table-column>

        <el-table-column label=" -innodb rows status- ">
          <el-table-column property="innodb_rows_inserted_diff" label="ins"></el-table-column>
          <el-table-column property="innodb_rows_updated_diff" label="upd"></el-table-column>
          <el-table-column property="innodb_rows_deleted_diff" label="del"></el-table-column>
          <el-table-column property="innodb_rows_read_diff" label="read"></el-table-column>
        </el-table-column>

        <el-table-column label="-innodb bp pages status-">
          <el-table-column property="data" label="data"></el-table-column>
          <el-table-column property="free" label="free"></el-table-column>
          <el-table-column property="dirty" label="dirty"></el-table-column>
          <el-table-column property="flush" label="flush"></el-table-column>
        </el-table-column>

        <el-table-column label="-innodb data status-">
          <el-table-column property="reads" label="reads"></el-table-column>
          <el-table-column property="writes" label="writes"></el-table-column>
          <el-table-column property="readed" label="readed"></el-table-column>
          <el-table-column property="written" label="written"></el-table-column>
        </el-table-column>

        <el-table-column label="--innodb log--">
          <el-table-column property="innodb_os_log_fsyncs_diff" label="fsyncs"></el-table-column>
          <el-table-column property="innodb_os_log_written_diff" label="written"></el-table-column>
        </el-table-column>

        <el-table-column label="his --log(byte)--  read --query--">
          <el-table-column property="list" label="list"></el-table-column>
          <el-table-column property="uflush" label="uflush"></el-table-column>
          <el-table-column property="uckpt" label="uckpt"></el-table-column>
          <el-table-column property="view" label="view"></el-table-column>
          <el-table-column property="inside" label="inside"></el-table-column>
          <el-table-column property="que" label="que"></el-table-column>
        </el-table-column>

        <el-table-column label="--threads--">
          <el-table-column property="run" label="run"></el-table-column>
          <el-table-column property="con" label="con"></el-table-column>
          <el-table-column property="cre" label="cre"></el-table-column>
          <el-table-column property="cac" label="cac"></el-table-column>
        </el-table-column>

        <el-table-column label="--bytes--">
          <el-table-column property="recv" label="recv"></el-table-column>
          <el-table-column property="send" label="send"></el-table-column>
        </el-table-column>

      </el-table>
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
      dialogTableVisible_instance_monitor: false,
      instance_monitor_data: [],
      autofocus: true,
      dialogTitle: "添加实例",
      dialogTitleBinlog: "清理Binlog日志",
      tableData: [],
      total: 0,
      dialogVisible: false,
      dialogVisibleBinlog: false,
      formData: {
        id: 0,
        ins_name: "",
        host: "",
        port: 3306,
        user: "",
        password: "",
        type: "master",
        status: "1",
        binlog_list: [],
        binlog: ""
      },
      formRule: {
        ins_name: [
          {required: true, message: "请输入实例名称", trigger: "blur"}
        ],
        host: [
          {required: true, message: "请输入服务器地址", trigger: "blur"},
          {validator: checkHost, trigger: "blur"}
        ],
        port: [
          {required: true, message: "请输入服务器端口", trigger: "blur"},
          {type: "number", message: "端口只能是数字类型", trigger: "change"}
        ],
        user: [{required: true, message: "请输入账号", trigger: "blur"}],
        password: [{required: true, message: "请输入密码", trigger: "blur"}],
        type: [{required: true, message: "请选择主从类型", trigger: "change"}]
      },
      queryInfo: {
        ins_name: "",
        page: 1,
        limit: 5
      },
      timer: '',
      rowid: '',
    };
  },
  async created() {
    await this.getinstance();
  },
  async mounted() {
    this.timer = setInterval(await this.instance_monitor, 5000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    async handlerClearBinlog(row) {
      const {data: res} = await this.$ajax.get(`/binlog_list/?id=${row.id}`);
      this.formData = res.data.ins;
      this.formData.id = row.id;
      this.formData.binlog_list = res.data.binlog_list;
      this.dialogVisibleBinlog = true;
      this.dialogTitleBinlog = "清理Binlog日志";
      this.autofocusBinlog = false;
    },
    async handlerEdit(row) {
      const {data: res} = await this.$ajax.get(`/instance/?id=${row.id}`);
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
            const {data: res} = await this.$ajax.delete(
                `/instance/?id=${row.id}`
            );
            if (res.msg !== "success") return this.message.error("删除失败");
            await this.getinstance();
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
          var {data: res} = await this.$ajax.post(
              "/instance/",
              this.formData
          ).catch(() => {
            return this.$notify.error({title: '错误', message: '发起创建实例失败'})
          });
        } else {
          var {data: res} = await this.$ajax.patch(
              "/instance/",
              this.formData
          ).catch(() => {
            return this.$notify.error({title: '错误', message: '发起创建实例失败'})
          });
        }
        if (res.msg !== "success") {
          return this.$message.error(res.msg);
        }
        this.dialogVisible = false;
        this.resetForm();
        await this.getinstance();
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
        const {data: res} = await this.$ajax.post(
            "/concheck/",
            this.formData
        );
        if (res.msg !== "success") {
          loading.close();
          return this.$message.error(res.msg);
        }
        loading.close();
        return this.$message.success("连接成功");
      });
    },
    // console.log(res)
    handleCancel() {
      // this.resetForm();
      this.dialogVisible = false;
    },
    handleCancelBlog() {
      this.resetForm();
      this.dialogVisibleBinlog = false;
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
      const {data: tab} = await this.$ajax.get("/instance/", {
        params: this.queryInfo
      });
      // console.log(res)
      if (tab.msg !== "success") return this.$message.error("查询实例失败");
      for (const item of tab.data) {
        const {data: res} = await this.$ajax.post(
            `/concheck2/?id=${item.id}`
        );
        res.msg === "success"
            ? this.$set(item, "status", "1")
            : this.$set(item, "status", "0");
      }
      this.tableData = tab.data;
      this.total = tab.total;
    },
    handlerClear() {
      this.getinstance();
    },
    async getinstance() {
      const {data: tab} = await this.$ajax.get("/instance/", {
        params: this.queryInfo
      });
      if (tab.msg !== "success") return this.$message.error("实例列表获取失败");
      for (const item of tab.data) {
        const {data: res} = await this.$ajax.post(
            `/concheck2/?id=${item.id}`
        );
        res.msg === "success"
            ? this.$set(item, "status", "1")
            : this.$set(item, "status", "0");
      }
      this.tableData = tab.data;
      this.total = tab.total;
    },
    async del_binlog() {
      if (!this.formData.binlog) return this.$message.error("请选择要清理的binlog");
      const {data: tab} = await this.$ajax.post("/del_binlog/", {'binlog': this.formData.binlog, id: this.formData.id});
      if (tab.msg !== "success") return this.$message.error("清理失败");
      this.$message({
        message: '清理成功',
        type: 'success'
      });
      this.dialogVisibleBinlog = false
    },
    async instance_monitor() {
      if (this.dialogTableVisible_instance_monitor) {
        const {data: tab} = await this.$ajax.get(`/instance_monitor/?id=${this.rowid}`,);
        if (tab.msg !== "success") return this.$message.error("请求失败");
        this.instance_monitor_data.push(tab.data)
        this.instance_monitor_data.reverse()
        this.instance_monitor_data = this.instance_monitor_data.slice(0, 5)
      } else {
        this.instance_monitor_data = []
      }
      // this.dialogTableVisible_instance_monitor = false
    },

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

.el-dialog {
  width: 1000px !important;
}
</style>
