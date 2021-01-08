<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实例管理</el-breadcrumb-item>
      <el-breadcrumb-item>Top表空间</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="选择实例">
          <el-select
              v-model="selectHost"
              placeholder="请选择实例地址"
              @change="tablesapce"
          >
            <el-option
                v-for="item in options"
                :key="item.id"
                :value="item.id"
                :label="item.ins_name+'/'+item.host"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="tablesapce">刷新</el-button>
      </el-form>

      <el-table
          :data="tbs" style="width: 100%" border stripe>
        <el-table-column label="数据库" prop="table_schema" align="center" header-align="center"></el-table-column>
        <el-table-column label="表名" prop="table_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="存储引擎" prop="engine" align="center" header-align="center"></el-table-column>
        <el-table-column sortable label="总空间(MB)" prop="total_size" align="center" header-align="center"></el-table-column>
        <el-table-column sortable label="行数" prop="table_rows" align="center" header-align="center"></el-table-column>
        <el-table-column sortable label="数据空间(MB)" prop="data_size" align="center" header-align="center"></el-table-column>
        <el-table-column sortable label="索引空间(MB)" prop="index_size" align="center" header-align="center"></el-table-column>
        <el-table-column sortable label="碎片空间(MB)" prop="data_free" align="center" header-align="center"></el-table-column>
        <el-table-column sortable label="碎片率(%)" prop="pct_free" align="center" header-align="center"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import sqlFormatter from "sql-formatter";
import hljs from "highlight.js";
import MarkdownItVue from "markdown-it-vue";
import {formatTimeToStr} from "../plugins/dateformat";

let CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/selection/active-line");
require("codemirror/mode/sql/sql");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/sql-hint");

export default {
  components: {
    MarkdownItVue
  },
  name: "Query",
  data() {
    return {
      options: [],
      selectHost: '',
      tbs: [],
    };
  },
  mounted() {
    this.get_ins();
  },
  methods: {
    async get_ins() {
      const {data: res} = await this.$ajax
          .get("/instance/")
          .catch(() => {
            return this.$notify.error({title: "错误", message: "获取实例失败"});
          });
      if (res.msg !== "success") return this.$message.error("获取实例失败");
      this.options = res.data;
    },
    async tablesapce() {
      const {data: res} = await this.$ajax
          .post("/tablesapce/", {"id": this.selectHost,})
          .catch(() => {
            return this.$notify.error({title: "错误", message: "请求失败"});
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
      this.tbs = res.data;
    },

  }
};
</script>

<style lang="less">
.el-card {
  margin-top: 20px;
  min-height: 630px;
}

ul {
  margin-top: 0;
  padding: 0 0 0 0;
}

.el-form-item__label {
  color: black;
  font-weight: 600;
}

.el-dialog__wrapper {
  overflow: auto;
  overflow-x: hidden;
}


.el-tag {
  margin-top: 5px;
  margin-inline-end: 5px;
}

.CodeMirror-scroll {
  padding-bottom: 10px;
}
</style>
