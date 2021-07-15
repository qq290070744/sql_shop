<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实例管理</el-breadcrumb-item>
      <el-breadcrumb-item>事务信息</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="选择实例">
          <el-select
              v-model="selectHost"
              placeholder="请选择实例地址"
              @change="innodb_trx"
          >
            <el-option
                v-for="item in options"
                :key="item.id"
                :value="item.id"
                :label="item.ins_name+'/'+item.host"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="innodb_trx">刷新</el-button>
      </el-form>

      <el-table
          :data="tbs" style="width: 100%" border stripe>
        <el-table-column label="trx_id"  prop="trx_id" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_started" prop="trx_started" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_idle_time" prop="trx_idle_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_state" prop="trx_state" align="center" header-align="center"></el-table-column>
        <el-table-column label="user" prop="user" align="center" header-align="center"></el-table-column>
        <el-table-column label="host" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="db" prop="db" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_mysql_thread_id" prop="trx_mysql_thread_id" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_operation_state" prop="trx_operation_state" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_tables_locked" prop="trx_tables_locked" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_rows_locked" prop="trx_rows_locked" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_rows_modified" prop="trx_rows_modified" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_is_read_only" prop="trx_is_read_only" align="center" header-align="center"></el-table-column>
        <el-table-column label="trx_isolation_level" prop="trx_isolation_level" align="center" header-align="center"></el-table-column>
        <el-table-column label="thread_time" prop="thread_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="info" prop="info" align="center" header-align="center"></el-table-column>
        <!--        <el-table-column-->
        <!--            align="center"-->
        <!--            header-align="center"-->
        <!--            v-for="item in tbs"-->
        <!--            :key="item"-->
        <!--            :prop="item"-->
        <!--            :label="item"-->
        <!--            show-overflow-tooltip-->
        <!--        >-->
        <!--        </el-table-column>-->
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
    async innodb_trx() {
      const {data: res} = await this.$ajax
          .post("/innodb_trx/", {"id": this.selectHost,})
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
