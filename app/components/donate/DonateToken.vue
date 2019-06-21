<template>
    <div class="container container-small">
        <div class="tomo-donate">
            <h2 class="tmp-title-large">Donate TRC-21 transaction fee</h2>
            <div class="box-desc">
                <h6 class="tmp-title-normal weightbold">What is donation fee</h6>
                <p>
                    TomoChain is an innovative solution to scalability problem with the
                    Ethereum blockchain, and other blockchain platforms.
                    TomoChain features a 150-Masternodes architecture with
                    Proof of Stake Voting (POSV) consensus for near-zero fee,
                    and instant transaction confirmation.
                </p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label="Enter your token name or contract address "
                    label-for="tokenName">
                    <b-form-input
                        v-model="tokenName"
                        type="text"
                        placeholder="Token name"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label="Donation amount"
                    label-for="donationAmount"
                    description="Available balance:  5,200 TOMO">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="DonationAmount"
                        type="text"
                        placeholder="Donation amount"/>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-blue"
                        type="submit">Save & Review</b-button>
                </div>
            </b-form>
        </div>
    </div>
</template>

<script>
import store from 'store'
export default {
    name: 'Donate',
    components: { },
    data () {
        return {
            tokenName: '',
            tokenSymbol: '',
            decimals: '',
            minFee: '',
            tokenSupply: '',
            sourceCode: '',
            account: '',
            type: ''
        }
    },
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
    created: async function () {},
    methods: {
        validate: function () {
            this.confirm()
        },
        confirm () {
            console.log(1111)
            this.$router.push({ name: 'ConfirmDonate',
                query: {
                    name: this.tokenName,
                    symbol: this.tokenSymbol,
                    decimals: this.decimals,
                    type: this.type,
                    tokenSupply: this.tokenSupply,
                    minFee: this.minFee
                }
            })
        }
    }
}
</script>
