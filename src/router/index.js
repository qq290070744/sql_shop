import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Index from '../components/Index'
import Dashboard from '../components/Dashboard'
import instance from "../components/Instance";
import Inspect from '../components/Inspect'
import Query from "../components/Query";
import Role from '../components/Role'
import User from '../components/User'
import Workorder from '../components/Workorder'
import Pending from '../components/Pending'
import Historyorder from '../components/Historyorder'
import Inception_show_variables from "@/components/Inception_show_variables";
import Inception_show_levels from "@/components/Inception_show_levels";
import Workorder_data_export from "@/components/Workorder_data_export";
import Historyorder_data_export from "@/components/Historyorder_data_export";
import Desensitization_info from "@/components/Desensitization_info";
import Slowlog_list from "@/components/Slowlog_list";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: '登录',
        component: Login
    },
    {
        path: '/index',
        name: '首页',
        redirect: '/dashboard',
        component: Index,
        children: [
            {
                path: '/dashboard',
                name: '首页面板',
                component: Dashboard
            },
            {
                path: '/instances',
                name: '实例列表',
                component: instance
            },
            {
                path: '/inspect',
                name: 'SQL审核',
                component: Inspect
            },
            {
                path: '/select',
                name: 'sql查询',
                component: Query
            },
            {
                path: '/roles',
                name: '角色列表',
                component: Role
            },
            {
                path: '/user',
                name: '用户列表',
                component: User
            },
            {
                path: '/workorder',
                name: '我的SQL工单',
                component: Workorder
            },
            {
                path: '/workorder_data_export',
                name: '我的数据导出工单',
                component: Workorder_data_export
            },
            {
                path: '/pending',
                name: '待审批',
                component: Pending
            },
            {
                path: '/historyorder',
                name: '历史SQL工单',
                component: Historyorder
            },
            {
                path: '/historyorder_data_export',
                name: '历史数据导出工单',
                component: Historyorder_data_export
            },
            {
                path: '/inception_show_variables',
                name: '审核规则',
                component: Inception_show_variables
            },
            {
                path: '/inception_show_levels',
                name: '自定义审核级别',
                component: Inception_show_levels
            },
            {
                path: '/get_desensitization_info_list',
                name: '获取脱敏字段列表',
                component: Desensitization_info
            },
            {
                path: '/get_slowlog_list',
                name: '慢日志列表',
                component: Slowlog_list
            },
        ]
    }
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next()
    const token = window.sessionStorage.getItem('token')
    if (!token) return next('/login')
    next()
})
export default router
