<template>
    <div class="container">
        <div class="d-none">
            <b-row v-if="loading">loading...</b-row>
            <b-row
                align-v="center"
                align-h="center"
                class="m-0">
                <b-card
                    v-if="!address"
                    :class="'col-12 col-md-8 col-lg-7 p-0'
                    + (loading ? ' tomo-loading' : '')">
                    <h4 class="color-white tomo-card__title tomo-card__title--big">Login</h4>
                    <b-form
                        class="tomo-form tomo-form--setting"
                        novalidate
                        @submit.prevent="validate()">
                        <b-form-group
                            class="mb-4"
                            label="Network Provider"
                            label-for="provider">
                            <b-input-group>
                                <b-form-select
                                    id="provider"
                                    v-model="provider"
                                    class="form-control"
                                    @change="onChangeSelect">
                                    <option
                                        value="custom">PrivateKey/MNEMONIC</option>
                                    <option
                                        value="ledger">Ledger Wallet</option>
                                    <option
                                        value="trezor">Trezor Wallet</option>
                                    <option
                                        v-if="!isElectron"
                                        value="metamask">Metamask/TrustWallet/MidasWallet</option>
                                </b-form-select>
                            </b-input-group>
                            <small
                                v-if="provider !== 'metamask'"
                                class="form-text text-muted">Using node at {{ chainConfig.rpc }}.</small>
                        </b-form-group>
                        <b-form-group
                            v-if="provider === 'custom'"
                            class="mb-4"
                            label="Privatekey/MNEMONIC"
                            label-for="mnemonic">
                            <b-form-input
                                :class="getValidationClass('mnemonic')"
                                v-model="mnemonic"
                                autocomplete="off"
                                type="text" />
                            <span
                                v-if="$v.mnemonic.$dirty && !$v.mnemonic.required"
                                class="text-danger">Required field</span>
                        </b-form-group>

                        <b-form-group
                            v-if="provider === 'custom'"
                            class="mb-4"
                            label="Select HD derivation path(MNEMONIC)"
                            label-for="hdPath">
                            <b-form-input
                                :class="getValidationClass('hdPath')"
                                :value="hdPath"
                                v-model="hdPath"
                                type="text" />
                            <span
                                v-if="$v.hdPath.$dirty && !$v.hdPath.required"
                                class="text-danger">Required field</span>
                            <small
                                class="form-text text-muted">To unlock the wallet, try paths
                                <code>m/44'/60'/0'/0</code>
                                or <code>m/44'/60'/0'</code>
                                or try path <code>m/44'/889'/0'/0</code></small>
                        </b-form-group>

                        <b-form-group
                            v-if="provider === 'tomowallet'"
                            class="mb-4"
                            style="text-align: center">
                            <vue-qrcode
                                :options="{size: 250 }"
                                :value="qrCode"
                                class="img-fluid text-center text-lg-right"/>
                            <div
                                v-if="mobileCheck">
                                <b-button
                                    :href="qrCodeApp"
                                    variant="primary">
                                    Open in App
                                </b-button>
                            </div>
                            <div>
                                <b>In case you do not have TomoWallet, download here</b>
                            </div>
                            <div
                                style="margin-top: 5px">
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://goo.gl/MvE1GV"
                                    class="social-links__link">
                                    <img src="/app/assets/img/appstore.png" >
                                </a>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://goo.gl/4tFQzY"
                                    class="social-links__link">
                                    <img src="/app/assets/img/googleplay.png" >
                                </a>
                            </div>
                        </b-form-group>
                        <b-form-group
                            v-if="provider === 'ledger'"
                            class="mb-4"
                            label="Select HD derivation path"
                            label-for="hdPath">
                            <b-form-input
                                :class="getValidationClass('hdPath')"
                                :value="hdPath"
                                v-model="hdPath"
                                type="text" />
                            <span
                                v-if="$v.hdPath.$dirty && !$v.hdPath.required"
                                class="text-danger">Required field</span>
                            <small
                                class="form-text text-muted">To unlock the wallet, try paths
                                <code>m/44'/60'/0'</code>
                                or <code>m/44'/60'/0'/0</code>
                                with Ethereum App,<br>
                                or try path <code>m/44'/889'/0'/0</code>
                                with TomoChain App (on Ledger).</small>
                        </b-form-group>

                        <b-form-group
                            v-if="provider === 'trezor'"
                            class="mb-4"
                            label-for="hdPath">
                            <span>HD derivation path: </span>
                            <label class="ml-1"><b>m/44'/60'/0'/0</b></label>
                            <!-- <b-form-input
                                :class="getValidationClass('hdPath')"
                                :value="hdPath"
                                v-model="hdPath"
                                readonly
                                type="text" /> -->
                            <!-- <span
                                v-if="$v.hdPath.$dirty && !$v.hdPath.required"
                                class="text-danger">Required field</span> -->
                        </b-form-group>

                        <div
                            v-if="!isReady && provider === 'metamask'">
                            <p>Please install &amp; login
                                <a
                                    href="https://metamask.io/"
                                    target="_blank">Metamask Extension</a>
                                then connect it to Tomochain Mainnet or Testnet.</p>
                        </div>
                        <div class="buttons text-right">
                            <b-button
                                v-if="provider !== 'tomowallet'"
                                type="submit"
                                variant="primary">Save</b-button>
                        </div>
                    </b-form>
                </b-card>
            </b-row>
            <b-modal
                ref="hdwalletModal"
                title="Please select the address you would like to interact with"
                centered
                scrollable
                size="lg"
                ok-title="Unlock wallet"
                cancel-title="Cancel"
                no-close-on-backdrop
                no-close-on-esc
                @ok="setHdPath">
                <div
                    v-for="(hdwallet, index) in hdWallets"
                    :key="index">
                    <label style="width: 100%; margin-bottom: 5px; line-height: 16px; cursor: pointer">
                        <input
                            :value="index"
                            name="hdWallet"
                            type="radio"
                            autocomplete="off"
                            style="width: 5%; float: left" >
                        <div style="width: 50%; float: left">
                            {{ truncate(hdwallet.address, 30) }}
                        </div>
                        <div style="width: 30%; margin-left: 2%; float: right">
                            {{ hdwallet.balance }} {{ getCurrencySymbol() }}
                        </div>
                    </label>
                </div>
                <div
                    id="moreHdAddresses"
                    style="margin-top: 10px; cursor: pointer"
                    @click="moreHdAddresses">
                    More Addresses
                </div>
            </b-modal>
        </div>
        <div
            v-if="!address"
            :class="'main-page-login'
            + (loading ? ' tomo-loading' : '')">
            <h2 class="tmp-title-large">Unlock your wallet</h2>
            <p>Start by choosing the wallet you would like to unlock</p>
            <p>
                Using node at
                <a
                    href="rpc.tomochain.com"
                    target="_blank"
                    rel="noopener noreferrer">
                    rpc.tomochain.com
                </a>
            </p>
            <div class="content-page">
                <b-tabs>
                    <b-tab active>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-tomowallet.png"
                                alt="logo-tomowallet.png"/>
                            <span>TomoWallet</span>
                        </template>
                        <div class="content-tab tab-tomowallet">
                            <div class="inner text-center">
                                <p>
                                    <b-img
                                        src="/app/assets/images/img-qrcode-tomowallet.png"
                                        alt="img-qrcode-tomowallet.png"/>
                                </p>
                                <p>
                                    <b>Scan QR code using TomoWallet to unlock</b><br>
                                    Haven’t installed TomoWallet yet?
                                    <b-link
                                        to="/"
                                        target="_blank">
                                        Click here
                                    </b-link>
                                </p>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-metamask.png"
                                alt="logo-metamask.png"/>
                            <span>Metamask</span>
                        </template>
                        <div class="content-tab tab-metamask">
                            <div class="btn-box">
                                <b-button
                                    class="tmp-btn-blue"
                                    to="/">
                                    Unlock your wallet
                                </b-button>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-trustwallet.png"
                                alt="logo-trustwallet.png"/>
                            <span>Trustwallet</span>
                        </template>
                        <div class="content-tab tab-trustwallet">
                            <div class="btn-box">
                                <b-button
                                    class="tmp-btn-blue"
                                    to="/">
                                    Unlock your wallet
                                </b-button>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-ledgerwallet.png"
                                alt="logo-ledgerwallet.png"/>
                            <span>Ledger Wallet</span>
                        </template>
                        <div class="content-tab tab-ledgerwallet">
                            ledgerwallet
                        </div>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-trezorwallet.png"
                                alt="logo-trezorwallet.png"/>
                            <span>Trezor Wallet</span>
                        </template>
                        <div class="content-tab tab-trezorwallet">
                            Trezor Wallet
                        </div>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-privatekey.png"
                                alt="logo-privatekey.png"/>
                            <span>Privatekey</span>
                        </template>
                        <div class="content-tab tab-privatekey">
                            Privatekey
                        </div>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <b-img
                                src="/app/assets/images/logo-mnemonic.png"
                                alt="logo-mnemonic.png"/>
                            <span>Mnemonic</span>
                        </template>
                        <div class="content-tab tab-mnemonic">
                            Mnemonic
                        </div>
                    </b-tab>
                </b-tabs>
            </div>
        </div>
    </div>
