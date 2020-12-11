import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './routes'
import './utils/codemirror'

import TRC21IssuerAritfacts from '../build/contracts/TRC21Issuer.json'
import TomoXListingAritfacts from '../build/contracts/TOMOXListing.json'
import TomoBridgeWrapTokenAbi from '../build/contracts/TomoBridgeWrapToken'
import MyTRC21Abi from '../build/contracts/MyTRC21'
import MyTRC21MintableAbi from '../build/contracts/MyTRC21Mintable'
import ERC20Abi from '../build/contracts/ERC20'

import Web3 from 'web3'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import TrezorConnect from 'trezor-connect'
import * as HDKey from 'hdkey'
import * as localStorage from 'store'
import axios from 'axios'
import Vuex from 'vuex'
import Toasted from 'vue-toasted'
import Transport from '@ledgerhq/hw-transport-u2f' // for browser
import Eth from '@ledgerhq/hw-app-eth'
import VueCodeMirror from 'vue-codemirror'
import Transaction from 'ethereumjs-tx'
import * as ethUtils from 'ethereumjs-util'
// import * as contract from 'truffle-contract'

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
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
    },
    singleton: true
})

Vue.use(VueCodeMirror, {
    options: {
        readOnly: true,
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        mode: 'text/javascript',
        matchBrackets: true,
        openDialog: false,
        theme: 'eclipse'
    }
})

// set trezor's manifest
TrezorConnect.manifest({
    email: 'admin@tomochain.com',
    appUrl: 'https://master.tomochain.com'
})
const store = new Vuex.Store({
    state: {
        address: null
    }
})

Vue.prototype.isElectron = !!(window && window.process && window.process.type)

Vue.prototype.setupProvider = async function (provider, wjs) {
    Vue.prototype.NetworkProvider = provider
    // Vue.prototype.TRC21Issuer = contract(TRC21IssuerAritfacts)
    if (wjs instanceof Web3) {
        Vue.prototype.web3 = wjs
        const config = await getConfig()
        localStorage.set('configIssuer', config)
        const chainConfig = config.blockchain
        Vue.prototype.TomoBridgeWrapToken = TomoBridgeWrapTokenAbi
        Vue.prototype.MyTRC21 = MyTRC21Abi
        Vue.prototype.MyTRC21Mintable = MyTRC21MintableAbi
        Vue.prototype.ERC20 = ERC20Abi
        if (chainConfig.issuerAddress) {
            Vue.prototype.TRC21Issuer = new wjs.eth.Contract(
                TRC21IssuerAritfacts.abi,
                chainConfig.issuerAddress
            )
        }
        if (chainConfig.tomoXAddress) {
            Vue.prototype.TomoXListing = new wjs.eth.Contract(
                TomoXListingAritfacts.abi,
                chainConfig.tomoXAddress
            )
        }
    }
}

