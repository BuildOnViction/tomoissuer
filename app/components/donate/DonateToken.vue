<template>
    <div class="container container-min">
        <div class="newtoken">
            <h4 class="color-white">Issue a new token</h4>
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
                        placeholder="Token name"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="tokenSymbol"
                    description="Please use only Latin letters">
                    <b-form-input
                        v-model="tokenSymbol"
                        type="text"
                        placeholder="Token symbol"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="tokenSupply">
                    <b-form-input
                        v-model="tokenSupply"
                        type="number"
                        placeholder="Token supply"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="decimals"
                    description="Please use the number from 0 to 18">
                    <b-form-input
                        v-model="decimals"
                        type="text"
                        placeholder="Decimals"/>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="minFee">
                    <b-form-input
                        v-model="minFee"
                        type="text"
                        placeholder="Minimum Transaction Fee"/>
                </b-form-group>
                <b-form-group
                    class="flex-box mb-4"
                    label="Token Type"
                    label-for="type">
                    <b-form-radio-group
                        id="radio-group-2"
                        v-model="selected"
                        class="box-radio"
                        name="radio-sub-component">
                        <b-form-radio
                            value="TRC21">
                            TRC21
                        </b-form-radio>
                        <b-form-radio
                            value="TRC20">
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
                        type="submit"
                        variant="primary">Save & Review</b-button>
                </div>
            </b-form>
        </div>
    </div>
</template>

<script>
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
    created: async function () {},
    methods: {
        validate: function () {
            this.confirm()
        },
        confirm () {
            this.$router.push({ name: 'Confirmation',
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
