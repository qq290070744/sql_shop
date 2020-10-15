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
                name: 'DDL审核',
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
                component:Role
            },
            {
                path: '/user',
                name: '用户列表',
                component:User
            },
            {
                path: '/workorder',
                name: '我的工单',
                component:Workorder
            },
            {
                path: '/pending',
                name: '待审批',
                component:Pending
            },
            {
                path: '/historyorder',
                name: '历史工单',
                component:Historyorder
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
