<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>历史工单</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <span class="demonstration"> -   选择日期: </span>
        <el-date-picker
            v-model="datetimevalue"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
        </el-date-picker>
        -
        <el-form-item label="用户名">
          <el-input v-model="sponsor" placeholder="user"></el-input>
        </el-form-item>
        -
        <el-form-item label="host">
          <el-input v-model="host" placeholder="host"></el-input>
        </el-form-item>
        -
        <el-form-item label="数据库名">
          <el-input v-model="dbname" placeholder="dbname"></el-input>
        </el-form-item>
        <el-checkbox v-model="is_check">查看是否检查</el-checkbox>
        -
        <el-button type="primary" @click="get_workorder">搜索</el-button>
      </el-form>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-link type="primary" v-bind:href="'/api/v1/download_rollbacksql/'+props.row.id+'/'" target="_blank">下载回滚sql语句</el-link>
            <el-table :data="props.row.sql" size="mini" border stripe>
              <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
              <el-table-column label="SQL" header-align="center">
                <template slot-scope="scope">
                  <pre><div v-html="scope.row.sql"></div></pre>
                  <el-button type="primary" @click="alert_sql(scope.row.sql);" size="mini" round>查看全部sql</el-button>
                  <el-button type="info" @click="get_rollbacksql(scope.row);" size="mini" round>查看回滚语句</el-button>
                </template>
              </el-table-column>
              <el-table-column label="实际审批人" prop="approved"></el-table-column>
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
              <el-table-column label="备注" header-align="center">
                <template slot-scope="scope">
                  <pre><div v-html="scope.row.remark.slice(0,100)"></div></pre>
                  <el-button type="primary" @click="alert_remark(scope.row.remark.slice(0,1000));" size="mini" round>查看全部</el-button>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button
                      type="primary"
                      icon="el-icon-refresh-left"
                      size="mini"
                      @click="rollbackOrder(scope.row)"
                  >回滚
                  </el-button>
                  <el-button type="info" @click="get_rollbacksql(scope.row);" size="mini" round>查看回滚语句</el-button>

                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="发起人" prop="sponsor" align="center" header-align="center"></el-table-column>
        <el-table-column label="审核人" prop="approver_manager" align="center" header-align="center"></el-table-column>
        <el-table-column label="审核dba" prop="approver_dba" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例名称" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例地址" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="发起时间" prop="create_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="工单说明" prop="remark" align="center" header-align="center"></el-table-column>
        <el-table-column prop="is_check" label="是否检查" align="center" header-align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_check===1" type="success" class="iconfont icon-zhengchang"></el-tag>
            <el-tag v-if="scope.row.is_check===0" type="danger" class="iconfont icon-yichang"></el-tag>
            <el-button v-if="scope.row.is_check===0"
                       type="primary"
                       size="mini"
                       @click="order_mark_check(scope.row.id)"
            >点击标记检查
            </el-button>
          </template>

        </el-table-column>
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
      total: 0,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      datetimevalue: [],
      is_check: 2,
      sponsor: '',
      host: '',
      dbname: '',
    };
  },
  mounted() {
    this.get_workorder();
  },
  methods: {
    handleSizeChange(val) {
      this.limit = val;
      this.get_workorder();
    },
    handleCurrentChange(val) {
      this.offset = val;
      this.get_workorder();
    },
    async get_workorder() {
      let is_check;
      if (this.is_check === true) {
        is_check = 1
      } else if (this.is_check === false) {
        is_check = 0
      } else if (this.is_check === 2) {
        is_check = 2
      }
      let start_time = ''
      let end_time = ''
      // console.log(this.datetimevalue)
      if (this.datetimevalue) {
        if (this.datetimevalue.length > 1) {
          const date = new Date(this.datetimevalue[0]);
          const date1 = new Date(this.datetimevalue[1]);
          start_time = Date.parse(date) / 1000;
          end_time = Date.parse(date1) / 1000;

        }
      }
      const {data: res} = await this.$ajax
          .get(`/historyorder/?offset=${this.offset}&limit=${this.limit}&is_check=${is_check}&start_time=${start_time}&end_time=${end_time}&sponsor=${this.sponsor}&host=${this.host}&dbname=${this.dbname}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求历史工单失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取历史工单失败");
      this.tableData = res.data;
      this.total = res.total;
      // this.tableData.forEach(item => {
      //   item.sql.forEach(i => {
      //     i.sql = hljs.highlight("sql", i.sql).value;
      //   });
      // });
    },
    rollbackOrder(row) {
      if (
          (row.remark !== "" && row.status_code !== 3) ||
          row.remark === "rollbacked"
      )
        return this.$notify.error({
          title: "错误",
          message: "只能回滚已执行成功的SQL"
        });
      this.$confirm("此操作将回滚该SQL, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
          .then(async () => {
            const {data: res} = await this.$ajax
                .post(`/rollbacksql/${row.id}/`)
                .catch(() => {
                  return this.$notify.error({
                    title: "错误",
                    message: "发起回滚操作失败"
                  });
                });
            if (res.msg !== "success") return this.$message.error(res.msg);
            this.$message({
              type: "success",
              message: "回滚成功!"
            });
            await this.get_workorder();
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消回滚操作"
            });
          });
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
    async order_mark_check(id) {
      const {data: res} = await this.$ajax
          .post(`/order_mark_check/${id}/`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
      await this.get_workorder()
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

.el-step__icon.is-icon {
  width: 20px !important;
}

.el-step__icon-inner[class*="el-icon"]:not(.is-status) {
  color: #67c23a;
}

.el-step__head.is-finish {
  height: 24px !important;
  color: #67c23a !important;
}

.el-step__title.is-finish {
  height: 37.6px !important;
  color: #67c23a !important;
}
</style>