import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Login from './components/Login.vue'
import Home from './components/Home.vue'

import Web3 from 'web3'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import TrezorConnect from 'trezor-connect'
import * as HDKey from 'ethereumjs-wallet/hdkey'
import * as localStorage from 'store'
import axios from 'axios'
import Vuex from 'vuex'
import Toasted from 'vue-toasted'
import Transport from '@ledgerhq/hw-transport-u2f' // for browser
import Eth from '@ledgerhq/hw-app-eth'

Vue.use(BootstrapVue)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(Toasted, {
    position: 'bottom-right',
    theme: 'bubble',
    duration: 4000,
    action : {
        text : 'Dismiss',
        onClick : (e, toastObject) => {
            toastObject.goAway(0)
        }
    }
})

// set trezor's manifest
TrezorConnect.manifest({
    email: 'admin@tomochain.com',
    appUrl: 'https://master.tomochain.com'
})
const store = new Vuex.Store({
    state: {
        walletLoggedIn: null
    }
})

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
        account = (await wjs.eth.getAccounts())[0]
        // if (wjs.currentProvider.address) {
        //     account = wjs.currentProvider.address
        // }

        // if (wjs.currentProvider.addresses) {
        //     account = wjs.currentProvider.addresses[0]
        // }
        break
    case 'ledger':
        try {
            if (!Vue.prototype.appEth) {
                let transport = await new Transport()
                Vue.prototype.appEth = await new Eth(transport)
            }
            let ethAppConfig = await Vue.prototype.appEth.getAppConfiguration()
            if (!ethAppConfig.arbitraryDataEnabled) {
                throw new Error(`Please go to App Setting
                    to enable contract data and display data on your device!`)
            }
            let result = await Vue.prototype.appEth.getAddress(
                localStorage.get('hdDerivationPath')
            )
            account = result.address
        } catch (error) {
            throw error
        }
        break
    case 'trezor':
        const xpub = (Vue.prototype.trezorPayload) ? Vue.prototype.trezorPayload.xpub
            : localStorage.get('trezorXpub')
        const offset = localStorage.get('offset')
        account = Vue.prototype.HDWalletCreate(
            xpub,
            offset
        )
        localStorage.set('trezorXpub', xpub)
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

Vue.prototype.HDWalletCreate = (xpub, index) => {
    const hdWallet = HDKey.fromExtendedKey(xpub)
    const node = hdWallet.deriveChild(index)

    return '0x' + node.getWallet().getAddress().toString('hex')
}

Vue.prototype.unlockTrezor = async () => {
    try {
        const result = await TrezorConnect.getPublicKey({
            path: localStorage.get('hdDerivationPath')
        })
        Vue.prototype.trezorPayload = result.payload
    } catch (error) {
        console.log(error)
        throw error
    }
}

Vue.prototype.loadTrezorWallets = async (offset, limit) => {
    try {
        const wallets = {}
        const payload = Vue.prototype.trezorPayload
        if (payload && !payload.error) {
            const xpub = payload.xpub
            let convertedAddress
            let balance
            let web3
            if (!Vue.prototype.web3) {
                await Vue.prototype.detectNetwork('trezor')
            }
            web3 = Vue.prototype.web3
            for (let i = offset; i < (offset + limit); i++) {
                convertedAddress = Vue.prototype.HDWalletCreate(xpub, i)
                balance = await web3.eth.getBalance(convertedAddress)
                wallets[i] = {
                    address: convertedAddress,
                    balance: parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(2)
                }
            }
            return wallets
        } else {
            throw payload.error || 'Something went wrong'
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}

Vue.prototype.loadMultipleLedgerWallets = async function (offset, limit) {
    let u2fSupported = await Transport.isSupported()
    if (!u2fSupported) {
        throw new Error(`U2F not supported in this browser. 
                Please try using Google Chrome with a secure (SSL / HTTPS) connection!`)
    }
    await Vue.prototype.detectNetwork('ledger')
    if (!Vue.prototype.appEth) {
        let transport = await new Transport()
        Vue.prototype.appEth = await new Eth(transport)
    }
    let web3 = Vue.prototype.web3
    let balance = 0
    let wallets = {}
    let walker = offset
    while (limit > 0) {
        let tail = '/' + walker.toString()
        let hdPath = localStorage.get('hdDerivationPath')
        hdPath += tail
        let result = await Vue.prototype.appEth.getAddress(
            hdPath
        )
        if (!result || !result.address) {
            return {}
        }
        balance = await web3.eth.getBalance(result.address)
        wallets[walker] = {
            address: result.address,
            balance: parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(2)
        }
        walker++
        limit--
    }
    return wallets
}

const getConfig = Vue.prototype.appConfig = async function () {
    let config = await axios.get('/api/config')
    return config.data
}

Vue.prototype.detectNetwork = async function (provider) {
    try {
        let wjs = this.web3
        const config = await getConfig()
        const chainConfig = config.blockchain
        if (!wjs) {
            switch (provider) {
            case 'metamask':
                if (window.web3) {
                    var p = window.web3.currentProvider
                    wjs = new Web3(p)
                }
                break
            case 'trezor':
            case 'ledger':
                wjs = new Web3(new Web3.providers.HttpProvider(chainConfig.rpc))
                break
            default:
                break
            }
        }
        await this.setupProvider(provider, await wjs)
    } catch (error) {
        console.log(error)
    }
}

Vue.prototype.formatCurrencySymbol = function (number) {
    let unit = this.getCurrencySymbol()

    if (unit === null) {
        unit = 'TOMO'
    }
    return `${number} ${unit}`
}

Vue.prototype.getCurrencySymbol = function () {
    return 'TOMO'
}

Vue.prototype.truncate = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = '...'

    let sepLen = separator.length
    let charsToShow = strLen - sepLen
    let frontChars = Math.ceil(charsToShow / 2)
    let backChars = Math.floor(charsToShow / 2)

    return fullStr.substr(0, frontChars) +
           separator +
           fullStr.substr(fullStr.length - backChars)
}

const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: Home },
        { path: '/login', component: Login }
    ]
})

router.beforeEach(async (to, from, next) => {
    const provider = Vue.prototype.NetworkProvider || localStorage.get('network') || null
    await Vue.prototype.detectNetwork(provider)
    next()
})

const EventBus = new Vue()

Vue.prototype.$bus = EventBus

new Vue({ // eslint-disable-line no-new
    el: '#app',
    store,
    router: router,
    components: { App },
    template: '<App/>'
})
