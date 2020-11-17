<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>Dashboard</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="12">
          <div id="row1_col1" style="width: 600px;height:280px;"></div>
        </el-col>
        <el-col :span="6">
          <div id="row1_col2" style="width: 600px;height:280px;"></div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <div id="row1_col3" style="width: 600px;height:280px;"></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import echartsLiquidfill from "echarts-liquidfill"; //在这里引入

export default {
  name: "Dashboard",
  data() {
    // 指定图表的配置项和数据

    return {
      name_list: [],
      data_source: []
    };
  },
  mounted() {
    this.showChart();
  },
  methods: {
    async showChart() {
      const {data: res} = await this.$ajax.get("/sqlcount/");
      this.data_source = res.data;
      this.data_source.forEach(item => {
        this.name_list.push(item.name);
      });
      var myChart = this.$echarts.init(document.getElementById("row1_col1"));
      var option = {
        title: {
          text: "用户操作占比统计(累计值)",
          font: '30px 黑体',
          x: "30%",
          y: "90%"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: this.name_list
        },
        series: [
          {
            name: "sql统计",
            type: "pie",
            radius: "55%",
            center: ["65%", "40%"],
            data: this.data_source,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      };
      myChart.setOption(option);
      await this.showRow1Col2();
    },
    async showRow1Col2() {
      const {data: res} = await this.$ajax.get('/workorder/?offset=1&limit=1')
      var myChart2 = this.$echarts.init(document.getElementById("row1_col2"));
      var value = res.total;
      var index = 1;
      var textName = "已提交工单";
      var colors = [
        ["#00d5ee", "#076c83"],
        ["#fe3f4f", "#7d273a"]
      ];
      var bgColors = ["#0d263c", "#26172c"];
      //波浪的层数
      var data = [0.6, 0.5, 0.6];
      var option = {
        title: {
          text: "已提交SQL工单数(累计值)",
          x: '35%',
          y: '90%'
        },
        backgroundColor: "#fff",
        graphic: [
          {
            type: "group",
            left: "center",
            bottom: 10,

          }
        ],
        series: [
          {
            type: "liquidFill",
            radius: "65%",
            center: ["50%", "40%"],
            data: data,
            color: colors[index],
            outline: {
              //外边框
              show: true,
              borderDistance: 4, //边框距离
              itemStyle: {
                borderWidth: 2,
                borderColor: colors[index][0]
                // shadowBlur: 3,
                // shadowColor: colors[colorIndex][0]
              }
            },
            backgroundStyle: {
              borderWidth: 2, //内边框宽度
              borderColor: "#051c45", //colors[colorIndex][0], //背景内边框
              color: bgColors[index], //背景颜色
              shadowColor: bgColors[index], //阴影
              shadowBlur: 5 //阴影模糊
            },
            label: {
              normal: {
                formatter: value.toFixed(0),
                textStyle: {
                  fontSize: 18
                },
                insideColor: "#fff" //colors[colorIndex][0]
              }
            }
          }
        ]
      };
      myChart2.setOption(option);
      await this.showRow1Col3();
    },
    async showRow1Col3() {
      const {data: res} = await this.$ajax.get('/workorder_data_export/?offset=1&limit=1')
      var myChart2 = this.$echarts.init(document.getElementById("row1_col3"));
      var value = res.total;
      var index = 1;
      var textName = "已提交工单";
      var colors = [
        ["#00d5ee", "#076c83"],
        ["#fe3f4f", "#7d273a"]
      ];
      var bgColors = ["#0d263c", "#26172c"];
      //波浪的层数
      var data = [0.6, 0.5, 0.6];
      var option1 = {
        title: {
          text: "已提交数据导出工单数(累计值)",
          x: '35%',
          y: '90%'
        },
        backgroundColor: "#fff",
        graphic: [
          {
            type: "group",
            left: "center",
            bottom: 10,

          }
        ],
        series: [
          {
            type: "liquidFill",
            radius: "65%",
            center: ["50%", "40%"],
            data: data,
            color: colors[index],
            outline: {
              //外边框
              show: true,
              borderDistance: 4, //边框距离
              itemStyle: {
                borderWidth: 2,
                borderColor: colors[index][0]
                // shadowBlur: 3,
                // shadowColor: colors[colorIndex][0]
              }
            },
            backgroundStyle: {
              borderWidth: 2, //内边框宽度
              borderColor: "#051c45", //colors[colorIndex][0], //背景内边框
              color: bgColors[index], //背景颜色
              shadowColor: bgColors[index], //阴影
              shadowBlur: 5 //阴影模糊
            },
            label: {
              normal: {
                formatter: value.toFixed(0),
                textStyle: {
                  fontSize: 18
                },
                insideColor: "#fff" //colors[colorIndex][0]
              }
            }
          }
        ]
      };
      myChart2.setOption(option1);
    },
  }
};
</script>

<style lang="less" scoped>
</style>
