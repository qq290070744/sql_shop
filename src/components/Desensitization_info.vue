<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>脱敏字段管理</el-breadcrumb-item>
      <el-breadcrumb-item>获取脱敏字段列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-col :span="4">
        <el-button type="primary" @click="handlerAdd">添加</el-button>
      </el-col>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例名称" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="字段" prop="field" align="center" header-align="center"></el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
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
          :current-page="offset"
          :page-sizes="[5,10,20,50]"
          :page-size="limit"
          :hide-on-single-page="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog
        :title="'添加脱敏字段'"
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
        <el-form-item label="实例名称" prop="instance_id">
          <el-select
              v-model="formData.instance_id"
              placeholder="请选择实例地址"
              style="width: 200px;"
              @change="get_db()"
          >
            <el-option
                v-for="item in options"
                :key="item.id"
                :value="item.id"
                :label="item.ins_name+'/'+item.host"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据库" prop="dbname">
          <el-select
              v-model="formData.dbname"
              filterable
              placeholder="请选择数据库"
              style="width: 200px;"
          >
            <el-option v-for="item in dbs" :key="item.db" :value="item.db" :label="item.db"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字段" prop="field">
          <el-input
              placeholder="请输入内容"
              prefix-icon="iconfont icon-duankoutance"
              v-model="formData.field"
              style="width: 80%"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-row :gutter="15">
            <el-col :span="10">
              <el-button @click="handleCancel()">取消</el-button>
            </el-col>
            <el-col :span="13">
              <el-button type="primary" @click="handlerCommit('formRef')">确 定</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import hljs from "highlight.js";
import sqlFormatter from "sql-formatter";

export default {
  data() {
    return {
      tableData: [],
      offset: 1,
      limit: 5,
      total: 0,
      dialogTitle: "添加脱敏字段",
      dialogVisible: false,
      formData: {
        instance_id: "",
        dbname: "",
        field: ""
      },
      formRule: {
        instance_id: [{required: true, message: "请选择实例", trigger: "change"}],
        dbname: [{required: true, message: "请选择数据库", trigger: "change"}],
        field: [{required: true, message: "请输入字段", trigger: "blur"}]
      },
      dbs: [],
    };
  },
  mounted() {
    this.get_desensitization_info_list();
    this.get_ins();
  },
  methods: {
    handleSizeChange(val) {
      this.limit = val;
      this.get_desensitization_info_list();
    },
    handleCurrentChange(val) {
      this.offset = val;
      this.get_desensitization_info_list();
    },
    handlerAdd() {
      this.dialogVisible = true;
      this.autofocus = true;
    },
    handleCancel() {
      // this.resetForm();
      this.dialogVisible = false;
    },
    async get_desensitization_info_list() {
      const {data: res} = await this.$ajax
          .get(`/get_desensitization_info_list/?offset=${this.offset}&limit=${this.limit}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg != "success") return this.$message.error("获取失败");
      this.tableData = res.data;
      this.total = res.count;
    },
    async get_db() {
      this.dbs = [];
      this.tabs = [];
      const {data: res} = await this.$ajax
          .get(`/get_schema/?id=${this.formData.instance_id}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "获取数据库失败，请检查实例连接配置"
            });
          });
      if (res.msg !== "success")
        return this.$message.error("获取数据库失败，请检查实例连接状态");
      this.dbs = res.data;
    },
    async get_ins() {
      const {data: res} = await this.$ajax.get("/get_ins/").catch(() => {
        return this.$notify.error({title: "错误", message: "获取实例失败"});
      });
      if (res.msg != "success") return this.$message.error("获取实例失败");
      this.options = res.data;
    },
    handlerCommit(form) {
      this.$refs[form].validate(async valid => {
        if (!valid) {
          return this.$message.error("请正确填写必要信息");
        }
        const {data: res} = await this.$ajax
            .post("/add_desensitization_info/", {id: this.formData.instance_id, dbname: this.formData.dbname, field: this.formData.field})
            .catch(() => {
              this.$notify.error({title: "错误", message: "请求失败"});
            });
        if (res.msg != "success") {
          this.isRet = false;
          return this.$message.error(res.msg);
        }
        this.dialogVisible = false;
        await this.get_desensitization_info_list();
      });
    },
      handlerDelete(row) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning"
      })
          .then(async () => {
            const {data: res} = await this.$ajax.delete(
                `/del_desensitization_info/${row.id}`
            );
            if (res.msg != "success") return this.message.error("删除失败");
            await this.get_desensitization_info_list();
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
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
  min-height: 630px;
}
</style>
<style>
.steps_class .el-step__title {
  font-size: 10px;
  line-height: 38px;
}

.iconfon {
  font-size: 11px;
  width: 18px;
  height: 18px;
}

.el-pagination {
  margin-top: 20px;
}

.el-step__icon.is-icon {
  width: 20px !important;
}

.el-step__icon-inner[class*="el-icon"]:not(.is-status) {
  color: #67c23a;
}

.el-step__head.is-finish {
  height: 24px !important;
  color: #67c23a !important;
}

.el-step__title.is-finish {
  height: 37.6px !important;
  color: #67c23a !important;
}
</style>