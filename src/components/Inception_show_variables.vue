<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>goInception配置管理</el-breadcrumb-item>
      <el-breadcrumb-item>审核规则</el-breadcrumb-item>
    </el-breadcrumb>
    <a href="https://hanchuanchuan.github.io/goInception/zh/options.html" target="_blank"><h1>查看参数的解释</h1></a>
    <el-card>
      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="参数名" prop="Variable_name" align="center" header-align="center"></el-table-column>
        <el-table-column label="参数值" align="center" header-align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.Value" placeholder="请输入内容"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="inception_set(scope.row.Variable_name,scope.row.Value)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>

</template>

<script>
export default {
  data() {
    return {
      tableData: [],

    };
  },
  mounted() {
    this.get_inception_show_variables();
  },
  methods: {
    async get_inception_show_variables() {
      const {data: res} = await this.$ajax
          .get(`/get_inception_show_variables/`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("获取失败");
      this.tableData = res.data;
    },
    async inception_set(Variable_name, Value) {
      const {data: res} = await this.$ajax
          .post(`/set_inception_show_variables/`, {"Variable_name": Variable_name, "Value": Value})
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg !== "success") return this.$message.error("设置失败");
      this.$message({
        message: '修改成功',
        type: 'success'
      });
      await this.get_inception_show_variables();

    }
  }
}
</script>

<style scoped>

</style>