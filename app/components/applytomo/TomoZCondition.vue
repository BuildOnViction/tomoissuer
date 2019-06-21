<template>
    <div class="container container-medium">
        <div class="tomo-apply text-center">
            <h2 class="tmp-title-large">Pay fee by TIIM token</h2>
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
                        <p>You have to deposit a minimum of 10 TOMO as transaction fee</p>
                    </b-col>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_2@3x.png"/>
                        </p>
                        <p>Your deposit can't be withdrawed</p>
                    </b-col>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_3@3x.png"/>
                        </p>
                        <p>
                            The amount of deposit will be deducted whenever a
                            transaction from the user token is generated,
                            token users will pay the transaction fee through that token.
                        </p>
                    </b-col>
                    <b-col
                        cols="6">
                        <p>
                            <b-img
                                src="/app/assets/images/img_condition_4@3x.png"/>
                        </p>
                        <p>
                            When your token smart contract is not enough TOMO to
                            make transaction fee, the token user will not be
                            able to execute the transaction.
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
export default {
    name: 'ApplyTomoZ',
    components: { },
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
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
        }
    },
    created: async function () {},
    methods: { }
}
</script>
