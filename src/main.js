import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import {formatTimeToStr} from './plugins/dateformat'

import './assets/css/global.css'
import axios from 'axios'
import './assets/css/global.css'

import "codemirror/theme/dracula.css";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/hint/show-hint.css";
import "markdown-it-vue/dist/markdown-it-vue.css"

import "highlight.js/styles/darcula.css"
// import "highlight.js/styles/solarized-dark.css"

import "codemirror/addon/hint/sql-hint"
import "codemirror/addon/display/placeholder"
import echarts from 'echarts'





//这两行的位置很重要，很重要，重要
Vue.prototype.$ajax = axios;
// axios.defaults.baseURL = 'http://localhost:8800/api/v1';
axios.defaults.baseURL = 'http://localhost:8000/api/v1';
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')


Vue.prototype.$echarts = echarts

