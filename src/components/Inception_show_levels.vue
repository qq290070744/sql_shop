<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>goInception配置管理</el-breadcrumb-item>
      <el-breadcrumb-item>自定义审核级别</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div align="">
        <p>对应审核结果的 <code>error_level</code> 字段：</p>
        <ul>
          <li><code>2</code> 为错误，即强限制，无法执行</li>
          <li><code>1</code> 为警告，即弱限制，可通过忽略警告参数<code>ignore_warnings</code>跳过</li>
          <li><code>0</code> 为正常，即不做限制</li>
        </ul>
      </div>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="#" type="index" align="center" header-align="center"></el-table-column>
        <el-table-column label="参数中文名" prop="Desc" align="center" header-align="center"></el-table-column>
        <el-table-column label="参数名" prop="Name" align="center" header-align="center"></el-table-column>
        <el-table-column label="参数值" align="center" header-align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.Value" placeholder="请输入内容"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" header-align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="inception_set(scope.row.Name,scope.row.Value)">修改</el-button>
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
    this.get_inception_show_levels();
  },
  methods: {
    async get_inception_show_levels() {
      const {data: res} = await this.$ajax
          .get(`/get_inception_show_levels/`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg != "success") return this.$message.error("获取失败");
      this.tableData = res.data;
    },
    async inception_set(Name, Value) {
      const {data: res} = await this.$ajax
          .post(`/set_inception_show_levels/`, {"Name": Name, "Value": Value})
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "发起请求失败"
            });
          });
      if (res.msg != "success") return this.$message.error("设置失败");
      this.$message({
        message: '修改成功',
        type: 'success'
      });
      await this.get_inception_show_levels();

    }
  }
}
</script>

<style scoped>

</style>