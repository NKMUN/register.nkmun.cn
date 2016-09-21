import Vue from 'vue'
import App from './App'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import VueValidator from 'vue-validator'
import { configRouter } from './route-config'
import { getToken, setToken } from './lib/token-store'

Vue.use(VueResource)
Vue.use(VueRouter)
Vue.use(VueValidator)

Vue.http.options.root = '/api'
Vue.http.options.timeout = 5000

// load stored token
let token = getToken()
if (token)
  setToken(token, true)

// create router
const router = new VueRouter({
  history: true,
  saveScrollPosition: true
})

// configure router
configRouter(router)

/* eslint-disable no-new */

router.start({components: { App }}, 'body')
