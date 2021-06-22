<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的工单</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.sql" size="mini" border stripe>
              <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
              <el-table-column label="SQL" header-align="center">
                <template slot-scope="scope">
                  <pre><div v-html="scope.row.sql"></div></pre>
                  <el-button type="primary" @click="alert_sql(scope.row.sql);" size="mini" round>查看全部sql</el-button>
                  <el-button type="info" @click="get_rollbacksql(scope.row);" size="mini" round>查看回滚语句</el-button>
                </template>
              </el-table-column>
              <el-table-column
                  label="实际审批人"
                  prop="approved"
                  align="center"
                  header-align="center"
                  width="150px"
              ></el-table-column>
              <el-table-column label="影响行数" prop="affected_rows" header-align="center"></el-table-column>
              <el-table-column label="执行时间/s" prop="execute_time" header-align="center"></el-table-column>
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
                        :description="scope.row.remark && scope.row.status_code===1?scope.row.remark:''"
                    ></el-step>
                    <el-step
                        v-if="scope.row.remark==='rollbacked'"
                        title="已回滚"
                        icon="el-icon-refresh-left"
                        status="finish"
                    ></el-step>
                    <el-step
                        v-else
                        title="执行"
                        :description="scope.row.remark && scope.row.status_code===2?scope.row.remark.slice(0,100):''"
                    ></el-step>
                  </el-steps>
                </template>
              </el-table-column>
              <el-table-column label="备注">
                <template slot-scope="scope">
                  <pre><div v-html="scope.row.remark.slice(0,100)"></div></pre>
                  <el-button type="primary" @click="alert_remark(scope.row.remark.slice(0,1000));" size="mini" round>查看全部</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="审批上级" prop="approver_manager" align="center" header-align="center"></el-table-column>
        <el-table-column label="审批dba" prop="approver_dba" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例名称" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例地址" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="发起时间" prop="create_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="工单说明" prop="remark" align="center" header-align="center"></el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="offset"
          :page-sizes="[10,20,50,100]"
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
  data() {
    return {
      tableData: [],
      offset: 1,
      limit: 10,
      total: 0
    };
  },
  mounted() {
    this.get_workorder();
  },
  methods: {
    handleSizeChange(val) {
      this.offset = 1;
      this.limit = val;
      this.get_workorder();
    },
    handleCurrentChange(val) {
      this.offset = val;
      this.get_workorder();
    },
    async get_workorder() {
      const {data: res} = await this.$ajax
          .get(`/workorder/?offset=${this.offset}&limit=${this.limit}`)
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
    async alert_sql(sql) {
      sql = sqlFormatter.format(sql);
      sql = hljs.highlight("sql", sql).value;
      await this.$alert('<pre>' + sql + '</pre>', 'sql', {
        dangerouslyUseHTMLString: true,
      });
    },
    async alert_remark(remark) {
      await this.$alert('<pre>' + remark + '</pre>', 'remark', {
        dangerouslyUseHTMLString: true,
      });
    },
    async get_rollbacksql(row) {
      const {data: res} = await this.$ajax
          .post(`/get_rollbacksql/${row.id}/`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
      await this.alert_sql(res.data)
    },
  }
};
</script>

<style lang="less">
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