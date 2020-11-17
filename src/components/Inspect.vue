<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>SQL执行</el-breadcrumb-item>
      <el-breadcrumb-item>CRUD</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :model="queryInfo" ref="queryRef" :rules="queryRules" label-position="left">
        <el-row>
          <el-col :span="8">
            <el-form-item label="实例名称/地址:" prop="selectHost" label-width="150px">
              <el-select
                  v-model="queryInfo.selectHost"
                  placeholder="请选择实例地址"
                  style="width: 250px;"
                  @change="get_db('queryRef')"
              >
                <el-option
                    v-for="item in options"
                    :key="item.id"
                    :value="item.id"
                    :label="item.ins_name+'/'+item.host"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数据库:" prop="selectDb" label-width="150px">
              <el-select
                  v-model="queryInfo.selectDb"
                  filterable
                  placeholder="请选择数据库"
                  @change="getTable"
                  style="width: 250px;"
              >
                <el-option v-for="item in dbs" :key="item.db" :value="item.db" :label="item.db"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="审批主管: " prop="manager" label-width="150px">
              <el-select placeholder="请选择审批主管" style="width: 250px;" v-model="queryInfo.manager">
                <el-option
                    v-for="item in manager"
                    :key="item.id"
                    :value="item.id"
                    :label="item.username"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="审批DBA: " prop="dba" label-width="150px">
              <el-select placeholder="请选择审批DBA" style="width: 250px;" v-model="queryInfo.dba">
                <el-option
                    v-for="item in dba"
                    :key="item.id"
                    :value="item.id"
                    :label="item.username"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="17">
            <el-form-item label="SQL:" prop="sql">
              <textarea ref="mycode" v-model="queryInfo.sql" rows="20"></textarea>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <ul style="overflow: auto">
              <el-collapse
                  v-model="activeName"
                  accordion
                  style="max-height: 450px"
                  @change="getDesc"
              >
                <el-collapse-item style="width: 100%" v-for="item in tabs" :key="item" :title="item" :name="item">
                  <!--                  <div v-html="desc"></div>-->
                </el-collapse-item>
              </el-collapse>
            </ul>
          </el-col>
        </el-row>
        <el-row :gutter="60">
          <el-col :span="12" style="margin-left: 50px">
            <el-button @click="sqlFormat" type="danger">格式化sql</el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="info" @click="resetForm('queryRef')">重置</el-button>
            <el-button type="primary" @click="commitForm('queryRef')">提交</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-dialog title="SQL审核结果" width="60%" :visible="dialogVisible" @close="dialogClose">
      <div v-for="(item,index) in result" :key="index">
        <el-divider>SQL {{ index + 1 }}</el-divider>
        <el-tag v-for="(i,idx) in item.split('.')" :key="idx" v-if="i!=''">{{ i }}</el-tag>
      </div>
      <el-divider>END</el-divider>
      <el-row>
        <el-col :push="18">
          <el-button type="info" @click="dialogClose">已知晓,返回修改sql</el-button>
        </el-col>
      </el-row>
    </el-dialog>
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
        selectHost: "",
        selectDb: "",
        sql: "",
        manager: "",
        dba: ""
      },
      activeName: "",
      options: [],
      dbs: [],
      queryRules: {
        selectHost: {
          required: true,
          message: "请选择实例",
          trigger: "change"
        },
        selectDb: {
          required: true,
          message: "请选择数据库",
          trigger: "change"
        },
        sql: {required: true, message: "SQL不可为空", trigger: "blur"},
        manager: {required: true, message: "选择主管", trigger: "blur"},
        dba: {required: true, message: "选择dba", trigger: "blur"}
      },
      tabs: [],
      desc: "",
      dialogVisible: false,
      result: [],
      manager: [],
      dba: []
    };
  },
  mounted() {
    this.get_master_ins();
    this.init();
    this.get_approver();
  },
  methods: {
    async get_approver() {
      const {data: res} = await this.$ajax.get("/get_approver/").catch(() => {
        return this.$notify.error({title: "错误", message: "请求审批人失败"});
      });
      if (res.msg != "success") return this.$message.error("获取审批人失败");
      this.manager = res.data.manager;
      this.dba = res.data.dba;
    },
    dialogClose() {
      this.dialogVisible = false;
      this.result = [];
    },
    async commitForm(form) {
      this.queryInfo.sql = this.editor.getValue()
      this.$refs[form].validate(async valid => {
        if (!valid) return this.$message.error("请选择/填写必要项");
        this.queryInfo.sql = this.editor.getValue();
        const {data: res} = await this.$ajax
            .post("/inspect/", this.queryInfo)
            .catch(() => {
              return this.$notify.error({
                title: "请求失败",
                message: "SQL发起审核失败"
              });
            });
        if (res.msg != "success") return this.$message.error("SQL审核失败");
        if (res.data) {
          this.result = res.data;
          this.dialogVisible = true;
        } else {
          this.$message.success("工单提交成功！");
          this.resetForm(form);
        }
      });
    },
    async getDesc() {
      if (this.activeName != "") {
        const {data: res} = await this.$ajax.get(
            `/get_desc/?id=${this.queryInfo.selectHost}&dbname=${this.queryInfo.selectDb}&table=${this.activeName}`
        );
        this.desc = res.data[1];
        this.desc = hljs.highlight("sql", this.desc).value;
        this.$alert('<pre>' + this.desc + '</pre>', this.activeName, {
          dangerouslyUseHTMLString: true,
        });
      }
    },
    async getTable() {
      const {data: res} = await this.$ajax.get(
          `/get_table/?id=${this.queryInfo.selectHost}&dbname=${this.queryInfo.selectDb}`
      );
      if (res.msg != "success")
        return this.$message.error("库中数据表获取失败");
      this.tabs = Object.keys(res.data.tables);
      this.editor.setOption("hintOptions", res.data);
    },
    resetForm(form) {
      this.$refs[form].resetFields();
      this.editor.setValue("");
      this.tabs = [];
      this.dbs = [];
    },
    async get_master_ins() {
      const {data: res} = await this.$ajax
          .get("/get_master_ins/")
          .catch(() => {
            return this.$notify.error({title: "错误", message: "获取实例失败"});
          });
      if (res.msg != "success") return this.$message.error("获取实例失败");
      this.options = res.data;
    },
    async get_db(form) {
      if (this.queryInfo.selectDb != "") this.queryInfo.selectDb = "";
      this.dbs = [];
      this.tabs = [];
      const {data: res} = await this.$ajax
          .get(`/get_schema/?id=${this.queryInfo.selectHost}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "获取数据库失败，请检查实例连接配置"
            });
          });
      if (res.msg != "success")
        return this.$message.error("获取数据库失败，请检查实例连接状态");
      this.dbs = res.data;
    },
    init() {
      (this.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
        mode: "text/x-mysql", //选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
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
            "-- Tips:请先选择环境、库名，这样可以在使用Tab键时有补全提示",
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
    }
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
