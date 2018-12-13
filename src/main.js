/**
 * @fileoverview Main entry point of the Vue app
 */

import Vue from 'vue'
import Vuetify from 'vuetify'

import config from './config.js'
import auth from './modules/auth'
import App from './App'
import router from './router.js'
import store from './store'
import VeeValidate from 'vee-validate'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(VeeValidate)

document.title = config.title

async function init() {
  if (config.isUser) {
    await auth.restoreLastUser()
  }
  return new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  })
}

init()
