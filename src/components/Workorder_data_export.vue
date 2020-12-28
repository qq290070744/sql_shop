<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的数据导出工单</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="审批上级" prop="approver_manager" align="center" header-align="center"></el-table-column>
        <el-table-column label="审批dba" prop="approver_dba" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例名称" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例地址" prop="host" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="sql" align="center" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.sql.slice(0,100)"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.sql);" size="mini" round>查看全部sql</el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" header-align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==0? true: false" type="info">
              <span class="el-icon-success">待审批</span>
            </el-tag>
            <el-tag v-if="scope.row.status==1? true: false" type="success">
              <span class="el-icon-success">通过</span>
            </el-tag>
            <el-tag v-if="scope.row.status==2? true: false" type="danger">
              <span class="el-icon-error">驳回</span>
            </el-tag>
            <el-tag v-if="scope.row.status==3? true: false" type="success">
              <span class="el-icon-success">已下载</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="链接" align="center" header-align="center">
          <template slot-scope="scope">
            <el-link type="primary" v-if="scope.row.status===1" v-bind:href="scope.row.path" target="_blank">下载链接</el-link>
          </template>
        </el-table-column>
        <el-table-column label="发起时间" prop="create_time" align="center" header-align="center"></el-table-column>
        <el-table-column label="审批时间" align="center" header-align="center">
          <template slot-scope="scope">
            <span type="primary" v-if="scope.row.status>=1">{{ scope.row.approve_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下载时间" align="center" header-align="center">
          <template slot-scope="scope">
            <span type="primary" v-if="scope.row.status===3">{{ scope.row.download_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单说明" prop="remark" align="center" header-align="center"></el-table-column>
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
import sqlFormatter from "sql-formatter";

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
          .get(`/workorder_data_export/?offset=${this.offset}&limit=${this.limit}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求工单失败"
            });
          });
      if (res.msg != "success") return this.$message.error("获取工单失败");
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
      this.$alert('<pre>' + sql + '</pre>', 'sql', {
        dangerouslyUseHTMLString: true,
      });
    },
    async alert_remark(remark) {
      this.$alert('<pre>' + remark + '</pre>', 'remark', {
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