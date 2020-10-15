<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/timg.jpg" />
        <span>MySQL运维管理平台</span>
      </div>
      <div>
        <el-menu
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          background-color="#3c7799"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-badge :is-dot="count==0 || !count ? false:true">
            <el-submenu index="1">
              <template slot="title">
                <el-avatar :size="50" fit="scale-down" :src="require('../assets/touxiang.jpg')"></el-avatar>
                <span style="color:#fff; font-size:15px">{{ username }}</span>
              </template>
              <el-menu-item index="1-1" @click="toPending" v-if="isShow">
                <el-badge
                  :value="count==0 || !count ? 0:count"
                  :hidden="count==0 || !count ? true:false"
                >
                  <i class="iconfont icon-daishenpizhishi" style="margin-right:10px"></i>待审批
                </el-badge>
              </el-menu-item>
              <el-menu-item index="1-2" @click="logout">
                <i class="iconfont icon-tuichudenglu" style="margin-right:10px"></i>退出
              </el-menu-item>
            </el-submenu>
          </el-badge>
        </el-menu>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="asideCon" @click="rl">
          <i :class="rlicon"></i>
        </div>
        <el-menu
          class="aside_menu"
          @select="handleSelect"
          :unique-opened="true"
          :collapse="isCollapse"
          :default-active="activeIndex"
          background-color="#3c7792"
          router
        >
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="item.icon"></i>
              &nbsp;
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item :index="child.path" v-for="child in item.children">
              <template>
                <i :class="child.icon"></i>
                <span slot="title">{{ child.title }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: "Index",
  data() {
    return {
      menulist: [],
      isCollapse: false,
      username: "",
      asideWidth: "200px",
      rlicon: "el-icon-d-arrow-left",
      activeIndex: "0",
      count: 0,
      isShow:true,
    };
  },
  created() {
    this.get_menu();
    this.username = window.sessionStorage.getItem("username");
    this.get_pendingOrder();
  },
  methods: {
    toPending() {
      this.$router.push("/pending");
    },
    handleSelect(key, keyPath) {
      this.activeIndex = key;
    },
    rl() {
      this.isCollapse ? (this.isCollapse = false) : (this.isCollapse = true);
      this.isCollapse
        ? (this.rlicon = "el-icon-d-arrow-right")
        : (this.rlicon = "el-icon-d-arrow-left");
    },
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async get_pendingOrder() {
      const { data: res } = await this.$ajax.get("/pending/?offset=0&limit=1");
      if(res.isemp) this.isShow=false
      this.count = res.total;
    },
    async get_menu() {
      // console.log(this)
      const { data: res } = await this.$ajax.post("/menu").catch(error => {
        this.$message({
          type: "error",
          center: true,
          message: "登录异常请重新登录"
        });
        this.$router.push("/login");
      });
      if (!res) this.$message.error("菜单获取失败");
      this.menulist = res.data;
      // console.log(this.menulist)
    }
  }
};
</script>

<style lang="less" scoped>
.el-badge {
  display: flex;
}
.p_class {
  margin-right: 10px;
}
.el-container {
  height: 100%;

  .el-header {
    background-color: #3c7799;
    padding-left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    div {
      display: flex;
      align-items: center;
      height: 100%;

      img {
        height: 100%;
        border-radius: 30%;
      }

      span {
        color: #fff;
        font-size: 25px;
        margin-left: 10px;
      }
    }
  }

  .el-aside {
    background-color: #3c7792;

    .asideCon {
      i {
        margin-left: 45%;
        cursor: pointer;
      }
      
    }

    .aside_menu {
      background-color: #3c7792;
      border-right: 0;
      transition: width 1ms;

      el-submenu {
        background-color: #3c7792;
      }

      .el-menu-item {
        background-color: #3c7792;
        transition: width 3s;
      }
    }
  }

  .el-main {
    background-color: aliceblue;
  }
}
</style>
<style  >
.el-badge__content.is-dot {
  margin-top: 10px !important;
}
.iconfont{
        margin-right: 5px ;
        margin-left: 3px;
      }
</style>