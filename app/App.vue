<template>
    <div id="app">
        <div class="page-layout">
            <b-navbar
                v-if="display"
                toggleable="lg"
                type="light"
                class="tomo-header"
                variant="white">
                <section class="container container-tomochain">
                    <b-navbar-brand to="/">
                        <b-img
                            src="../app/assets/images/logo-tomoissuer.svg"
                            alt="logo tomoissuer"/>
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
                            <b-nav-item
                                v-if="isTomonet"
                                class="tmp-btn-blue"
                                to="/createToken">
                                <i
                                    class="tomoissuer-icon-plus text-center"/>
                                <div
                                    class="text-center issue-text"
                                    style="margin-right:11px">Issue new token</div>
                            </b-nav-item>
                            <b-nav-item-dropdown
                                v-if="isTomonet"
                                class="tmp-btn-transparent tomo-wallet"
                                offset="25"
                                right>
                                <template
                                    slot="button-content"
                                    class="tmp-btn-transparent">
                                    <i class="tomoissuer-icon-wallet"/>
                                    {{ truncate(account, 16) }}
                                </template>
                                <b-dropdown-text
                                    class="flex_box">
                                    <span>Balance:</span>
                                    <strong>{{ balance }} TOMO</strong>
                                </b-dropdown-text>
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    to="/donateTxFee">
                                    Donate TRC-21 fee
                                </b-dropdown-item>
                                <b-dropdown-item
                                    href="/help"
                                    target="_blank">
                                    Help
                                </b-dropdown-item>
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
                                TomoIssuer &copy; {{ (new Date()).getFullYear() }} -
                                <a
                                    :href="`https://github.com/tomochain/tomoissuer/releases/tag/v${version}`"
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
                                            href="https://docs.tomochain.com/legal/privacy"
                                            target="_blank">Privacy Policy</a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://docs.tomochain.com/legal/terms-of-use"
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
                                    <li><a
                                        href="https://www.facebook.com/tomochainofficial"
                                        target="_blank"><i class="tomoissuer-icon-facebook"/></a></li>
                                    <li><a
                                        href="https://twitter.com/TomoChainANN"
                                        target="_blank"><i class="tomoissuer-icon-twiter"/></a></li>
                                    <li><a
                                        href="https://t.me/tomochain"
                                        target="_blank"><i class="tomoissuer-icon-telegram"/></a></li>
                                    <li><a
                                        href="https://github.com/tomochain/"
                                        target="_blank"><i class="tomoissuer-icon-github"/></a></li>
                                    <li><a
                                        href="https://www.linkedin.com/company/tomochain"
                                        target="_blank"><i class="tomoissuer-icon-linkedin"/></a></li>
                                    <li><a
                                        href="https://www.reddit.com/r/Tomochain/"
                                        target="_blank"><i class="tomoissuer-icon-reddit"/></a></li>
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
            needHelpLink: 'https://docs.tomochain.com/faq/products/tomochain-applications/tomoissuer'
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
