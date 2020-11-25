<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>SQL执行</el-breadcrumb-item>
      <el-breadcrumb-item>SELECT</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :model="queryInfo" ref="queryRef" :rules="queryRules">
        <el-row :gutter="0">
          <el-col :span="7">
            <el-form-item label="实例名称/地址:" prop="selectHost">
              <el-select
                  v-model="queryInfo.selectHost"
                  placeholder="请选择实例地址"
                  style="width: 200px;"
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
          <el-col :span="6">
            <el-form-item label="数据库:" prop="selectDb">
              <el-select
                  v-model="queryInfo.selectDb"
                  filterable
                  placeholder="请选择数据库"
                  @change="getTable"
                  style="width: 200px;"
              >
                <el-option v-for="item in dbs" :key="item.db" :value="item.db" :label="item.db"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="限制条数:" prop="limit2">
              <el-select v-model="queryInfo.limit2" placeholder="请选择限制条数" style="width: 100px;">
                <el-option
                    v-for="item in [10,100,500,1000,10000]"
                    :key="item"
                    :value="item"
                    :label="item"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-switch
                v-model="switchValue"
                active-text="开启sql检查"
                inactive-text="关闭sql检查"
                style="height: 40px"

            ></el-switch>
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
                <el-collapse-item v-for="item in tabs" :key="item" :title="item" :name="item">
                  <!--                  <pre v-html="desc"></pre>-->
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
            <el-button type="primary" @click="dialogFormVisible_data_export = true">查询数据导出</el-button>
          </el-col>
        </el-row>
      </el-form>
      <div v-if="isRet">
        <el-divider v-if="isFetching">
          数据获取中
          <i class="el-icon-loading"></i>
        </el-divider>
        <el-divider v-else>
          结果集如下
          <i class="el-icon-s-opportunity"></i>
        </el-divider>

        <el-table :data="tableData" style="width: 100%" border stripe>
          <el-table-column
              align="center"
              header-align="center"
              v-for="item in tableLabel"
              :key="item"
              :prop="item"
              :label="item"
              show-overflow-tooltip
              min-width="200px"
          ></el-table-column>
        </el-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.offset"
            :page-sizes="[5, 10, 30, 50]"
            :page-size="queryInfo.limit"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            style="margin-top: 20px"
        ></el-pagination>
      </div>
    </el-card>

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
            <el-button type="info" @click="closeDialog">返回优化SQL</el-button>
            <el-button type="primary" @click="getRes">仍然执行</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <el-dialog title="查询数据导出" :visible.sync="dialogFormVisible_data_export">
      <el-form :model="queryInfo" ref="queryRef1" :rules="queryRules1">
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
        <el-form-item label="导出说明: " prop="remark" label-width="150px">
          <textarea style="width: 250px;" v-model="queryInfo.remark" rows="5">
          </textarea>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible_data_export = false">取 消</el-button>
        <el-button type="primary" @click="sumit_data_export('queryRef','queryRef1')">提交导出工单</el-button>
      </div>
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
        offset: 1,
        limit: 5,
        limit2: 5,
        manager: "",
        dba: "",
        remark: "",
      },
      activeName: "",
      switchValue: true,
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
        limit2: {
          required: true,
          message: "必须要选择限制条数",
          trigger: "change"
        }
      },
      queryRules1: {
        manager: {required: true, message: "选择主管", trigger: "blur"},
        dba: {required: true, message: "选择dba", trigger: "blur"},
        remark: {required: true, message: "必须填写导出说明", trigger: "blur"},
      },
      tabs: [],
      desc: "",
      dialogVisible: false,
      dialogFormVisible_data_export: false,
      result: "",
      loading: true,
      tableData: [],
      total: 0,
      tableLabel: [],
      isRet: false,
      isFetching: true,
      manager: [],
      dba: []
    };
  },
  mounted() {
    this.get_ins();
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
    handleCurrentChange(val) {
      console.log(this.queryInfo.offset);
      this.queryInfo.offset = val;
      this.getRes();
    },
    handleSizeChange(val) {
      this.queryInfo.limit = val;
      this.queryInfo.offset = 1;
      this.getRes();
    },
    async getRes() {
      this.isRet = true;
      this.isFetching = true;
      this.dialogVisible = false;
      const {data: res} = await this.$ajax
          .post("/sqlexec/", this.queryInfo)
          .catch(() => {
            this.$notify.error({title: "错误", message: "获取结果失败"});
          });
      if (res.msg != "success") {
        this.isRet = false;
        return this.$message.error(res.msg);
      }
      this.tableData = res.data;
      this.total = res.total;
      if (res.total != 0) {
        this.tableLabel = Object.keys(res.data[0]);
      }
      this.isFetching = false;
    },
    async sumit_data_export(form, form1) {
      this.queryInfo.offset = 1;
      this.queryInfo.limit = 5;
      this.tableData = [];
      this.tableLabel = [];
      this.total = 0;
      this.queryInfo.sql = this.editor.getValue();
      this.$refs[form].validate(async valid => {
        if (!valid) return this.$message.error("请选择/填写必要项");
        this.$refs[form1].validate(async valid => {
          if (!valid) return this.$message.error("请选择/填写必要项");
          const {data: res} = await this.$ajax
              .post("/submit_workorder_data_export/", this.queryInfo)
              .catch(() => {
                this.$notify.error({title: "错误", message: "请求失败"});
              });
          if (res.msg !== "success") {
            this.isRet = false;
            return this.$message.error(res.msg);
          }
          this.$message({
            type: "success",
            message: "提交数据导出工单成功!"
          });
          this.dialogFormVisible_data_export = false
        })

      })
    },
    async closeDialog() {
      this.dialogVisible = false;
      this.result = "";
      this.loading = true;
    },
    async commitForm(form) {
      this.queryInfo.offset = 1;
      this.queryInfo.limit = 5;
      this.tableData = [];
      this.tableLabel = [];
      this.total = 0;
      this.queryInfo.sql = this.editor.getValue();
      this.$refs[form].validate(async valid => {
        if (!valid) return this.$message.error("请选择/填写必要项");
        if (this.switchValue) {
          this.dialogVisible = true;
          const {data: res} = await this.$ajax
              .post("/sqlscore/", this.queryInfo)
              .catch(() => {
                this.$notify.error({
                  title: "错误",
                  message: "提交失败"
                });
              });
          if (res.msg != "success") return this.$message.error("SQL审核失败");
          this.result = res.data.join("");
          this.loading = false;
        } else {
          this.getRes(form);
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
      this.isRet = false;
      this.$refs[form].resetFields();
      this.editor.setValue("");
      this.tabs = [];
      this.dbs = [];
      this.switchValue = true;
    },
    async get_ins() {
      const {data: res} = await this.$ajax.get("/get_ins/").catch(() => {
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

<style lang="less" scoped>
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


</style>
