<template>
    <div id="app">
        <div class="page-layout">
            <b-navbar
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
                                to="/create">
                                <i class="tomoissuer-icon-plus"/>
                                Issue new token
                            </b-nav-item>
                            <b-nav-item-dropdown
                                v-if="isTomonet"
                                class="tmp-btn-transparent"
                                offset="25"
                                right>
                                <template
                                    slot="button-content"
                                    class="tmp-btn-transparent">
                                    <i class="tomoissuer-icon-wallet"/>
                                    My Wallet
                                </template>
                                <b-dropdown-item
                                    :to="'/address/' + account">
                                    {{ truncate(account, 20) }}
                                </b-dropdown-item>
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    href="/"
                                    @click="signOut">Sign out</b-dropdown-item>
                            </b-nav-item-dropdown>
                        </b-navbar-nav>
                    </b-collapse>
                </section>
            </b-navbar>
            <div
                :class="`${isTomonet === true ? 'common-main-content' : 'welcom-tomoissuer'}`">
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
                                    class="version-tag">
                                    v{{ version }}</a>
                            </div>
                            <div class="tomo-meta-links">
                                <ul>
                                    <li><a href="#">Need help?</a></li>
                                    <li><a href="#">Privacy Policy</a></li>
                                    <li><a href="#">Terms of Service</a></li>
                                    <li><a href="#">API Documentation</a></li>
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
                                    <li><a href="#"><i class="tomoissuer-icon-telegram"/></a></li>
                                    <li><a
                                        href="https://github.com/tomochain/"
                                        target="_blank"><i class="tomoissuer-icon-github"/></a></li>
                                    <li><a href="#"><i class="tomoissuer-icon-linkedin"/></a></li>
                                    <li><a href="#"><i class="tomoissuer-icon-reddit"/></a></li>
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
import pkg from '../package.json'

export default {
    name: 'App',
    components: { },
    data () {
        return {
            isReady: !!this.web3,
            isTomonet: false,
            account: '',
            version: pkg.version
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
                    if (store.get('address')) {
                        self.account = store.get('address').toLowerCase()
                    } else {
                        self.account = this.$store.state.walletLoggedIn
                            ? this.$store.state.walletLoggedIn : await self.getAccount()
                    }
                    if (self.account) {
                        self.isTomonet = true
                    }
                } catch (error) {
                    console.log(error)
                    self.$toasted.show(error, { type: 'error' })
                }
            }, 0)
        },
        signOut () {
            store.clearAll()
            this.$store.state.walletLoggedIn = null

            this.$router.go({
                path: '/'
            })
        }
    }
}
</script>
