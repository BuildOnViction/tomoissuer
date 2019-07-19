<template>
    <list-token
        v-if="account"/>
    <welcome v-else/>
</template>

<script>
import store from 'store'
import Web3 from 'web3'
import Welcome from './Welcome.vue'
import ListToken from './accounts/ListToken.vue'

export default {
    name: 'App',
    components: {
        Welcome,
        ListToken
    },
    mixins: [],
    data () {
        return {
            account: ''
        }
    },
    validations: {},
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        if (window.web3 && window.web3.currentProvider &&
            window.web3.currentProvider.isTomoWallet) {
            const wjs = new Web3(window.web3.currentProvider)
            this.setupProvider('tomowallet', wjs)
            this.account = await this.getAccount()
            if (this.account) {
                store.set('address', this.account.toLowerCase())
                this.$bus.$emit('logged', 'user logged')
                store.set('network', 'tomowallet')
            }
        } else {
            this.account = store.get('address') ||
                this.$store.state.address || await this.getAccount()
        }
    },
    mounted () {},
    methods: {}
}
</script>
