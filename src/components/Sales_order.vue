<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>SQL执行</el-breadcrumb-item>
      <el-breadcrumb-item>销量查询</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <span class="demonstration">选择日期时间:</span>
        <el-date-picker
            v-model="date_time"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            :picker-options="pickerOptions">
        </el-date-picker>
        <el-button type="primary" @click="get_sales_order">查询</el-button>
      </el-form>

      <el-table :data="tbs" style="width: 100%" border stripe>
          <el-table-column label="minutess" prop="minutess" align="center" header-align="center"></el-table-column>
          <el-table-column label="orders" prop="orders" align="center" header-align="center"></el-table-column>
          <el-table-column label="sales" prop="sales" align="center" header-align="center"></el-table-column>
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
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },
      date_time: '',
    };
  },
  mounted() {
  },
  methods: {
    async get_sales_order() {
      let date_time;
      date_time = Date.parse(this.date_time) / 1000;
      const {data: res} = await this.$ajax
          .get(`/get_sales_order?date_time=${date_time}`)
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
