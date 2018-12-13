/**
 * @file Central storage place for the app. All globally
 * available data should be stored here. Any componenent
 * can access this via this.$store, or importing this
 * module as a singleton. The storage object is a Vuex
 * object and uses mutations and accessors.
 */

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {
      authenticated: false
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    }
  }
})

export default store
