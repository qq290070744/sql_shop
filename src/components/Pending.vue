<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>待审批</el-breadcrumb-item>
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
                  >执行</el-button>
                  <el-button
                    type="danger"
                    icon="iconfont icon-bohui"
                    size="mini"
                    @click="rejectOrder(scope.row)"
                  >驳回</el-button>
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
    async commitOrder(row) {
      const { data: res } = await this.$ajax
        .post(`/execsql/${row.id}/`)
        .catch(() => {
          return this.$notify.error({
            title: "错误",
            message: "发起SQL执行操作失败"
          });
        });
      if (res.msg != "success" || !res.msg) return this.$message.error(res.msg);
      this.get_workorder();
      this.$message.success("SQL执行成功");
    },
    rejectOrder(row) {
      this.$prompt("请输入驳回理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /[^\s]+/,
        inputErrorMessage: "请输入内容"
      })
        .then(async ({ value }) => {
          const { data: res } = await this.$ajax
            .post(`/sqlrecord/${row.id}/?remark=${value}`)
            .catch(() => {
              return this.$notify.error({
                title: "错误",
                message: "发起驳回操作失败"
              });
            });
          if (res.msg != "success") return this.$message.error("驳回操作失败");
          this.$message.success("已驳回该工单");
          this.get_workorder();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    async get_workorder() {
      const { data: res } = await this.$ajax
        .get(`/pending/?offset=${this.offset}&limit=${this.limit}`)
        .catch(() => {
          return this.$notify.error({
            title: "错误",
            message: "发起请求工单失败"
          });
        });
      if (res.msg != "success") return this.$message.error("获取工单失败");
      this.tableData = res.data;
      this.total = res.total;
      this.tableData.forEach(item => {
        item.sql.forEach(i => {
          i.sql = hljs.highlight("sql", i.sql).value;
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
</style>