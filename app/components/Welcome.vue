<template>
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
        <div class="inner">
            <h2 class="tmp-title-big">TomoIssuer</h2>
            <p>Issue your own token with fee paid by itself in minutes</p>
            <div class="btn-box">
                <b-link
                    class="tmp-btn-blue"
                    to="/create">
                    Issue new token
                </b-link>
                <b-link
                    class="tmp-btn-boder-blue"
                    to="/login">
                    Donate Txn fee
                </b-link>
            </div>
            <div class="link-login">
                <span>Already have your token?</span>
                <b-link
                    to="/login">
                    Log in
                </b-link>
            </div>
        </div>
    </div>
</template>

<script>
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
    methods: {}
}
</script>
