<template>
    <div class="container">
        <div class="main-page-login">
            <h2 class="tmp-title-large">Unlock your wallet</h2>
            <p>Start by choosing the wallet you would like to unlock</p>
            <div class="content-page">
                <b-form
                    class="form-login"
                    novalidate
                    @submit.prevent="validate()">
                    <b-tabs v-model="wprovider">
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/coin98.png"
                                    alt="coin98 logo"
                                    @click="changeView" />
                                <span>Coin98</span>
                            </template>
                            <div class="inner-content tab-coin98">
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        type="submit">
                                        Unlock
                                    </b-button>
                                </div>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/viction.png"
                                    alt="viction logo"
                                    @click="changeView" />
                                <span>Viction</span>
                            </template>
                            <div class="inner-content tab-viction">
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        name="viction"
                                        type="submit">
                                        Unlock
                                    </b-button>
                                </div>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/ramper.png"
                                    alt="ramper logo"
                                    @click="changeView" />
                                <span>Ramper</span>
                            </template>
                            <div class="inner-content tab-ramper">
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        type="submit">
                                        Unlock
                                    </b-button>
                                </div>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/logo-metamask.png"
                                    alt="logo-metamask.png"
                                    @click="changeView" />
                                <span>Metamask</span>
                            </template>
                            <div class="inner-content tab-metamask">
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        type="submit">
                                        Unlock
                                    </b-button>
                                </div>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/logo-ledgerwallet.png"
                                    alt="logo-ledgerwallet.png"
                                    @click="changeView" />
                                <span>Ledger Wallet</span>
                            </template>
                            <div class="inner-content tab-ledgerwallet">
                                <b-form
                                    class="form-login"
                                    novalidate
                                    @submit.prevent="validate()">
                                    <b-form-group
                                        class="mb-4"
                                        label="Select HD derivation path"
                                        label-for="hdPath">
                                        <b-form-input
                                            v-model="hdPath"
                                            type="text"
                                            placeholder="m/44’/889’/0’/0" />
                                        <b-form-text>
                                            To unlock the wallet, try paths
                                            <span
                                                class="hd-path"
                                                @click="changePath(`m/44'/60'/0'`)">m/44'/60'/0'</span>
                                            or <span
                                                class="hd-path"
                                                @click="changePath(`m/44'/60'/0'/0`)">m/44'/60'/0'/0</span>
                                            with Ethereum App,
                                            or try path
                                            <span
                                                class="hd-path"
                                                @click="changePath(`m/44'/889'/0'/0`)">m/44'/889'/0'/0</span>
                                            with Viction App (on Ledger).
                                        </b-form-text>
                                    </b-form-group>
                                    <div class="btn-box">
                                        <b-button
                                            class="tmp-btn-blue"
                                            type="submit">
                                            Connect
                                        </b-button>
                                    </div>
                                </b-form>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/logo-trezorwallet.png"
                                    alt="logo-trezorwallet.png"
                                    @click="changeView" />
                                <span>Trezor Wallet</span>
                            </template>
                            <div class="inner-content tab-trezorwallet">
                                <p class="text-center">
                                    <strong>Select HD derivation path:</strong> m/44'/60'/0'/0
                                </p>
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        type="submit">Connect</b-button>
                                </div>
                            </div>
                        </b-tab>
                        <!-- <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/logo-privatekey.png"
                                    alt="logo-privatekey.png"
                                    @click="changeView"/>
                                <span>Privatekey</span>
                            </template>
                            <div class="inner-content tab-privatekey">
                                <b-form-group
                                    class="mb-4"
                                    label="Enter your PrivateKey"
                                    label-for="mnemonic">
                                    <b-form-input
                                        v-model="mnemonic"
                                        type="text"
                                        autocomplete="off"
                                        placeholder="PrivateKey ..."/>
                                </b-form-group>
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        type="submit">Unlock</b-button>
                                </div>
                            </div>
                        </b-tab>
                        <b-tab>
                            <template slot="title">
                                <b-img
                                    src="/app/assets/images/logo-privatekey.png"
                                    alt="logo-privatekey.png"
                                    @click="changeView"/>
                                <span>Mnemonic</span>
                            </template>
                            <div class="inner-content tab-mnemonic">
                                <b-form-group
                                    class="mb-4"
                                    label="Enter your Mnemonic"
                                    label-for="mnemonic">
                                    <b-form-input
                                        v-model="mnemonic"
                                        type="text"
                                        autocomplete="off"
                                        placeholder="Mnemonic ..."/>
                                </b-form-group>
                                <b-form-group
                                    class="mb-4"
                                    label="Select HD derivation path(MNEMONIC)"
                                    label-for="hdPath">
                                    <b-form-input
                                        v-model="hdPath"
                                        type="text"
                                        placeholder="m/44’/889’/0’/0"/>
                                    <b-form-text>
                                        To unlock the wallet,
                                        try paths <span
                                            class="hd-path"
                                            @click="changePath(`m/44'/60'/0'`)">m/44'/60'/0'</span> or
                                        <span
                                            class="hd-path"
                                            @click="changePath(`m/44'/60'/0'/0`)">m/44'/60'/0'/0</span>
                                        for Etherium path or
                                        <span
                                            class="hd-path"
                                            @click="changePath(`m/44'/889'/0'/0`)">m/44'/889'/0'/0</span>
                                        for Viction path.
                                    </b-form-text>
                                </b-form-group>
                                <div class="btn-box">
                                    <b-button
                                        class="tmp-btn-blue"
                                        type="submit">Unlock</b-button>
                                </div>
                            </div>
                        </b-tab> -->
                    </b-tabs>
                </b-form>
            </div>
        </div>
        <b-modal
            id="hdwalletModal"
            ref="hdwalletModal"
            title="Please select the address you would like to interact with"
            centered
            scrollable
            size="md"
            hide-header
            hide-footer>
            <div class="tomo-modal-default text-left">
                <h3 class="tmp-title-medium">Wallet Address</h3>
                <div class="tmp-table-two colum-2">
                    <table style="display: block">
                        <tr
                            v-for="(hdwallet, index) in hdWallets"
                            :key="index">
                            <td>
                                <b-form-radio
                                    :value="index"
                                    name="hdWallet">
                                    <span :title="hdwallet.address">
                                        {{ hdwallet.address }}
                                    </span>
                                </b-form-radio>
                            </td>
                            <td><b>{{ hdwallet.balance }}</b> {{ getCurrencySymbol() }}</td>
                        </tr>
                    </table>
                </div>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-blue"
                        @click="setHdPath">Unlock
                    </b-button>
                </div>
            </div>
        </b-modal>
        <div :class="(loading ? 'tomo-loading' : '')" />
    </div>
