import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Login from './components/Login.vue'

import Web3 from 'web3'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(VueRouter)

Vue.prototype.isElectron = !!(window && window.process && window.process.type)

Vue.prototype.setupProvider = function (provider, wjs) {
    Vue.prototype.NetworkProvider = provider
    if (wjs instanceof Web3) {
        Vue.prototype.web3 = wjs
    }
}

Vue.prototype.getAccount = async function () {
    const provider = Vue.prototype.NetworkProvider || ''
    const wjs = Vue.prototype.web3
    let account
    if (provider === 'metamask') {
        // Request account access if needed - for metamask
        await window.ethereum.enable()
    }
    switch (provider) {
    case 'metamask':
        account = (await wjs.eth.getAccounts())[0]
        break
    case 'custom':
        if (wjs.currentProvider.address) {
            account = wjs.currentProvider.address
        }

        if (wjs.currentProvider.addresses) {
            account = wjs.currentProvider.addresses[0]
        }
        break
    default:
        break
    }
    if (!account || account.length <= 0) {
        console.log(`Couldn't get any accounts! Make sure
            your Ethereum client is configured correctly.`)
    }
    return account
}

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/login', component: Login
        }
    ]
})

new Vue({ // eslint-disable-line no-new
    el: '#app',
    router: router,
    components: { App },
    template: '<App/>'
})
