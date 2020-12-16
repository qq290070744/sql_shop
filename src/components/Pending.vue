<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>待审批</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <h1>待审批工单列表</h1>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-button
                type="success"
                icon="iconfont icon-zhihang"
                size="medium"
                @click="exec_all_sql(props.row.sql)"
            >全部执行
            </el-button>
            <el-button
                type="danger"
                icon="iconfont icon-zhihang"
                size="medium"
                @click="rejectOrder_all(props.row.sql)"
            >全部驳回
            </el-button>
            <el-table :data="props.row.sql" size="mini" border stripe>
              <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
              <el-table-column label="SQL" header-align="center">
                <template slot-scope="scope">
                  <pre><div v-html="scope.row.sql.slice(0,50)"></div></pre>
                  <el-button type="primary" @click="alert_sql(scope.row.sql);" size="mini" round>查看全部sql</el-button>
                </template>
              </el-table-column>
              <el-table-column label="预计影响行数" prop="affected_rows" header-align="center"></el-table-column>
              <el-table-column label="预计执行时间/s" prop="execute_time" header-align="center"></el-table-column>
              <el-table-column label="审批进度" header-align="center" width="400px">
                <template slot-scope="scope">
                  <el-steps
                      :active="scope.row.status_code"
                      finish-status="success"
                      :process-status="scope.row.remark?'error':'process'"
                      align-center
                      class="steps_class"
                  >
                    <el-step title="提交工单"></el-step>
                    <el-step
                        title="审批"
                        :description="scope.row.remark && scope.row.status_code==1?scope.row.remark:''"
                    ></el-step>
                    <el-step
                        title="执行"
                        :description="scope.row.remark && scope.row.status_code==2?scope.row.remark:''"
                    ></el-step>
                  </el-steps>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" header-align="center"></el-table-column>
              <el-table-column label="操作" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button
                      type="primary"
                      icon="iconfont icon-zhihang"
                      size="mini"
                      @click="commitOrder(scope.row)"
                  >执行
                  </el-button>
                  <el-button
                      type="danger"
                      icon="iconfont icon-bohui"
                      size="mini"
                      @click="rejectOrder(scope.row)"
                  >驳回
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="发起人" prop="sponsor" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例名称" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例地址" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="发起时间" prop="create_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="工单说明" prop="remark" align="center" header-align="center"></el-table-column>
      </el-table>

      <h1>osc信息列表</h1>
      <el-table :data="ocstableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库名" prop="DBNAME" align="center" header-align="center"></el-table-column>
        <el-table-column label="表名" prop="TABLENAME" align="center" header-align="center"></el-table-column>
        <!--        <el-table-column label="SQL" prop="COMMAND" align="center" header-align="center"></el-table-column>-->
        <el-table-column label="SQL" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.COMMAND"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.COMMAND);" size="mini" round>查看全部sql</el-button>
          </template>
        </el-table-column>
        <el-table-column label="执行进度百分比" prop="PERCENT" align="center" header-align="center"></el-table-column>
        <el-table-column label="剩余时间" prop="REMAINTIME" align="center" header-align="center"></el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button
                type="warning"
                icon="iconfont icon-zhihang"
                size="mini"
                @click="pause_osc(scope.row.SQLSHA1)"
            >暂停
            </el-button>
            <el-button
                type="primary"
                icon="iconfont icon-zhihang"
                size="mini"
                @click="resume_osc(scope.row.SQLSHA1)"
            >恢复
            </el-button>
            <el-button
                type="danger"
                icon="iconfont icon-bohui"
                size="mini"
                @click="kill_osc(scope.row.SQLSHA1)"
            >终止
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <h1>待审批数据导出工单列表</h1>
      <el-table :data="data_export_tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="发起人" prop="sponsor" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例名称" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例地址" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="sql" prop="sql" align="center" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.sql.slice(0,100)"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.sql);" size="mini" round>查看全部sql</el-button>
          </template>
        </el-table-column>
        <el-table-column label="发起时间" prop="create_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="工单说明" prop="remark" align="center" header-align="center"></el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button
                type="primary"
                icon="iconfont icon-zhihang"
                size="mini"
                @click="mod_data_export_status(scope.row.id,1)"
            >通过
            </el-button>
            <el-button
                type="danger"
                icon="iconfont icon-bohui"
                size="mini"
                @click="mod_data_export_status(scope.row.id,2)"
            >驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button type="primary" @click="get_workorder();get_osc()">手动刷新
      </el-button>
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
  </div>
</template>
<script>
import hljs from "highlight.js";
import sqlFormatter from "sql-formatter";

