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
                    <div
                        v-if="$v.tokenName.$dirty && !$v.tokenName.required"
                        class="text-danger pt-2">Required field</div>
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
                    <div
                        v-if="$v.tokenSymbol.$dirty && !$v.tokenSymbol.required"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="totalSupply">
                    <b-form-input
                        v-model="totalSupply"
                        autocomplete="off"
                        type="number"
                        placeholder="Token supply"/>
                    <div
                        v-if="$v.totalSupply.$dirty && !$v.totalSupply.required"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <b-form-group
                    class="mb-4"
                    label-for="decimals"
                    description="Please use the number from 0 to 18">
                    <b-form-input
                        v-model="decimals"
                        autocomplete="off"
                        type="number"
                        placeholder="Decimals"/>
                    <div
                        v-if="$v.decimals.$dirty && !$v.decimals.required"
                        class="text-danger pt-2">Required field</div>
                    <div
                        v-if="$v.decimals.$dirty && (!$v.decimals.minValue || !$v.decimals.maxValue)"
                        class="text-danger pt-2">Please use the number from 0 to 18</div>
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
import { validationMixin } from 'vuelidate'
import {
    required,
    minValue,
    maxValue
} from 'vuelidate/lib/validators'
export default {
    name: 'App',
    components: { },
    mixins: [validationMixin],
    data () {
        return {
            tokenName: '',
            tokenSymbol: '',
            decimals: '',
            totalSupply: '',
            sourceCode: '',
            account: '',
            type: 'trc21'
        }
    },
    validations: {
        decimals: {
            required,
            minValue: minValue(0),
            maxValue: maxValue(18)
        },
        tokenName: { required },
        tokenSymbol: { required },
        totalSupply: { required }
    },
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
    created: async function () {
        const vuexStore = this.$store.state
        if (vuexStore.issueToken) {
            const token = vuexStore.issueToken
            this.tokenName = token.tokenName
            this.tokenSymbol = token.tokenSymbol
            this.decimals = token.decimals
            this.totalSupply = token.totalSupply
            this.type = token.type
        }
    },
    methods: {
        validate: function () {
            this.$v.$touch()
            if (!this.$v.$invalid) {
                this.confirm()
            }
        },
        confirm () {
            this.$store.state.issueToken = {
                tokenName: this.tokenName,
                tokenSymbol: this.tokenSymbol,
                decimals: this.decimals,
                type: this.type,
                totalSupply: this.totalSupply
            }
            this.$router.push({ name: 'ConfirmToken',
                params: {
                    name: this.tokenName,
                    symbol: this.tokenSymbol,
                    decimals: this.decimals,
                    type: this.type,
                    totalSupply: this.totalSupply
                }
            })
        }
    }
}
</script>
