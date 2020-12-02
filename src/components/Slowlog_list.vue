<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>慢日志管理</el-breadcrumb-item>
      <el-breadcrumb-item>慢日志信息列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div class="block">
        <span class="demonstration"> - 选择实例: </span>
        <el-select
            v-model="dbid"
            placeholder="请选择实例"
            style="width: 200px;"
        >
          <el-option
              v-for="item in options"
              :key="item.id"
              :value="item.id"
              :label="item.id+'/'+item.ins_name+'/'+item.host"
          ></el-option>
        </el-select>
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
      </div>
      <el-button type="primary" @click="search_('get_slowlog')">搜索</el-button>
      <el-button type="primary" @click="search_('get_slowlog_count_top30')">出现频率top30</el-button>
      <el-button type="primary" @click="search_('get_slowlog_time_top30')">耗时最长top30</el-button>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <!--        <el-table-column label="count" prop="count" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="dbid" prop="dbid" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="db_user" prop="db_user" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="app_ip" prop="app_ip" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="thread_id" prop="thread_id" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="exec_duration" prop="exec_duration" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="rows_sent" prop="rows_sent" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="rows_examined" prop="rows_examined" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="start_time" prop="start_time" align="center" header-align="center"></el-table-column>-->
        <!--        <el-table-column label="fingerprint" prop="fingerprint" align="center" header-align="center"></el-table-column>-->
        <el-table-column label="sql_pattern" align="center" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.sql_pattern.slice(0,100)"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.sql_pattern);" size="mini" round>查看全部sql</el-button>
          </template>
        </el-table-column>
        <el-table-column label="orig_sql" align="center" header-align="center">
          <template slot-scope="scope">
            <pre><div v-html="scope.row.orig_sql.slice(0,100)"></div></pre>
            <el-button type="primary" @click="alert_sql(scope.row.orig_sql);" size="mini" round>查看全部sql</el-button>
          </template>
        </el-table-column>
        <!--        <el-table-column label="时间" prop="create_time" align="center" header-align="center"></el-table-column>-->
        <el-table-column
            align="center"
            header-align="center"
            v-for="item in tableLabel"
            :key="item"
            :prop="item"
            :label="item"
            show-overflow-tooltip
        >
        </el-table-column>
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
      dbid: '',
      options: [],
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
      tableLabel: [],
      search_value: 'get_slowlog',
    };
  },
  mounted() {
    this.search_(this.search_value);
    this.get_ins();
  },
  methods: {
    handleSizeChange(val) {
      this.offset = 1;
      this.limit = val;
      this.search_(this.search_value);
    },
    handleCurrentChange(val) {
      this.offset = val;
      this.search_(this.search_value);
    },
    async alert_sql(sql) {
      sql = sqlFormatter.format(sql);
      sql = hljs.highlight("sql", sql).value;
      await this.$alert('<pre>' + sql + '</pre>', 'sql', {
        dangerouslyUseHTMLString: true,
      });
    },
    async search_(search_name) {
      this.search_value = search_name
      let dbid = this.dbid
      if (this.dbid === '') {
        dbid = 0
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
          .get(`/${search_name}?offset=${this.offset}&limit=${this.limit}&dbid=${dbid}&start_time=${start_time}&end_time=${end_time}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取失败");
      this.tableData = res.data;
      this.total = res.total;
      if (res.total !== 0) {
        this.tableLabel = Object.keys(res.data[0]);
      }
    },
    async get_ins() {
      const {data: res} = await this.$ajax.get("/instance/").catch(() => {
        return this.$notify.error({title: "错误", message: "获取实例失败"});
      });
      if (res.msg !== "success") return this.$message.error("获取实例失败");
      this.options = res.data;
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