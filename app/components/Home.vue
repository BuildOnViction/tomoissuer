<template>
    <list-token
        v-if="account"/>
    <welcome v-else/>
</template>

<script>
import store from 'store'
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
        this.account = store.get('address') || await this.getAccount()
    },
    mounted () {},
    methods: {}
}
</script>
