<template>
    <div id="app">
        <div class="page-layout">
            <b-navbar
                toggleable="lg"
                type="light"
                class="tomo-header"
                variant="white">
                <section class="container container--wide">
                    <b-navbar-brand to="/">
                        <b-img
                            src="../app/assets/images/logo-tomoissuer.svg"
                            alt="logo tomoissuer"/>
                    </b-navbar-brand>
                    <b-navbar-toggle
                        target="nav-collapse"
                        class="btn-menu-sp"/>
                    <b-collapse
                        id="nav-collapse"
                        is-nav>
                        <b-navbar-nav class="ml-auto navbar-buttons">
                            <b-button
                                id="btn-issuer-new-token"
                                to="/"
                                variant="primary">
                                <i class="tomoissuer-icon-plus"/>
                                Issue new token
                            </b-button>
                            <b-nav-item-dropdown
                                right>
                                <template
                                    slot="button-content">
                                    <i class="tomoissuer-icon-wallet"/>
                                    My Wallet
                                </template>
                                <b-dropdown-item to="/">EN</b-dropdown-item>
                                <b-dropdown-item to="/">ES</b-dropdown-item>
                                <b-dropdown-item to="/">RU</b-dropdown-item>
                                <b-dropdown-item to="/">FA</b-dropdown-item>
                            </b-nav-item-dropdown>
                            <!-- <b-button
                                v-if="!isTomonet"
                                id="btn-become-candidate"
                                to="/login"
                                variant="primary">Login</b-button> -->
                            <b-button
                                v-if="isTomonet"
                                id="btn-become-candidate"
                                to="/create"
                                variant="primary">Create Token</b-button>
                            <b-dropdown
                                v-if="isTomonet"
                                class="dd-setting ml-1"
                                right
                                offset="25"
                                no-caret
                                variant="primary">
                                <template
                                    slot="button-content">
                                    <!-- <i class="tm-cog icon-2x"/> -->
                                    Profile
                                </template>
                                <b-dropdown-item
                                    :to="'/address/' + account">
                                    {{ truncate(account, 20) }}
                                </b-dropdown-item>
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    href="/"
                                    @click="signOut">Sign out</b-dropdown-item>
                            </b-dropdown>
                        </b-navbar-nav>
                    </b-collapse>
                </section>
            </b-navbar>
            <div class="main-content">
                <router-view/>
            </div>
            <footer
                class="tomo-footer footer">
                <div class="container container--wide">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="tomo-footer__copyright">
                                TomoIssuer &copy; {{ (new Date()).getFullYear() }} -
                                <a
                                    :href="`https://github.com/tomochain/tomoissuer/releases/tag/v${version}`"
                                    class="version-tag">
                                    v{{ version }}</a>
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
