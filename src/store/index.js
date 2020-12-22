import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
let store = new Vuex.Store({
  state: {
    token: ''
  },
  mutations: {
    changeToken (state, res) {
      state.token = res;
      console.log(res)
    },
  }
});
export default store
