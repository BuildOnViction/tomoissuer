import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'


Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    routes: [ ]
})

new Vue({ // eslint-disable-line no-new
    el: '#app',
    store,
    router: router,
    components: { App },
    template: '<App/>'
})
