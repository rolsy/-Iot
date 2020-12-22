// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// vuex
import store from './store/index'

import { Card, Button,Table,Row,Col,Select,Form,DatePicker,Alert,ConfigProvider,Input,Modal,Calendar,TimePicker,TreeSelect,Popconfirm,message,Tag,AutoComplete,Spin,Icon} from 'ant-design-vue'
Vue.use( Card );
Vue.use( Button );
Vue.use( Table );
Vue.use( Row );
Vue.use( Col );
Vue.use( Select );
Vue.use( Form );
Vue.use( DatePicker );
Vue.use( Alert );
Vue.use( ConfigProvider ); // 国际化组件
Vue.use( Input );
Vue.use( Modal );
Vue.use( Calendar );
Vue.use( TimePicker );
Vue.use( TreeSelect );
Vue.use( Popconfirm );
Vue.use( Tag );
Vue.use( AutoComplete );
Vue.use( Spin );
Vue.use( Icon );
import 'ant-design-vue/dist/antd.css'

Vue.prototype.$info=Modal.info;
Vue.prototype.$message = message;
//自定义样式，在所有样式文件的最后引入！
import '../static/css/myCss.css'
Vue.config.productionTip = false;

import axios from 'axios' //Ajax请求插件
Vue.prototype.$axios = axios;

import qs from 'qs' //url参数转化（parse和stringify）的js库
Vue.prototype.$qs = qs;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
