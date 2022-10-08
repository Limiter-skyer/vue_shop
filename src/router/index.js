import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/components/Login";
import Home from "@/components/Home"
import Welcome from "@/components/Welcome.vue"
import Users from "@/components/user/Users.vue";

Vue.use(VueRouter)

const routes = [
  {
    path:"/login",
    component:Login,
  },
  {
    path:"/",
    redirect:"/login"
  },
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users}
    ]
  },
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  // to:将要访问的路径
  // from:从哪个路径跳转而来
  // next:跳转函数，两种用法
  // next():直接放行
  // next('/login'):强制跳转到括号内的地址

  // 业务逻辑：不登录只能访问登录页，所以登录页所有用户都可以访问，
  if(to.path==='/login') return next()//登录页直接放行
  // 代码执行到这里，那么肯定不是访问登录页，此时就要验证用户有没有登录了，获取token来判断
  const tokenStr = sessionStorage.getItem('token');
  if(!tokenStr) return next('/login')//如果token不存在，那就强制跳转到登录页
  next();//如果token存在，放行
})

export default router
