<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>实例管理</el-breadcrumb-item>
      <el-breadcrumb-item>数据库账号管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="选择实例">
          <el-select
              v-model="selectHost"
              placeholder="请选择实例地址"
              @change="instance_user_list"
          >
            <el-option
                v-for="item in options"
                :key="item.id"
                :value="item.id"
                :label="item.ins_name+'/'+item.host"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="instance_user_list">刷新</el-button>
        <el-button type="success" @click="instance_user_create_dialogFormVisible = true;instance_user_create_form.instance_id=selectHost">+创建账号
        </el-button>
      </el-form>

      <el-dialog title="创建账号" :visible.sync="instance_user_create_dialogFormVisible">
        <el-form :model="instance_user_create_form" :rules="instance_user_create_rules" ref="instance_user_create_form" label-width="100px"
                 class="demo-ruleForm">

          <el-form-item label="实例地址" prop="instance_id">
            <el-select
                v-model="instance_user_create_form.instance_id"
                placeholder="请选择实例地址"
            >
              <el-option
                  v-for="item in options"
                  :key="item.id"
                  :value="item.id"
                  :label="item.ins_name+'/'+item.host"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据库账号" prop="user">
            <el-input v-model="instance_user_create_form.user"></el-input>
          </el-form-item>
          <el-form-item label="主机" prop="host">
            <el-input v-model="instance_user_create_form.host"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password1">
            <el-input v-model="instance_user_create_form.password1" show-password></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="password2">
            <el-input v-model="instance_user_create_form.password2" show-password></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="instance_user_create_dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="instance_user_create('instance_user_create_form')">创建</el-button>
        </div>
      </el-dialog>

      <el-table
          :data="tbs" style="width: 100%" border stripe>
        <el-table-column width="300" label="账号" prop="user_host" align="center" header-align="center"></el-table-column>
        <el-table-column label="权限" align="left" header-align="center">
          <template slot-scope="scope">
            <li v-for="item in scope.row.privileges" :key="item">
              {{ item[0] }}
              <el-button type="warning" size="mini" @click="revoke(item[0])">回收权限</el-button>
            </li>
          </template>
        </el-table-column>
        <el-table-column width="300" label="操作" align="left" header-align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini"
                       @click="grant_dialogFormVisible=true;grant_form.user_host=scope.row.user_host;grant_form.instance_id=selectHost">授权
            </el-button>
            <el-button type="warning" size="mini"
                       @click="instance_user_reset_pwd_dialogFormVisible=true;instance_user_reset_pwd_form.user_host=scope.row.user_host;instance_user_reset_pwd_form.instance_id=selectHost">
              改密
            </el-button>
            <el-button type="danger" size="mini" @click="instance_user_delete(scope.row.user_host)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="修改密码" :visible.sync="instance_user_reset_pwd_dialogFormVisible">
        <el-form :model="instance_user_reset_pwd_form" :rules="instance_user_reset_pwd_rules" ref="instance_user_reset_pwd_form" label-width="100px"
                 class="demo-ruleForm">

          <el-form-item label="实例地址" prop="instance_id">
            <el-select
                v-model="selectHost"
                placeholder="实例地址"
                disabled
            >
              <el-option
                  v-for="item in options"
                  :key="item.id"
                  :value="item.id"
                  :label="item.ins_name+'/'+item.host"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据库账号" prop="user_host">
            <el-input v-model="instance_user_reset_pwd_form.user_host" disabled></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password1">
            <el-input v-model="instance_user_reset_pwd_form.password1" show-password></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="password2">
            <el-input v-model="instance_user_reset_pwd_form.password2" show-password></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="instance_user_reset_pwd_dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="instance_user_reset_pwd('instance_user_reset_pwd_form')">修改</el-button>
        </div>
      </el-dialog>

      <el-dialog title="授权变更" :visible.sync="grant_dialogFormVisible">
        <el-form :model="grant_form" ref="grant_form" label-width="100px" class="demo-ruleForm">

          <el-form-item label="实例地址" prop="instance_id">
            <el-select
                v-model="selectHost"
                placeholder="实例地址"
                disabled
            >
              <el-option
                  v-for="item in options"
                  :key="item.id"
                  :value="item.id"
                  :label="item.ins_name+'/'+item.host"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据库账号" prop="user_host">
            <el-input v-model="grant_form.user_host" disabled></el-input>
          </el-form-item>
          <el-form-item label="授权类型：" prop="instance_id">
            <el-select
                v-model="grant_form.priv_type"
                placeholder="授权类型："
                @change="get_db('queryRef')"
            >
              <el-option
                  v-for="item in priv_type_li"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择数据库：" v-if="grant_form.priv_type===1">
            <el-select
                multiple
                v-model="grant_form.db_name"
                placeholder="选择数据库："
            >
              <el-option v-for="item in dbs" :key="item.db" :value="item.db" :label="item.db"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择数据库：" v-if="grant_form.priv_type===2">
            <el-select
                v-model="grant_form.db_name[0]"
                placeholder="选择数据库："
                @change="getTable"
            >
              <el-option v-for="item in dbs" :key="item.db" :value="item.db" :label="item.db"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择表：" v-if="grant_form.priv_type===2">
            <el-select
                multiple
                v-model="grant_form.tb_name"
                placeholder="选择表："
            >
              <el-option v-for="item in tabs" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="grant_form.priv_type===0">
            <el-form-item label="权限选择：">
              <template>
                <el-checkbox-group v-model="grant_form.privs.global_privs">
                  <el-checkbox-button disabled>数据</el-checkbox-button>
                  <el-checkbox label="SELECT"></el-checkbox>
                  <el-checkbox label="INSERT"></el-checkbox>
                  <el-checkbox label="UPDATE"></el-checkbox>
                  <el-checkbox label="DELETE"></el-checkbox>
                  <el-checkbox label="FILE"></el-checkbox>
                  <br>
                  <el-checkbox-button disabled>结构</el-checkbox-button>
                  <el-checkbox label="CREATE"></el-checkbox>
                  <el-checkbox label="ALTER"></el-checkbox>
                  <el-checkbox label="INDEX"></el-checkbox>
                  <el-checkbox label="DROP"></el-checkbox>
                  <el-checkbox label="CREATE TEMPORARY TABLES"></el-checkbox>
                  <el-checkbox label="SHOW VIEW"></el-checkbox>
                  <el-checkbox label="CREATE ROUTINE"></el-checkbox>
                  <el-checkbox label="ALTER ROUTINE"></el-checkbox>
                  <el-checkbox label="EXECUTE"></el-checkbox>
                  <el-checkbox label="CREATE VIEW"></el-checkbox>
                  <el-checkbox label="EVENT"></el-checkbox>
                  <el-checkbox label="TRIGGER"></el-checkbox>
                  <br>
                  <el-checkbox-button disabled>管理</el-checkbox-button>
                  <el-checkbox label="GRANT"></el-checkbox>
                  <el-checkbox label="SUPER"></el-checkbox>
                  <el-checkbox label="PROCESS"></el-checkbox>
                  <el-checkbox label="RELOAD"></el-checkbox>
                  <el-checkbox label="SHUTDOWN"></el-checkbox>
                  <el-checkbox label="SHOW DATABASES"></el-checkbox>
                  <el-checkbox label="LOCK TABLES"></el-checkbox>
                  <el-checkbox label="REFERENCES"></el-checkbox>
                  <el-checkbox label="REPLICATION CLIENT"></el-checkbox>
                  <el-checkbox label="REPLICATION SLAVE"></el-checkbox>
                  <el-checkbox label="CREATE USER"></el-checkbox>
                </el-checkbox-group>
              </template>
            </el-form-item>

          </div>
          <div v-if="grant_form.priv_type===1">
            <el-form-item label="权限选择：">
              <template>
                <el-checkbox-group v-model="grant_form.privs.db_privs">
                  <el-checkbox-button disabled>数据</el-checkbox-button>
                  <el-checkbox label="SELECT"></el-checkbox>
                  <el-checkbox label="INSERT"></el-checkbox>
                  <el-checkbox label="UPDATE"></el-checkbox>
                  <el-checkbox label="DELETE"></el-checkbox>
                  <br>
                  <el-checkbox-button disabled>结构</el-checkbox-button>
                  <el-checkbox label="CREATE"></el-checkbox>
                  <el-checkbox label="ALTER"></el-checkbox>
                  <el-checkbox label="INDEX"></el-checkbox>
                  <el-checkbox label="DROP"></el-checkbox>
                  <el-checkbox label="CREATE TEMPORARY TABLES"></el-checkbox>
                  <el-checkbox label="SHOW VIEW"></el-checkbox>
                  <el-checkbox label="CREATE ROUTINE"></el-checkbox>
                  <el-checkbox label="ALTER ROUTINE"></el-checkbox>
                  <el-checkbox label="EXECUTE"></el-checkbox>
                  <el-checkbox label="CREATE VIEW"></el-checkbox>
                  <el-checkbox label="EVENT"></el-checkbox>
                  <el-checkbox label="TRIGGER"></el-checkbox>
                  <br>
                  <el-checkbox-button disabled>管理</el-checkbox-button>
                  <el-checkbox label="GRANT"></el-checkbox>
                  <el-checkbox label="LOCK TABLES"></el-checkbox>
                  <el-checkbox label="REFERENCES"></el-checkbox>
                </el-checkbox-group>
              </template>
            </el-form-item>

          </div>
          <div v-if="grant_form.priv_type===2">
            <el-form-item label="权限选择：">
              <template>
                <el-checkbox-group v-model="grant_form.privs.tb_privs">
                  <el-checkbox-button disabled>数据</el-checkbox-button>
                  <el-checkbox label="SELECT"></el-checkbox>
                  <el-checkbox label="INSERT"></el-checkbox>
                  <el-checkbox label="UPDATE"></el-checkbox>
                  <el-checkbox label="DELETE"></el-checkbox>
                  <br>
                  <el-checkbox-button disabled>结构</el-checkbox-button>
                  <el-checkbox label="CREATE"></el-checkbox>
                  <el-checkbox label="ALTER"></el-checkbox>
                  <el-checkbox label="INDEX"></el-checkbox>
                  <el-checkbox label="DROP"></el-checkbox>
                  <el-checkbox label="SHOW VIEW"></el-checkbox>
                  <el-checkbox label="CREATE VIEW"></el-checkbox>
                  <el-checkbox label="TRIGGER"></el-checkbox>
                  <br>
                  <el-checkbox-button disabled>管理</el-checkbox-button>
                  <el-checkbox label="GRANT"></el-checkbox>
                  <el-checkbox label="REFERENCES"></el-checkbox>
                </el-checkbox-group>
              </template>
            </el-form-item>

          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="grant_dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="grant('grant_form')">提交</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import sqlFormatter from "sql-formatter";
