<template>
    <div id="app">
        <div class="page-layout">
            <b-navbar
                toggleable="lg"
                type="dark"
                variant="info">
                <section class="container container--wide">
                    <b-navbar-brand to="/">
                        Logo here
                    </b-navbar-brand>
                    <b-navbar-toggle
                        target="nav-collapse"
                        class="btn-menu-sp"/>
                    <b-collapse
                        id="nav-collapse"
                        is-nav>
                        <!-- Right aligned nav items -->
                        <b-navbar-nav class="ml-auto ">
                            TOMOISSUER
                        </b-navbar-nav>
                        <b-navbar-nav class="ml-auto navbar-buttons">
                            <b-button
                                v-if="!isTomonet"
                                id="btn-become-candidate"
                                to="/login"
                                variant="primary">Login</b-button>
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
