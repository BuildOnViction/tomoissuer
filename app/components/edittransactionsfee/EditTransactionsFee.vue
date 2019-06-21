<template>
    <div class="container container-small flex-content-center">
        <div class="tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Edit transaction fee</h2>
                <p>Current fee: 0.0001 TIIM</p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label-for="depositFee"
                    description="Current fee: 0.0001 TIIM">
                    <span class="txt-fixed">TIIM</span>
                    <b-form-input
                        v-model="depositFee"
                        type="text"
                        placeholder="How much fee for a transaction (unit: TIIM)"/>
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
                        Update
                    </b-button>
                </div>
            </b-form>
        </div>
    </div>
</template>

<script>
import store from 'store'
export default {
    name: 'EditTransactionsFee',
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
        }
    },
    created: async function () {},
    methods: {
        validate: function () {
            this.confirm()
        },
        confirm () {
            console.log(1111)
            this.$router.push({ name: 'EditTransactionsFeeConfirm',
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
