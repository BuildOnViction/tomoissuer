<template>
    <div
        v-if="account"
        style="text-align: center; padding-top: 10em">
        Welcome {{ account }}
    </div>
</template>

<script>
import store from 'store'

export default {
    name: 'App',
    components: {},
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
        this.account = store.get('address')
    },
    mounted () {},
    methods: {}
}
</script>
