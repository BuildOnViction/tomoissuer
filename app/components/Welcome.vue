<template>
    <div class="page-welcome">
        <div class="container">
            <div class="animation_bg">
                <span id="blue-circle-container"/>
                <span id="green-rectangle"/>
                <span id="grey-oval"/>
                <span id="grey-rounded-rectangle"/>
                <span id="red-triangle"/>
                <span id="yellow-dots"/>
                <span id="yellow-semicircle"/>
            </div>
            <div class="step-login">
                <b-img
                    src="../app/assets/images/logo-tomoissuer.svg"
                    alt="logo tomoissuer"
                    class="mb-5 tomo-logo"/>
                <h2 class="tmp-title-big">Issue Your Own Token in Minutes!</h2>
                <p class="custom-welcome-title">
                    Create TRC21 tokens and let token holders pay transaction fees in the token itself
                </p>
                <div class="btn-box">
                    <b-dropdown
                        class="dropdown-class"
                        variant="secondary"
                        text="Issue a New Token">
                        <b-dropdown-item
                            @click="redirectTo('createBridgeToken')">
                            Issue a wrapped ERC-20  token
                        </b-dropdown-item>
                        <b-dropdown-divider />
                        <b-dropdown-item
                            @click="redirectTo('createToken')">
                            Issue a new TRC-21 token
                        </b-dropdown-item>
                    </b-dropdown>
                    <b-button
                        class="tmp-btn-boder-blue"
                        @click="redirectTo('donateTxFee')">
                        Donate TRC-21 fee
                    </b-button>
                </div>
                <div
                    class="link-login">
                    <span>Already have your token?</span>
                    <b-link
                        to="/login">
                        Log in
                    </b-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import store from 'store'

export default {
    name: 'App',
    components: {
    },
    mixins: [],
    data () {
        return {}
    },
    validations: {},
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {},
    mounted () {},
    methods: {
        redirectTo (page) {
            store.set('redirectTo', page)
            this.$router.push({
                path: '/login'
            })
        }
    }
}
</script>