export default {
  inject: ['reload'],
  data() {
    return {
      tableData: [],
      offset: 1,
      limit: 5,
      total: 0,
      ocstableData: [],
      data_export_tableData: [],
      timer: '',
    };
  },
  mounted() {
    this.get_workorder();
    this.get_osc();
    this.get_workorder_data_export();
    this.timer = setInterval(this.get_osc, 10000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    handleSizeChange(val) {
      this.limit = val;
      this.get_workorder();
      this.get_osc();
    },
    handleCurrentChange(val) {
      this.offset = val;
      this.get_workorder();
      this.get_osc();
    },
    async commitOrder(row) {
      const {data: res} = await this.$ajax
          .post(`/execsql/${row.id}/`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起SQL执行操作失败"
            });
          });
      if (res.msg !== "success" || !res.msg) return this.$message.error(res.msg);
      await this.get_workorder();
      this.$message.success("SQL已放后台执行中，请稍后刷新页面查看是否执行完成！");
    },
    rejectOrder(row) {
      this.$prompt("请输入驳回理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /[^\s]+/,
        inputErrorMessage: "请输入内容"
      })
          .then(async ({value}) => {
            const {data: res} = await this.$ajax
                .post(`/sqlrecord/${row.id}/?remark=${value}`)
                .catch(() => {
                  return this.$notify.error({
                    title: "错误",
                    message: "发起驳回操作失败"
                  });
                });
            if (res.msg !== "success") return this.$message.error("驳回操作失败");
            this.$message.success("已驳回该工单");
            await this.get_workorder();
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消输入"
            });
          });
    },
    async get_workorder() {
      const {data: res} = await this.$ajax
          .get(`/pending/?offset=${this.offset}&limit=${this.limit}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求工单失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取工单失败");
      this.tableData = res.data;
      this.total = res.total;
      // this.tableData.forEach(item => {
      //   item.sql.forEach(i => {
      //     i.sql = hljs.highlight("sql", i.sql).value;
      //   });
      // });
    },
    async get_osc() {
      const {data: res} = await this.$ajax
          .get(`/get_osc/`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求osc失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取osc失败");
      this.ocstableData = res.data;
      this.ocstableData.forEach(item => {
        // item.COMMAND = hljs.highlight("sql", item.COMMAND).value;
        item.PERCENT = item.PERCENT + "%";
      });
    },
    async pause_osc(SQLSHA1) {
      const {data: res} = await this.$ajax
          .post(`/pause_osc/`, {"SQLSHA1": SQLSHA1})
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起暂停osc请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("暂停osc失败");
    },
    async resume_osc(SQLSHA1) {
      const {data: res} = await this.$ajax
          .post(`/resume_osc/`, {"SQLSHA1": SQLSHA1})
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起恢复osc请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("恢复osc失败");
    },
    async kill_osc(SQLSHA1) {
      const {data: res} = await this.$ajax
          .post(`/kill_osc/`, {"SQLSHA1": SQLSHA1})
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起终止osc请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("终止osc失败");
    },
    async alert_sql(sql) {
      sql = sqlFormatter.format(sql);
      sql = hljs.highlight("sql", sql).value;
      await this.$alert('<pre>' + sql + '</pre>', 'sql', {
        dangerouslyUseHTMLString: true,
      });
    },
    async get_workorder_data_export() {
      const {data: res} = await this.$ajax
          .get(`/data_export_pending/?offset=${this.offset}&limit=${this.limit}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求工单失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取工单失败");
      this.data_export_tableData = res.data;
      this.total = res.total;
    },
    async mod_data_export_status(id, status) {
      const {data: res} = await this.$ajax
          .post(`/mod_data_export_status/`, {"id": id, "status": status})
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("请求失败");
      this.$message.success("成功");
      await this.get_workorder_data_export();
    },
    async exec_all_sql(row) {
      for (const i in row) {
        // console.log(row[i])
        await this.commitOrder(row[i])
      }
    },
    rejectOrder_all(row) {
      this.$prompt("请输入驳回理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /[^\s]+/,
        inputErrorMessage: "请输入内容"
      })
          .then(async ({value}) => {
            for (const i in row) {
              const {data: res} = await this.$ajax
                  .post(`/sqlrecord/${row[i].id}/?remark=${value}`)
                  .catch(() => {
                    return this.$notify.error({
                      title: "错误",
                      message: "发起驳回操作失败"
                    });
                  });
              if (res.msg !== "success") return this.$message.error("驳回操作失败");
            }
            this.$message.success("已驳回该工单");
            await this.get_workorder();
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消输入"
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
</style>