<template>
    <div class="container container-small">
        <div class="tomo-apply">
            <div class="info-header text-center">
                <p><i class="tomoissuer-icon-tomoz"/></p>
                <h2 class="tmp-title-large">TomoZ Protocol Application</h2>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label="Deposit fee"
                    label-for="depositFee"
                    description="Min: 10 TOMO, Available balance: 200 TOMO">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="depositFee"
                        type="text"
                        placeholder="How much TOMO do you want to deposit? (TX fee: 0.0005 TOMO)..."/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label="Set transaction fee"
                    label-for="setTransactionFee"
                    description="This setting could be modified later">
                    <span class="txt-fixed">TIIM</span>
                    <b-form-input
                        v-model="setTransactionFee"
                        type="text"
                        placeholder="How much fee for a transaction (unit: TIIM)..."/>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-boder-violet btn-min"
                        to="/tomozcondition">
                        Back
                    </b-button>
                    <b-button
                        class="tmp-btn-violet"
                        type="submit">
                        I understand
                    </b-button>
                </div>
            </b-form>
        </div>
    </div>
</template>

<script>
import store from 'store'
export default {
    name: 'TomoZApplication',
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
            this.$router.push({ name: 'TomoZConfirm',
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
