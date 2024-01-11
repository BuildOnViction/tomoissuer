<template>
    <div class="container container-medium">
        <div class="tomo-apply text-center">
            <h2 class="tmp-title-large">Pay fee by {{ token.name }} token</h2>
            <div class="about-VicZ">
                <h6 class="tmp-title-normal weightbold">What is Zero Gas Protocol (VicZ)</h6>
                <p>
                    VicZ - the first on-chain protocol that offers the ability for any user
                    to pay transaction fees with the same token the user is holding. Along with
                    the VicZ protocol, VRC25 is also proposed as a new smart contract-based
                    token standard that allows users to pay fees of any transaction sent to a
                    VRC25 smart contract in terms of the VRC25 token itself, without holding VIC in their wallet.
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
                            The token issuer has to deposit a minimum amount of 10 VIC to apply
                            to the VicZ protocol. The deposit cannot be withdrawn.
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
                            Token transactions will not be processed if the VIC deposit is not
                            enough for paying masternodes. In that case, any one can donate
                            VIC to resume the token transaction processing.
                        </p>
                    </b-col>
                </b-row>
            </div>
            <div class="btn-box">
                <b-button
                    :to="'/VicZapplication/' + address"
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
    name: 'ApplyVicZ',
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
