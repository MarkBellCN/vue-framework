/**
 * @Author:xlchao
 */

import Vue from 'vue'
import Vuex from 'vuex'

import state from './modules/state'
import mutations from './modules/mutations'
import actions from './modules/actions'
import getters from './getter'

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
});
