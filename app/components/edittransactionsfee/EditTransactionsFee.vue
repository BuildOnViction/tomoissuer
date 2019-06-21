<template>
    <div class="container container-small flex-content-center">
        <div class="tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Edit transaction fee</h2>
                <p>Current fee: {{ currentFee }} {{ tokenSymbol }}</p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label-for="newFee">
                    <span class="txt-fixed">{{ tokenSymbol }}</span>
                    <b-form-input
                        :placeholder="`How much fee for a transaction (unit: ${tokenSymbol})`"
                        v-model="newFee"
                        type="text"/>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        :to="'/token/' + address"
                        class="tmp-btn-boder-violet btn-min">
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
            address: this.$route.params.address.toLowerCase(),
            tokenSymbol: '',
            decimals: '',
            minFee: '',
            tokenSupply: '',
            sourceCode: '',
            account: '',
            type: '',
            newFee: '',
            currentFee: ''
        }
    },
    async updated () {},
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
    created: async function () {
        console.log(this.$route)
        console.log(this.tokenFee)
    },
    methods: {
        validate: function () {
            this.confirm()
        },
        confirm () {
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
