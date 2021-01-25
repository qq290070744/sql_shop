<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实例管理</el-breadcrumb-item>
      <el-breadcrumb-item>会话管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="选择实例">
          <el-select
              v-model="selectHost"
              placeholder="请选择实例地址"
              @change="processlist"
          >
            <el-option
                v-for="item in options"
                :key="item.id"
                :value="item.id"
                :label="item.ins_name+'/'+item.host"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择command_type">
          <el-select
              v-model="command_type"
              placeholder="command_type"
              @change="processlist"
          >
            <el-option
                v-for="item in ['Query','Not Sleep','All']"
                :key="item"
                :value="item"
                :label="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据库名">
          <el-input v-model="database" placeholder="数据库名"></el-input>
        </el-form-item>

        <el-button @click="toggleSelection()">取消选择</el-button>
        <el-button type="primary" @click="processlist">搜索</el-button>
        <el-button type="danger" @click="kill_session_select">终止选中会话</el-button>
      </el-form>

      <el-table
          ref="multipleTable"
          tooltip-effect="dark"
          @selection-change="handleSelectionChange"
          :data="tbs" style="width: 100%" border stripe>
        <el-table-column label="#" type="selection" align="center" header-align="center"></el-table-column>
        <el-table-column label="THEEAD ID" prop="id" align="center" header-align="center"></el-table-column>
        <el-table-column label="USER" prop="user" align="center" header-align="center"></el-table-column>
        <el-table-column label="HOST" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="DATABASE" prop="db" align="center" header-align="center"></el-table-column>
        <el-table-column label="TIME/s" prop="time" align="center" header-align="center"></el-table-column>
        <el-table-column label="COMMAND" prop="command" align="center" header-align="center"></el-table-column>
        <el-table-column label="STATE" prop="state" align="center" header-align="center"></el-table-column>
        <el-table-column label="INFO" align="center" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.info.slice(0,50)"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.info);" size="mini" round>查看全部sql</el-button>
            <el-button type="success" @click="sqlscore(scope.row);" size="mini" round>获取优化建议</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="danger" @click="kill_session(scope.row.id);" size="mini" round>kill</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="SQL审核结果" :visible="dialogVisible" width="75%" @close="closeDialog">
        <div
            style="min-height: 500px"
            v-loading="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
        >
          <markdown-it-vue :content="result"/>
          <el-row v-if="!loading">
            <el-col :push="18">
              <el-button type="info" @click="closeDialog">关闭</el-button>
            </el-col>
          </el-row>
        </div>
      </el-dialog>

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
      command_type: 'Query',
      multipleSelection: [],
      database: '',
      queryInfo: {
        selectHost: "",
        selectDb: "",
        sql: "",
        "offset": 0,
        "limit": 0,
        "limit2": 0
      },
      result: "",
      loading: true,
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
    async sqlFormat() {
      this.editor.setValue(sqlFormatter.format(this.editor.getValue()));
    },
    async processlist() {
      const {data: res} = await this.$ajax
          .post("/processlist/", {"id": this.selectHost, "command_type": this.command_type, "database": this.database})
          .catch(() => {
            return this.$notify.error({title: "错误", message: "请求失败"});
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
      this.tbs = res.data;
    },
    async alert_sql(sql) {
      sql = sqlFormatter.format(sql);
      sql = hljs.highlight("sql", sql).value;
      await this.$alert('<pre>' + sql + '</pre>', 'sql', {
        dangerouslyUseHTMLString: true,
      });
    },
    async handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async toggleSelection(rows) {
      console.log(this.multipleSelection)
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    async kill_session(threadID) {
      const {data: res} = await this.$ajax
          .post("/kill_session/", {"id": this.selectHost, "threadID": threadID})
          .catch(() => {
            return this.$notify.error({title: "错误", message: "请求失败"});
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
    },
    async kill_session_select() {
      console.log(this.multipleSelection)
      for (const i in this.multipleSelection) {
        await this.kill_session(this.multipleSelection[i].id)
      }
    },
    async sqlscore(row) {
      this.queryInfo.sql = row.info
      this.queryInfo.selectHost = this.selectHost
      this.queryInfo.selectDb = row.db
      this.dialogVisible = true;
      const {data: res} = await this.$ajax
          .post("/sqlscore/", this.queryInfo)
          .catch(() => {
            this.$notify.error({
              title: "错误",
              message: "提交失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("SQL审核失败");
      this.result = res.data.join("");
      this.loading = false;

    },
    async closeDialog() {
      this.dialogVisible = false;
      this.result = "";
      this.loading = true;
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
