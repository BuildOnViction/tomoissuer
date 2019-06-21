<template>
    <div class="container container-small flex-content-center">
        <div class="tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Deposit pooling fee</h2>
                <p>Current TIIM pooling fee: 9.1 TOMO</p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label-for="depositFee"
                    description="Min: 10 TOMO, Available balance: 200 TOMO">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="depositFee"
                        type="text"
                        placeholder="How much TOMO do you want to deposit? (TX fee: 0.0005 TOMO)..."/>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-boder-violet btn-min"
                        to="/token/0x2f8fa62a62410febc56c96c3ceb8666e193a1be3">
                        Back
                    </b-button>
                    <b-button
                        class="tmp-btn-violet"
                        type="submit">
                        Deposit
                    </b-button>
                </div>
            </b-form>
        </div>
    </div>
</template>

<script>
import store from 'store'
export default {
    name: 'DepositFee',
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
    async updated () {},
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
            this.$router.push({ name: 'DepositConfirm',
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
