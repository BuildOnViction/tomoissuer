import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(VueRouter)

Vue.prototype.isElectron = !!(window && window.process && window.process.type)

const router = new VueRouter({
    mode: 'history',
    routes: [ ]
})

new Vue({ // eslint-disable-line no-new
    el: '#app',
    router: router,
    components: { App },
    template: '<App/>'
})
