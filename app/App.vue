<template>
    <div id="app">
        <div class="page-layout">
            <b-navbar
                v-if="display"
                toggleable="lg"
                type="light"
                class="tomo-header"
            >
                <section class="container container-tomochain">
                    <b-navbar-brand to="/">
                        <b-img
                            src="../app/assets/images/logo-tomoissuer.svg"
                            alt="logo vicissuer"/>
                    </b-navbar-brand>
                    <!-- button menu SP -->
                    <b-navbar-toggle
                        v-if="isTomonet"
                        target="nav-collapse"
                        class="btn-menu-sp"/>
                    <!-- /button menu SP -->
                    <b-collapse
                        id="nav-collapse"
                        is-nav>
                        <b-navbar-nav class="ml-auto navbar-buttons">
                            <!-- <b-nav-item
                                v-if="isTomonet"
                                class="tmp-btn-blue"
                                @click="openModal">
                                <div
                                    class="text-center issue-text">Issue new tokens</div>
                            </b-nav-item> -->

                            <b-nav-item-dropdown
                                v-if="isTomonet"
                                class="tmp-btn-transparent tomo-wallet"
                                offset="25"
                                right>
                                <template
                                    slot="button-content"
                                    class="tmp-btn-transparent">
                                    <i class="tm-icon-wallet"/>
                                    {{ truncate(account, 16) }}
                                </template>
                                <b-dropdown-text
                                    class="flex_box">
                                    <span>Balance:</span>
                                    <strong>{{ balance }} VIC</strong>
                                </b-dropdown-text>
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    to="/createToken">
                                    Issue New Token
                                    <i class="ml-1 tm-add-outline float-right" />
                                </b-dropdown-item>
                                <!-- <b-dropdown-item
                                    to="/createBridgeToken">
                                    Issue Wrapped ERC-20 Token
                                    <i class="ml-1 tm-add-outline float-right"/>
                                </b-dropdown-item> -->
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    to="/donateTxFee">
                                    Donate transaction fee
                                </b-dropdown-item>
                                <!-- <b-dropdown-item
                                    href="/help"
                                    target="_blank">
                                    Help
                                </b-dropdown-item> -->
                                <b-dropdown-item
                                    v-if="!mobileCheck"
                                    class="sign_out"
                                    href="/"
                                    @click="signOut">
                                    Sign out
                                </b-dropdown-item>
                            </b-nav-item-dropdown>
                        </b-navbar-nav>
                    </b-collapse>
                </section>
            </b-navbar>
            <div
                :class="`${display === true ? 'common-main-content' : 'welcom-tomoissuer'}`">
                <router-view/>
            </div>
            <footer
                class="tomo-footer footer">
                <div class="container container-tomochain">
                    <div class="row">
                        <div class="col-md-7 col-lg-8">
                            <div class="tomo-copyright">
                                VICIssuer &copy; {{ (new Date()).getFullYear() }} -
                                <a
                                    :href="`https://github.com/buildOnViction/tomoissuer/releases/tag/v${version}`"
                                    target="_blank"
                                    class="version-tag">
                                    v{{ version }}</a>
                            </div>
                            <div class="tomo-meta-links">
                                <ul>
                                    <li>
                                        <a
                                            :href="needHelpLink"
                                            target="_blank">Need help?</a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://docs.viction.xyz/legal/privacy"
                                            target="_blank">Privacy Policy</a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://docs.viction.xyz/legal/terms-of-use"
                                            target="_blank">Terms of Use</a>
                                    </li>
                                    <li>
                                        <a
                                            href="/api-docs"
                                            target="_blank">API Documentation</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-md-5 col-lg-4">
                            <div class="tomo-social">
                                <ul>
                                    <!-- <li><a
                                        href="https://www.facebook.com/tomochainofficial"
                                        target="_blank"><i class="tm-icon-facebook"/></a></li> -->
                                    <li><a
                                        href="https://viction.link/twitter"
                                        target="_blank"><i class="tm-icon-twiter"/></a></li>
                                    <li><a
                                        href="https://viction.link/telegram"
                                        target="_blank"><i class="tm-icon-telegram"/></a></li>
                                    <li><a
                                        href="https://github.com/BuildOnViction"
                                        target="_blank"><i class="tm-icon-github"/></a></li>
                                        <!-- <li><a
                                        href="https://www.linkedin.com/company/tomochain"
                                        target="_blank"><i class="tm-icon-linkedin"/></a></li> -->
                                        <!-- <li><a
                                        href="https://www.reddit.com/r/Tomochain/"
                                        target="_blank"><i class="tm-icon-reddit"/></a></li> -->
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<script>
import store from 'store'
import BigNumber from 'bignumber.js'
import pkg from '../package.json'

export default {
    name: 'App',
    components: {
    },
    data () {
        return {
            isReady: !!this.web3,
            isTomonet: false,
            account: '',
            version: pkg.version,
            balance: '',
            display: false,
            needHelpLink: 'https://docs.viction.xyz/faq/products/vicissuer'
        }
    },
    computed: {
        mobileCheck: () => {
            if (window.web3 && window.web3.currentProvider &&
                window.web3.currentProvider.isTomoWallet) {
                return true
            } else return false
        }
    },
    async updated () {
        await this.checkNetworkAndLogin()
    },
    destroyed () { },
    created: async function () {
        try {
            const self = this
            if (!self.isReady && self.NetworkProvider === 'metamask') {
                throw Error('Web3 is not properly detected. Have you installed MetaMask extension?')
            }
            self.$bus.$on('logged', async () => {
                await self.checkNetworkAndLogin()
            })
        } catch (error) {
            console.log(error)
        }
    },
    methods: {
        async checkNetworkAndLogin () {
            let self = this
            setTimeout(async () => {
                try {
                    self.account = store.get('address') ||
                        self.$store.state.address || await self.getAccount()
                    // if (store.get('address')) {
                    //     self.account = .toLowerCase()
                    // } else {
                    //     self.account = this.$store.state.walletLoggedIn
                    //         ? this.$store.state.walletLoggedIn : await self.getAccount()
                    // }
                    if (self.account) {
                        self.isTomonet = true
                    }

                    if (self.isTomonet) {
                        self.display = true
                        if (self.web3) {
                            self.web3.eth.getBalance(self.account).then(result => {
                                let balance = new BigNumber(result)
                                self.balance = balance.div(10 ** 18).toNumber().toFixed(4)
                            }).catch(error => {
                                console.log(error)
                            })
                        }
                    } else if (self.$route.path === '/login') {
                        self.display = true
                    } else {
                        self.display = false
                    }
                } catch (error) {
                    console.log(error)
                    self.$toasted.show(error, { type: 'error' })
                }
            }, 0)
        },
        signOut () {
            store.clearAll()
            this.$store.state.address = null
            this.$store.state.token = null

            this.$router.go({
                path: '/'
            })
        }
    }
}
</script>
