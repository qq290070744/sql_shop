<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>历史工单</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.sql" size="mini" border stripe>
              <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
              <el-table-column label="SQL" header-align="center">
                <template slot-scope="scope">
                  <div v-html="scope.row.sql"></div>
                </template>
              </el-table-column>
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
                      v-if="scope.row.remark==='rollbacked'"
                      title="已回滚"
                      icon="el-icon-refresh-left"
                      status="finish"
                    ></el-step>
                    <el-step
                      v-else
                      title="执行"
                      :description="scope.row.remark && scope.row.status_code==2?scope.row.remark.slice(0,100):''"
                    ></el-step>
                  </el-steps>
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remark" header-align="center"></el-table-column>
              <el-table-column label="操作" align="center" header-align="center">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-refresh-left"
                    size="mini"
                    @click="rollbackOrder(scope.row)"
                  >回滚</el-button>
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
      </el-table>
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

export default {
  data() {
    return {
      tableData: [],
      offset: 1,
      limit: 5,
      total: 0
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
    rollbackOrder(row) {},
    async get_workorder() {
      const { data: res } = await this.$ajax
        .get(`/historyorder/?offset=${this.offset}&limit=${this.limit}`)
        .catch(() => {
          return this.$notify.error({
            title: "错误",
            message: "发起请求历史工单失败"
          });
        });
      if (res.msg != "success") return this.$message.error("获取历史工单失败");
      this.tableData = res.data;
      this.total = res.total;
      this.tableData.forEach(item => {
        item.sql.forEach(i => {
          i.sql = hljs.highlight("sql", i.sql).value;
        });
      });
    },
    rollbackOrder(row) {
      if (
        (row.remark != "" && row.status_code != 3) ||
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
          const { data: res } = await this.$ajax
            .post(`/rollbacksql/${row.id}/`)
            .catch(() => {
              return this.$notify.error({
                title: "错误",
                message: "发起回滚操作失败"
              });
            });
          if (res.msg != "success") return this.$message.error(res.msg);
          this.$message({
            type: "success",
            message: "回滚成功!"
          });
          this.get_workorder();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消回滚操作"
          });
        });
    }
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