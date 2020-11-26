<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工单管理</el-breadcrumb-item>
      <el-breadcrumb-item>历史查询记录</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input
              v-model="sponsor"
              clearable
              prefix-icon="el-icon-search"
              placeholder="输入用户名"
          ></el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchdbid">搜索</el-button>
        </el-col>
      </el-row>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="用户" prop="username" align="center" header-align="center"></el-table-column>
        <el-table-column label="实例" prop="ins_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="数据库" prop="dbname" align="center" header-align="center"></el-table-column>
        <el-table-column label="sql" align="center" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.sql.slice(0,50)"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.sql);" size="mini" round>查看全部sql</el-button>
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="create_time" align="center" header-align="center"></el-table-column>
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
      total: 0,
      sponsor: '',
    };
  },
  mounted() {
    this.get_query_log();
  },
  methods: {
    handleSizeChange(val) {
      this.offset = 1;
      this.limit = val;
      this.get_query_log();
    },
    handleCurrentChange(val) {
      this.offset = val;
      this.get_query_log();
    },
    async get_query_log() {
      const {data: res} = await this.$ajax
          .get(`/get_query_log?offset=${this.offset}&limit=${this.limit}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取失败");
      this.tableData = res.data;
      this.total = res.total;
    },
    async alert_sql(sql) {
      sql = sqlFormatter.format(sql);
      sql = hljs.highlight("sql", sql).value;
      await this.$alert('<pre>' + sql + '</pre>', 'sql', {
        dangerouslyUseHTMLString: true,
      });
    },
    async searchdbid() {
      const {data: res} = await this.$ajax
          .get(`/get_query_log?offset=${this.offset}&limit=${this.limit}&sponsor=${this.sponsor}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取失败");
      this.tableData = res.data;
      this.total = res.total;
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