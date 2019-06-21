<template>
    <div class="container container-small">
        <div class="newtoken">
            <h2 class="tmp-title-large">Issue a new token</h2>
            <p>Start by choosing the wallet you would like to unlock</p>
            <b-form
                class="form-new-token"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label-for="tokenName"
                    description="Please use only Latin letters">
                    <b-form-input
                        v-model="tokenName"
                        type="text"
                        autocomplete="off"
                        placeholder="Token name"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="tokenSymbol"
                    description="Please use only Latin letters">
                    <b-form-input
                        v-model="tokenSymbol"
                        autocomplete="off"
                        type="text"
                        placeholder="Token symbol"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="totalSupply">
                    <b-form-input
                        v-model="totalSupply"
                        autocomplete="off"
                        type="number"
                        placeholder="Token supply"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="decimals"
                    description="Please use the number from 0 to 18">
                    <b-form-input
                        v-model="decimals"
                        autocomplete="off"
                        type="text"
                        placeholder="Decimals"/>
                </b-form-group>
                <b-form-group
                    class="flex-box mb-4"
                    label="Token Type"
                    label-for="type">
                    <b-form-radio-group
                        id="radio-group-2"
                        v-model="type"
                        class="box-radio"
                        name="radio-sub-component">
                        <b-form-radio
                            value="trc21">
                            TRC21
                        </b-form-radio>
                        <b-form-radio
                            value="trc20">
                            TRC20
                        </b-form-radio>
                    </b-form-radio-group>
                </b-form-group>
                <div class="form-group mb-4">
                    <label>Issue fee</label><span>50 TOMO</span>
                </div>
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
    name: 'App',
    components: { },
    data () {
        return {
            tokenName: '',
            tokenSymbol: '',
            decimals: '',
            minFee: 0,
            totalSupply: '',
            sourceCode: '',
            account: '',
            type: 'trc21'
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
    methods: {
        validate: function () {
            this.confirm()
        },
        confirm () {
            this.$router.push({ name: 'ConfirmToken',
                query: {
                    name: this.tokenName,
                    symbol: this.tokenSymbol,
                    decimals: this.decimals,
                    type: this.type,
                    totalSupply: this.totalSupply,
                    minFee: this.minFee
                }
            })
        }
    }
}
</script>
