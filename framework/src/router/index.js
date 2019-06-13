/**
 * author chaoxuelei
 * 这里专门写路由
 */
import Vue from 'vue'
import Router from 'vue-router';
import index from '@/views/index';
import mainIndex from '@/views/homePage/homeMain';
import login from '@/views/login/login';
import demo from '@/views/demo/demo'
Vue.use(Router)
    
export default new Router({
 // mode: 'history',  //H5 history模式
  routes: [
    {
      path: '/login',
      name: 'login',
      component: login,
    },
    {
      path: '/',
      name: 'index',
      component: index,
      children:[{
        path: '/',
        name: 'mainIndex',
        component: mainIndex,
      },{
        path: '/demo',
        name: 'demo',
        component: demo,
      }]
    }
  ]
})