import hljs from "highlight.js";
import MarkdownItVue from "markdown-it-vue";
import {formatTimeToStr} from "../plugins/dateformat";

let CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/selection/active-line");
require("codemirror/mode/sql/sql");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/sql-hint");

export default {
  components: {
    MarkdownItVue
  },
  name: "Query",
  data() {
    return {
      options: [],
      selectHost: '',
      tbs: [],
      instance_user_create_dialogFormVisible: false,
      instance_user_create_form: {
        instance_id: this.selectHost,
        user: '',
        host: '',
        password1: '',
        password2: '',
      },
      instance_user_create_rules: {
        instance_id: [{required: true, message: '请选择实例', trigger: 'change'}],
        user: [{required: true, message: '请输入用户名', trigger: 'blur'},],
        host: [{required: true, message: '请输入主机', trigger: 'blur'},],
        password1: [{required: true, message: '请输入密码', trigger: 'blur'}, {min: 8, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur'}],
        password2: [{required: true, message: '请输入密码', trigger: 'blur'}, {min: 8, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur'}],
      },
      instance_user_reset_pwd_rules: {
        password1: [{required: true, message: '请输入密码', trigger: 'blur'}, {min: 8, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur'}],
        password2: [{required: true, message: '请输入密码', trigger: 'blur'}, {min: 8, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur'}],

      },
      instance_user_reset_pwd_form: {
        instance_id: this.selectHost,
        user_host: '',
        password1: '',
        password2: '',
      },
      instance_user_reset_pwd_dialogFormVisible: false,
      grant_form: {
        instance_id: this.selectHost,
        user_host: '',
        priv_type: 0,
        privs: {global_privs: [], db_privs: [], tb_privs: []},
        db_name: [],
        tb_name: [],
      },
      grant_dialogFormVisible: false,
      priv_type_li: [{id: 0, name: '全局权限'}, {id: 1, name: '库权限'}, {id: 2, name: '表权限'},],
      dbs: [],
      tabs: [],
    };
  },
  mounted() {
    this.get_ins();
  },
  methods: {
    async get_ins() {
      const {data: res} = await this.$ajax
          .get("/instance/")
          .catch(() => {
            return this.$notify.error({title: "错误", message: "获取实例失败"});
          });
      if (res.msg !== "success") return this.$message.error("获取实例失败");
      this.options = res.data;
    },
    async instance_user_list() {
      const {data: res} = await this.$ajax
          .post("/instance_user_list/", {"id": this.selectHost,})
          .catch(() => {
            return this.$notify.error({title: "错误", message: "请求失败"});
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
      this.tbs = res.data;
    },
    async instance_user_create(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // alert('submit!');
          const {data: res} = await this.$ajax
              .post("/instance_user_create/", this.instance_user_create_form)
              .catch(() => {
                return this.$notify.error({title: "错误", message: "请求失败"});
              });
          if (res.msg !== "success") return this.$message.error(res.msg);
          this.instance_user_create_dialogFormVisible = false
          this.selectHost = this.instance_user_create_form.instance_id
          await this.instance_user_list()
        } else {
          console.log('error submit!!');
          return false;
        }
      });

    },
    async instance_user_delete(user_host) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning"
      })
          .then(async () => {
            const {data: res} = await this.$ajax
                .post("/instance_user_delete/", {"instance_id": this.selectHost, "user_host": user_host})
                .catch(() => {
                  return this.$notify.error({title: "错误", message: "请求失败"});
                });
            if (res.msg !== "success") return this.$message.error(res.msg);
            await this.instance_user_list()
          })

    },
    async revoke(grant_sql) {
      this.$confirm("此操作将删除改权限, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        type: "warning"
      })
          .then(async () => {
            const {data: res} = await this.$ajax
                .post("/revoke/", {"instance_id": this.selectHost, "grant_sql": grant_sql})
                .catch(() => {
                  return this.$notify.error({title: "错误", message: "请求失败"});
                });
            if (res.msg !== "success") return this.$message.error(res.msg);
            await this.instance_user_list()
          })
    },
    async instance_user_reset_pwd(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // alert('submit!');
          const {data: res} = await this.$ajax
              .post("/instance_user_reset_pwd/", this.instance_user_reset_pwd_form)
              .catch(() => {
                return this.$notify.error({title: "错误", message: "请求失败"});
              });
          if (res.msg !== "success") return this.$message.error(res.msg);
          this.instance_user_reset_pwd_dialogFormVisible = false
        } else {
          console.log('error submit!!');
          return false;
        }
      });

    },
    async get_db(form) {
      const {data: res} = await this.$ajax
          .get(`/get_schema/?id=${this.selectHost}`)
          .catch(() => {
            return this.$notify.error({
              title: "错误",
              message: "获取数据库失败，请检查实例连接配置"
            });
          });
      if (res.msg !== "success")
        return this.$message.error("获取数据库失败，请检查实例连接状态");
      this.dbs = res.data;
    },
    async getTable() {
      const {data: res} = await this.$ajax.get(
          `/get_table/?id=${this.selectHost}&dbname=${this.grant_form.db_name[0]}`
      );
      if (res.msg !== "success") return this.$message.error("库中数据表获取失败");
      this.tabs = Object.keys(res.data.tables);
    },
    async grant(formName) {
      const {data: res} = await this.$ajax
          .post("/grant/", this.grant_form)
          .catch(() => {
            return this.$notify.error({title: "错误", message: "请求失败"});
          });
      if (res.msg !== "success") return this.$message.error(res.msg);
      this.grant_dialogFormVisible = false
      await this.instance_user_list()
    },
  }
};
</script>

<style lang="less">
.el-card {
  margin-top: 20px;
  min-height: 630px;
}

ul {
  margin-top: 0;
  padding: 0 0 0 0;
}

.el-form-item__label {
  color: black;
  font-weight: 600;
}

.el-dialog__wrapper {
  overflow: auto;
  overflow-x: hidden;
}


.el-tag {
  margin-top: 5px;
  margin-inline-end: 5px;
}

.CodeMirror-scroll {
  padding-bottom: 10px;
}
</style>