Vue.prototype.getAccount = async function () {
    const provider = Vue.prototype.NetworkProvider || ''
    const wjs = Vue.prototype.web3
    let account
    switch (provider) {
    case 'metamask':
        // Request account access if needed - for metamask
        if (window.ethereum) {
            // await window.ethereum.enable()
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        }
        account = (await wjs.eth.getAccounts())[0]
        break
    case 'pantograph':
        // Request account access if needed - for pantograph
        if (window.tomochain) {
            await window.tomochain.enable()
        }
        account = (await wjs.eth.getAccounts())[0]
        break
    case 'tomowallet':
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
                let transport = await Transport.create()
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
            console.log(error)
            throw error
        }
        break
    case 'trezor':
        const payload = Vue.prototype.trezorPayload || localStorage.get('trezorPayload')
        const offset = localStorage.get('offset')
        account = Vue.prototype.HDWalletCreate(
            payload,
            offset
        )
        localStorage.set('trezorPayload', { xpub: payload.xpub })
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

Vue.prototype.HDWalletCreate = (payload, index) => {
    const provider = Vue.prototype.NetworkProvider
    let derivedKey
    if (provider === 'trezor') {
        const xpub = payload.xpub
        const hdWallet = HDKey.fromExtendedKey(xpub)
        derivedKey = hdWallet.derive('m/' + index)
    } else {
        const pubKey = payload.publicKey
        const chainCode = payload.chainCode
        const hdkey = new HDKey()
        hdkey.publicKey = Buffer.from(pubKey, 'hex')
        hdkey.chainCode = Buffer.from(chainCode, 'hex')
        derivedKey = hdkey.derive('m/' + index)
    }
    let pubKey = ethUtils.bufferToHex(derivedKey.publicKey)
    const buff = ethUtils.publicToAddress(pubKey, true)

    return ethUtils.bufferToHex(buff)
}

Vue.prototype.unlockLedger = async () => {
    try {
        if (!Vue.prototype.appEth) {
            let transport = await Transport.create()
            Vue.prototype.appEth = await new Eth(transport)
        }
        const path = localStorage.get('hdDerivationPath')

        const result = await Vue.prototype.appEth.getAddress(
            path,
            false,
            true
        )
        Vue.prototype.ledgerPayload = result
    } catch (error) {
        console.log(error)
        throw error
    }
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
            let convertedAddress
            let balance
            let web3
            if (!Vue.prototype.web3) {
                await Vue.prototype.detectNetwork('trezor')
            }
            web3 = Vue.prototype.web3
            for (let i = offset; i < (offset + limit); i++) {
                convertedAddress = Vue.prototype.HDWalletCreate(payload, i)
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
        let transport = await Transport.create()
        Vue.prototype.appEth = await new Eth(transport)
    }
    const payload = Vue.prototype.ledgerPayload
    let web3 = Vue.prototype.web3
    let balance = 0
    let convertedAddress
    let wallets = {}

    for (let i = offset; i < (offset + limit); i++) {
        convertedAddress = Vue.prototype.HDWalletCreate(payload, i)
        balance = await web3.eth.getBalance(convertedAddress)
        wallets[i] = {
            address: convertedAddress,
            balance: parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(2)
        }
    }
    Vue.prototype.ledgerPayload = ''
    return wallets
}

const getConfig = Vue.prototype.appConfig = async function () {
    let config = await axios.get('/api/config')
    return config.data
}

Vue.prototype.detectNetwork = async function (provider) {
    try {
        let wjs = this.web3
        if (!wjs) {
            switch (provider) {
            case 'tomowallet':
            case 'metamask':
                if (window.ethereum) {
                    // var p = window.web3.currentProvider
                    var p = window.ethereum
                    wjs = new Web3(p)
                }
                break
            case 'pantograph':
                if (window.tomoWeb3) {
                    if (window.tomoWeb3.currentProvider) {
                        let pp = window.tomoWeb3.currentProvider
                        wjs = new Web3(pp)
                    } else {
                        wjs = window.tomoWeb3
                    }
                }
                break
            case 'trezor':
            case 'ledger':
                if (provider === 'ledger') {
                    if (!Vue.prototype.appEth) {
                        let transport = await Transport.create()
                        Vue.prototype.appEth = await new Eth(transport)
                    }
                }
                const config = localStorage.get('configIssuer') || await getConfig()
                const chainConfig = config.blockchain
                wjs = new Web3(new Web3.providers.HttpProvider(chainConfig.rpc))
                break
            default:
                break
            }
            await this.setupProvider(provider, wjs)
        }
    } catch (error) {
        console.log(error)
    }
}

/**
 * @param object txParams
 * @return object signature {r, s, v}
 */
Vue.prototype.signTransaction = async function (txParams) {
    try {
        const path = localStorage.get('hdDerivationPath')
        const provider = Vue.prototype.NetworkProvider
        let signature
        if (provider === 'ledger') {
            const config = localStorage.get('configIssuer') || await getConfig()
            const chainConfig = config.blockchain
            const rawTx = new Transaction(txParams)
            rawTx.v = Buffer.from([chainConfig.networkId])
            const serializedRawTx = rawTx.serialize().toString('hex')
            signature = await Vue.prototype.appEth.signTransaction(
                path,
                serializedRawTx
            )
        }
        if (provider === 'trezor') {
            const result = await TrezorConnect.ethereumSignTransaction({
                path,
                transaction: txParams
            })
            signature = result.payload
        }
        return signature
    } catch (error) {
        console.log(error)
        throw error
    }
}

/**
 * @param object txParams
 * @param object signature {r,s,v}
 * @return transactionReceipt
 */
Vue.prototype.sendSignedTransaction = function (txParams, signature) {
    return new Promise((resolve, reject) => {
        try {
            // "hexify" the keys
            Object.keys(signature).map((key, _) => {
                if (signature[key].startsWith('0x')) {
                    return signature[key]
                } else signature[key] = '0x' + signature[key]
            })
            let txObj = Object.assign({}, txParams, signature)
            let tx = new Transaction(txObj)
            let serializedTx = '0x' + tx.serialize().toString('hex')
            // web3 v0.2, method name is sendRawTransaction
            // You are using web3 v1.0. The method was renamed to sendSignedTransaction.
            Vue.prototype.web3.eth.sendSignedTransaction(
                serializedTx
            ).on('transactionHash', (txHash) => {
                resolve(txHash)
            }).catch(error => reject(error))
            // if (!rs.tx && rs.transactionHash) {
            //     rs.tx = rs.transactionHash
            // }
        } catch (error) {
            reject(error)
        }
    })
}

Vue.prototype.signMessage = async function (message) {
    try {
        const path = localStorage.get('hdDerivationPath')
        const provider = Vue.prototype.NetworkProvider
        let result
        switch (provider) {
        case 'ledger':
            const signature = await Vue.prototype.appEth.signPersonalMessage(
                path,
                Buffer.from(message).toString('hex')
            )
            let v = signature['v'] - 27
            v = v.toString(16)
            if (v.length < 2) {
                v = '0' + v
            }
            result = '0x' + signature['r'] + signature['s'] + v
            break
        case 'trezor':
            const sig = await TrezorConnect.ethereumSignMessage({
                path,
                message
            })
            result = '0x' + sig.payload.signature || ''
            break
        default:
            break
        }
        return result
    } catch (error) {
        console.log(error)
        throw error
    }
}

Vue.prototype.formatCurrencySymbol = function (number, unit) {
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

Vue.prototype.formatNumber = function (number) {
    let seps = (number || 0).toString().split('.')
    seps[0] = seps[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return seps.join('.')
}

Vue.prototype.serializeQuery = function (params, prefix) {
    const query = Object.keys(params).map((key) => {
        const value = params[key]

        if (params.constructor === Array) {
            key = `${prefix}[]`
        } else {
            if (params.constructor === Object) {
                key = (prefix ? `${prefix}[${key}]` : key)
            }
        }

        return value === 'object' ? this.serializeQuery(value, key) : `${key}=${encodeURIComponent(value)}`
    })

    return [].concat.apply([], query).join('&')
}

Vue.prototype.formatCapacity = function (value) {
    // Nine Zeroes for Billions
    return Math.abs(Number(value)) >= 1.0e+9
        ? Math.abs(Number(value)) / 1.0e+9 + 'B'
        // Six Zeroes for Millions
        : Math.abs(Number(value)) >= 1.0e+6
            ? Math.abs(Number(value)) / 1.0e+6 + 'M'
        // Three Zeroes for Thousands
            : Math.abs(Number(value)) >= 1.0e+3
                ? Math.abs(Number(value)) / 1.0e+3 + 'K'
                : Math.abs(Number(value))
}

/**
 * @return TomoValidator contract instance
 */
Vue.prototype.getTRC21IssuerInstance = async function () {
    // workaround for web3 version 1.0.0
    // @link https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
    if (typeof Vue.prototype.TRC21Issuer.currentProvider.sendAsync !== 'function') {
        Vue.prototype.TRC21Issuer.currentProvider.sendAsync = function () {
            return Vue.prototype.TRC21Issuer.currentProvider.send.apply(
                Vue.prototype.TRC21Issuer.currentProvider,
                arguments
            )
        }
    }
    let instance = await Vue.prototype.TRC21Issuer.deployed()
    return instance
}

const router = new VueRouter({
    mode: 'history',
    routes
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
