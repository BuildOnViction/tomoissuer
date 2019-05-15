<template>
    <div id="app">
        <div class="page-layout">
            <b-navbar
                toggleable="lg"
                type="dark"
                variant="info">
                <div class="container">
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
                            <b-dropdown
                                v-if="isTomonet"
                                class="dd-setting ml-1"
                                right
                                offset="25"
                                no-caret
                                variant="primary">
                                <template
                                    slot="button-content">
                                    <i class="tm-cog icon-2x"/>
                                </template>
                                <b-dropdown-item
                                    :to="`/voter/${account}`"
                                    class="dd-address">
                                    {{ truncate(account, 20) }}
                                </b-dropdown-item>
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    target="_bank"
                                    href="https://bit.ly/2B6p29o">Help</b-dropdown-item>
                                <b-dropdown-item to="/setting">Settings/Withdraws</b-dropdown-item>
                                <b-dropdown-divider />
                                <b-dropdown-item
                                    href="/"
                                    @click="signOut">Sign out</b-dropdown-item>
                            </b-dropdown>
                        </b-navbar-nav>
                    </b-collapse>
                </div>
            </b-navbar>
            <div class="main-content">
                <router-view/>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    components: { },
    data () {
        return { }
    },
    async updated () { },
    destroyed () { },
    created: async function () { },
    methods: { }
}
</script>
