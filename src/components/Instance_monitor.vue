<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实例管理</el-breadcrumb-item>
      <el-breadcrumb-item>实时监控</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="选择实例">
          <el-select
              v-model="selectHost"
              placeholder="请选择实例地址"
              @change="instance_monitor"
          >
            <el-option
                v-for="item in options"
                :key="item.id"
                :value="item.id"
                :label="item.ins_name+'/'+item.host"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="instance_monitor">刷新</el-button>
      </el-form>

      <el-table :data="tbs">
        <el-table-column property="time" label="时间"></el-table-column>
        <el-table-column label=" -QPS- -TPS- ">
          <el-table-column property="ins" label="ins"></el-table-column>
          <el-table-column property="upd" label="upd"></el-table-column>
          <el-table-column property="del" label="del"></el-table-column>
          <el-table-column property="sel" label="sel"></el-table-column>
          <el-table-column property="iud" label="iud"></el-table-column>
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
      timer: '',
    };
  },
  async mounted() {
    await this.get_ins();
    this.timer = setInterval(await this.instance_monitor, 5000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
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
    async instance_monitor() {
      const {data: tab} = await this.$ajax.get(`/instance_monitor/?id=${this.selectHost}`,);
      if (tab.msg !== "success") return this.$message.error("请求失败");
      this.tbs.unshift(tab.data)
      this.tbs = this.tbs.slice(0, 10)
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
