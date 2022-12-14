import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入element-ui
import './plugins/element.js'
// 导入全局样式
import '@/assets/css/global.css'
// 导入字体图标
import '@/assets/fonts/iconfont.css'

// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 用请求拦截器挂载一个use函数，来对所有的请求进行预处理，加上token令牌
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 把axios添加到Vue的原型对象上
Vue.prototype.$http = axios


Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