</template>

<script>
import Web3 from 'web3'
import { validationMixin } from 'vuelidate'
import { required, minLength } from 'vuelidate/lib/validators'
import { HDWalletProvider } from '../../helpers.js'
import PrivateKeyProvider from 'truffle-privatekey-provider'
import store from 'store'

const defaultWalletNumber = 10
export default {
    name: 'App',
    components: {},
    mixins: [validationMixin],
    data () {
        return {
            isReady: !!this.web3,
            mnemonic: '',
            hdPath: "m/44'/889'/0'/0", // HD DerivationPath of hardware wallet
            hdWallets: {}, // list of addresses in hardware wallet
            config: {},
            provider: 'ledger',
            address: '',
            withdraws: [],
            wh: [],
            aw: false,
            balance: 0,
            chainConfig: {},
            networks: {
                // mainnet: 'https://core.tomochain.com',
                rpc: 'https://testnet.tomochain.com',
                tomowallet: 'https://testnet.tomochain.com'
            },
            loading: false,
            qrCode: 'text',
            id: '',
            interval: '',
            qrCodeApp: '',
            gasPrice: null
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
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        const self = this
        self.hdWallets = self.hdWallets || {}
        self.config = await self.appConfig()
        self.chainConfig = self.config.blockchain || {}
        self.networks.rpc = self.chainConfig.rpc
    },
    mounted () {},
    methods: {
        async login () {
            const self = this
            try {
                let wjs = false
                let walletProvider
                let offset
                switch (self.provider) {
                case 'metamask':
                    if (window.web3) {
                        walletProvider = window.web3.currentProvider
                        wjs = new Web3(walletProvider)
                    }
                    break
                case 'ledger':
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
                case 'trezor':
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
                self.address = await self.getAccount()

                if (self.address) {
                    store.set('address', self.address.toLowerCase())
                    store.set('network', self.provider)
                    self.$bus.$emit('logged', 'user logged')
                    self.$router.push({
                        path: '/'
                    })
                } else {
                    self.$toasted.show(
                        'Couldn\'t get any accounts! Make sure ' +
                        'your Ethereum client is configured correctly.', {
                            type : 'error'
                        })
                }
            } catch (error) {
                self.$toasted.show(
                    error, { type : 'error' }
                )
            }
        },
        validate: function () {
            if (this.provider === 'metamask') {
                this.login()
            }

            this.$v.$touch()
            if (this.provider === 'custom' && !this.$v.mnemonic.$invalid) {
                this.login()
            }
            if (this.provider === 'ledger' && !this.$v.hdPath.$invalid) {
                this.selectHdPath()
            }
            if (this.provider === 'trezor' && !this.$v.hdPath.$invalid) {
                this.hdPath = "m/44'/60'/0'/0"
                this.selectHdPath()
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
                store.set('hdDerivationPath', self.hdPath)
                if (self.provider === 'trezor') {
                    await self.unlockTrezor()
                    wallets = await self.loadTrezorWallets(offset, limit)
                } else {
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
                    type : 'error'
                })
            }
        },
        closeModal () {
            document.getElementById('hdwalletModal').style.display = 'none'
        },
        async setHdPath () {
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
            case 'trezor':
                this.hdPath = "m/44'/60'/0'/0"
                break
            case 'ledger':
                this.hdPath = "m/44'/889'/0'/0"
                break
            default:
                // if (this.interval) {
                //     clearInterval(this.interval)
                // }
                break
            }
        }
    }
}
</script>
