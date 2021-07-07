<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>SQL执行</el-breadcrumb-item>
      <el-breadcrumb-item>执行shell</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :model="queryInfo" ref="queryRef" :rules="queryRules" label-position="left">
        <el-row>
          <el-col :span="17">
            <el-form-item label="cmd:" prop="cmd">
              <textarea ref="mycode" v-model="queryInfo.cmd" rows="20"></textarea>
            </el-form-item>
          </el-col>

        </el-row>
        <el-row :gutter="60">
          <el-col :span="6">
            <el-button type="primary" @click="commitForm('queryRef')">提交</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-table :data="exec_shell_log_list" style="width: 100%" border stripe>
      <el-table-column prop="create_time" label="时间" sortable align="center" header-align="center"></el-table-column>
      <el-table-column prop="log_name" label="查看日志" sortable align="center" header-align="center">
        <template slot-scope="scope">
          <el-button type="primary" @click="tail_exec_shell_log(scope.row.log_name);" size="mini" round>查看日志</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="cmd" label="cmd" sortable align="center" header-align="center">
        <pre><div v-html="scope.row.cmd.slice(0,10)"></div></pre>
        <el-button type="primary" @click="alert_remark(scope.row.cmd);" size="mini" round>查看全部命令</el-button>
      </el-table-column>
    </el-table>

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
      queryInfo: {
        cmd: "",
      },
      exec_shell_log_list: [],
    };
  },
  mounted() {
    this.init();
    this.get_exec_shell_log_list();
  },
  methods: {
    init() {
      (this.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
        mode: "text/shell", //选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        theme: "dracula",
        styleActiveLine: true,
        autoRefresh: true,
        foldGutter: true,
        completeSingle: false,
        placeholder:
            "-- Tips:",
        extraKeys: {Tab: "autocomplete"}, //自定义快捷键
        hintOptions: {
          //自定义提示选项
          tables: {}
        }
      })),
          this.editor.setSize("800px", "450px");
    },
    sqlFormat() {
      this.editor.setValue(sqlFormatter.format(this.editor.getValue()));
    },
    async commitForm(form) {
      this.queryInfo.cmd = this.editor.getValue()
      this.$refs[form].validate(async valid => {
        if (!valid) return this.$message.error("请选择/填写必要项");
        this.queryInfo.cmd = this.editor.getValue();
        const {data: res} = await this.$ajax
            .post("/exec_shell/", this.queryInfo)
            .catch(() => {
              return this.$notify.error({
                title: "请求失败",
                message: "发起请求失败"
              });
            });
        if (res.msg !== "success") return this.$message.error("失败");
        if (res.data) {
        } else {
          this.$message.success("提交成功！");
          await this.get_exec_shell_log_list();
        }
      });
    },
    async get_exec_shell_log_list() {
      const {data: res} = await this.$ajax
          .get("/get_exec_shell_log_list/")
          .catch(() => {
            return this.$notify.error({title: "错误", message: "获取失败"});
          });
      if (res.msg !== "success") return this.$message.error("获取失败");
      this.exec_shell_log_list = res.data;
    },
    async tail_exec_shell_log(log_name) {
      const {data: res} = await this.$ajax
          .get(`/tail_exec_shell_log/?log_name=${log_name}`)
          .catch(() => {
            return this.$notify.error({title: "错误", message: "获取失败"});
          });
      if (res.msg !== "success") return this.$message.error("获取失败");
      await this.alert_remark(res.data)
    },
    async alert_remark(remark) {
      await this.$alert('<pre>' + remark + '</pre>', '详细', {
        dangerouslyUseHTMLString: true,
      });
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
