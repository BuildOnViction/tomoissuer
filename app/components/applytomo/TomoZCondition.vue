<template>
    <div class="container container-medium">
        <div class="tomo-apply text-center">
            <h2 class="tmp-title-large">Pay fee by {{ token.name }} token</h2>
            <div class="about-tomoz">
                <h6 class="tmp-title-normal weightbold">What is TomoZ</h6>
                <p>
                    TomoChain is an innovative solution to scalability problem with
                    the Ethereum blockchain, and other blockchain platforms.
                    TomoChain features a 150-Masternodes architecture with
                    Proof of Stake Voting (POSV) consensus for near-zero fee,
                    and instant transaction confirmation.
                </p>
            </div>
            <div class="box-condition">
                <h6 class="tmp-title-normal weightbold">Condition</h6>
                <b-row>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_1@3x.png"/>
                        </p>
                        <p>
                            The token issuer has to deposit a minimum amount of 10 TOMO to apply
                            to the TomoZ protocol. The deposit cannot be withdrawn.
                        </p>
                    </b-col>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_2@3x.png"/>
                        </p>
                        <p>
                            The deposited amount is deducted to pay masternodes for transaction
                            processing whenever a token transaction from token holders is processed.
                        </p>
                    </b-col>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_3@3x.png"/>
                        </p>
                        <p>
                            The token issuer will receive an amount of tokens from token
                            holders as compensation for the deposit.
                        </p>
                    </b-col>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_4@3x.png"/>
                        </p>
                        <p>
                            Token transactions will not be processed if the TOMO deposit is not
                            enough for paying masternodes. In that case, any one can donate
                            TOMO to resume the token transaction processing.
                        </p>
                    </b-col>
                </b-row>
            </div>
            <div class="btn-box">
                <b-button
                    :to="'/tomozapplication/' + address"
                    class="tmp-btn-violet">
                    I understand
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
import store from 'store'
import axios from 'axios'
export default {
    name: 'ApplyTomoZ',
    components: { },
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            token: {}
        }
    },
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        next()
    },
    created: async function () {
        const self = this
        self.account = store.get('address') ||
            self.$store.state.address || await self.getAccount()
        if (!self.account) {
            self.$router.push({ path: '/login' })
        }
        self.getData()
    },
    methods: {
        getData () {
            const self = this
            const vuexStore = self.$store.state
            if (vuexStore.token) {
                self.token = vuexStore.token
            } else {
                axios.get(`/api/token/${self.address}`).then(response => {
                    self.token = response.data
                }).catch(error => {
                    console.log(error)
                    self.$toasted.show(error, { type: 'error' })
                })
            }
        }
    }
}
</script>
