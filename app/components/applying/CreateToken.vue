<template>
    <div class="container">
        <b-form
            novalidate
            @submit.prevent="validate()">
            <b-form-group
                class="mb-4"
                label="Token Type"
                label-for="type">
                <b-form-select
                    id="type"
                    v-model="type"
                    class="form-control">
                    <option
                        value="trc20">TRC20</option>
                    <option
                        value="trc21">TRC21</option>
                </b-form-select>
            </b-form-group>
            <b-form-group
                class="mb-4"
                label="Token Name"
                label-for="tokenName">
                <b-form-input
                    v-model="tokenName"
                    type="text" />
            </b-form-group>
            <b-form-group
                class="mb-4"
                label="Token Symbol"
                label-for="tokenSymbol">
                <b-form-input
                    v-model="tokenSymbol"
                    type="text" />
            </b-form-group>
            <b-form-group
                class="mb-4"
                label="Total Supply"
                label-for="totalSupply">
                <b-form-input
                    v-model="totalSupply"
                    type="text" />
            </b-form-group>
            <b-form-group
                class="mb-4"
                label="Decimals"
                label-for="decimals">
                <b-form-input
                    v-model="decimals"
                    type="text" />
            </b-form-group>
            <b-form-group
                class="mb-4"
                label="Minimum Transaction Fee"
                label-for="minFee">
                <b-form-input
                    v-model="minFee"
                    type="text" />
            </b-form-group>
            <div class="buttons text-right">
                <b-button
                    type="submit"
                    variant="primary">Next</b-button>
            </div>
        </b-form>
    </div>
</template>

<script>
export default {
    name: 'App',
    components: { },
    data () {
        return {
            tokenName: '',
            tokenSymbol: '',
            decimals: '',
            minFee: '',
            totalSupply: 0,
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
            console.log(111)
            this.confirm()
        },
        confirm () {
            this.$router.push({ name: 'Confirmation',
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