</template>

<script>
import Web3 from 'web3'
import { validationMixin } from 'vuelidate'
import { required, minLength } from 'vuelidate/lib/validators'
import { HDWalletProvider } from '../../helpers.js'
import PrivateKeyProvider from 'truffle-privatekey-provider'
import store from 'store'
import walletAdapter from '../walletAdapter'
const defaultWalletNumber = 10
export default {
    name: 'App',
    components: {},
    mixins: [validationMixin],
    data () {
        return {
            isReady: !!this.web3,
            mnemonic: '',
            privateKey: '',
            hdPath: "m/44'/889'/0'/0", // HD DerivationPath of hardware wallet
            hdWallets: {}, // list of addresses in hardware wallet
            config: {},
            provider: '',
            address: '',
            withdraws: [],
            wh: [],
            aw: false,
            balance: 0,
            chainConfig: {},
            networks: {
                rpc: process.env.RPC_ENDPOINT,
                tomowallet: process.env.RPC_ENDPOINT
            },
            loading: false,
            qrCode: 'text',
            id: '',
            interval: '',
            qrCodeApp: '',
            gasPrice: null,
            selected: '',
            tabIndex: 0
        }
    },
    validations: {
        networks: {
            // custom: {
            //     required,
            //     localhostUrl
            // }
        },
        mnemonic: {
            required
        },
        hdPath: {
            required,
            minLength: minLength(12)
        }
    },
    computed: {
        mobileCheck: () => {
            const isAndroid = navigator.userAgent.match(/Android/i)
            const isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i)
            return (isAndroid || isIOS)
        }
    },
    watch: {},
    updated () { },
    beforeDestroy () { },
    created: async function () {
        const self = this
        self.hdWallets = self.hdWallets || {}
        self.config = store.get('configIssuer') || await self.appConfig()
        self.chainConfig = self.config.blockchain || {}
        self.networks.rpc = self.chainConfig.rpc
    },
    mounted () { },
    methods: {
        async login () {
            const self = this
            try {
                self.loading = true
                let wjs = false
                let walletProvider
                let offset
                switch (self.provider) {
                case walletAdapter.WALLET_TYPE.COIN98:
                    wjs = walletAdapter.loadCoin98Provider()
                    break
                case walletAdapter.WALLET_TYPE.VICTION:
                    wjs = walletAdapter.loadVictionProvider()
                    break
                case walletAdapter.WALLET_TYPE.RAMPER:
                    wjs = walletAdapter.loadRamperProvider()
                    break
                case walletAdapter.WALLET_TYPE.METAMASK:
                    wjs = walletAdapter.loadMetamaskProvider()
                    break
                case walletAdapter.WALLET_TYPE.LEDGER:
                    // Object - HttpProvider
                    wjs = new Web3(new Web3.providers.HttpProvider(self.networks.rpc))
                    // Object - IpcProvider: The IPC provider is used node.js dapps when running a local node
                    // import net from 'net'
                    // wjs = new Web3(new Web3.providers.IpcProvider('~/.ethereum/geth.ipc', net))

                    // Object - WebsocketProvider: The Websocket provider is the standard for usage in legacy browsers.
                    // wjs = await ws.connect(self.networks.wss)
                    // wjs = new Web3(new Web3.providers.WebsocketProvider(self.chainConfig.ws))
                    // web3 version 0.2 haven't supported WebsocketProvider yet. (for web@1.0 only)
                    offset = document.querySelector('input[name="hdWallet"]:checked').value.toString()
                    store.set('hdDerivationPath', self.hdPath + '/' + offset)
                    break
                case walletAdapter.WALLET_TYPE.TREZOR:
                    wjs = new Web3(new Web3.providers.HttpProvider(self.networks.rpc))
                    offset = document.querySelector('input[name="hdWallet"]:checked').value.toString()
                    store.set('hdDerivationPath', self.hdPath + '/' + offset)
                    store.set('offset', offset)
                    break
                case 'custom':
                    self.mnemonic = self.mnemonic.trim()
                    walletProvider = (self.mnemonic.indexOf(' ') >= 0)
                        ? new HDWalletProvider(
                            self.mnemonic,
                            self.networks.rpc, 0, 1, self.hdPath)
                        : new PrivateKeyProvider(self.mnemonic, self.networks.rpc)
                    wjs = new Web3(walletProvider)
                    break
                default:
                    break
                }
                self.setupProvider(self.provider, wjs)
                try {
                    self.address = await self.getAccount()
                } catch (er) {
                    self.$toasted.show(er.message, { type: 'error' })
                    self.loading = false
                    return
                }

                if (self.address) {
                    self.$store.state.address = self.address.toLowerCase()
                    if (self.provider !== walletAdapter.WALLET_TYPE.TREZOR &&
                        self.provider !== walletAdapter.WALLET_TYPE.LEDGER) {
                        store.set('address', self.address.toLowerCase())
                        store.set('network', self.provider)
                    }
                    self.$bus.$emit('logged', 'user logged')
                    if (store.get('redirectTo')) {
                        const redirectTo = store.get('redirectTo')
                        store.remove('redirectTo')
                        self.$router.push({
                            path: '/' + redirectTo
                        })
                    } else {
                        self.$router.push({
                            path: '/'
                        })
                    }
                } else {
                    self.$toasted.show(
                        'Couldn\'t get any accounts! Make sure ' +
                        'your Ethereum client is configured correctly.', {
                            type: 'error'
                        })
                }
                self.loading = false
            } catch (error) {
                self.loading = false
                console.trace(error)
                self.$toasted.show(
                    error, { type: 'error' }
                )
            }
        },
        validate: function () {
            this.$v.$touch()
            switch (this.wprovider) {
            case 0:
                this.provider = walletAdapter.WALLET_TYPE.COIN98
                this.login()
                break
            case 1:
                this.provider = walletAdapter.WALLET_TYPE.VICTION
                this.login()
                break
            case 2:
                this.provider = walletAdapter.WALLET_TYPE.RAMPER
                this.login()
                break
            case 3:
                this.provider = walletAdapter.WALLET_TYPE.METAMASK
                this.login()
                break
            case 4:
                if (!this.$v.hdPath.$invalid) {
                    this.provider = walletAdapter.WALLET_TYPE.LEDGER
                    this.selectHdPath()
                }
                break
            case 5:
                this.hdPath = "m/44'/60'/0'/0"
                this.provider = walletAdapter.WALLET_TYPE.TREZOR
                this.selectHdPath()
                break
            }
        },
        getValidationClass: function (fieldName) {
            let field = this.$v[fieldName]
            if (typeof this.$v.networks[fieldName] !== 'undefined') {
                field = this.$v.networks[fieldName]
            }
            if (field) {
                return {
                    'is-invalid': field.$error
                }
            }
        },
        selectHdPath: async function (offset = 0, limit = defaultWalletNumber) {
            let self = this
            let wallets
            try {
                self.loading = true
                const tabIndex = self.tabIndex
                store.set('hdDerivationPath', self.hdPath)
                if (tabIndex === 5 || this.provider === walletAdapter.WALLET_TYPE.TREZOR) {
                    await self.unlockTrezor()
                    wallets = await self.loadTrezorWallets(offset, limit)
                } else {
                    await self.unlockLedger()
                    wallets = await self.loadMultipleLedgerWallets(offset, limit)
                }
                if (Object.keys(wallets).length > 0) {
                    Object.assign(self.hdWallets, self.hdWallets, wallets)
                    // document.getElementById('hdwalletModal').style.display = 'block'
                    this.$refs.hdwalletModal.show()
                    self.loading = false
                }
            } catch (error) {
                console.log(error.message)
                self.loading = false
                self.$toasted.show(error.message || error, {
                    type: 'error'
                })
            }
        },
        closeModal () {
            document.getElementById('hdwalletModal').style.display = 'none'
        },
        async setHdPath () {
            this.$refs.hdwalletModal.hide()
            await this.login()
        },
        async moreHdAddresses () {
            document.getElementById('moreHdAddresses').style.cursor = 'wait'
            document.body.style.cursor = 'wait'
            await this.selectHdPath(Object.keys(this.hdWallets).length, this.defaultWalletNumber)
            document.getElementById('moreHdAddresses').style.cursor = 'pointer'
            document.body.style.cursor = 'default'
        },
        async onChangeSelect (event) {
            switch (event) {
            // case 'tomowallet':
            //     await this.loginByQRCode()
            //     this.interval = setInterval(async () => {
            //         await this.getLoginResult()
            //     }, 3000)
            //     break
            case walletAdapter.WALLET_TYPE.TREZOR:
                this.hdPath = "m/44'/60'/0'/0"
                break
            case walletAdapter.WALLET_TYPE.LEDGER:
                this.hdPath = "m/44'/889'/0'/0"
                break
            default:
                // if (this.interval) {
                //     clearInterval(this.interval)
                // }
                break
            }
        },
        changeView () {
            if (this.mobileCheck) {
                window.scrollTo(0, 160)
            }
        },
        changePath (path) {
            this.hdPath = path
        }
        // loginWallet () {
        //     if (this.mobileCheck) {
        //         window.open('tomochain://dapp?url=https://issuer.testnet.tomochain.com')
        //     } else {
        //         if (confirm('Download TomoWallet to open in app')) {
        //             window.open('https://play.google.com/store/apps/details?id=com.tomochain.wallet&hl=en')
        //         }
        //     }
        // }
    }
}
</script>
