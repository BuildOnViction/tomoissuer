<template>
    <div class="container container-small">
        <div class="newtoken">
            <h2 class="tmp-title-large">Token Issuance</h2>
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
                        type="text"
                        autocomplete="off"
                        placeholder="Token supply"
                        @change="onChangeSupply"/>
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
                        TRC21
                        <!-- <b-form-radio
                            value="trc21">
                            TRC21
                        </b-form-radio> -->
                    </b-form-radio-group>
                </b-form-group>
                <div class="form-group mb-4">
                    <label>Issuance fee</label><span>50 TOMO</span>
                </div>
                <div
                    v-if="!isEnoughTOMO"
                    class="text-center text-danger">
                    <span>
                        Your balance is not enough to pay the inssuance fee</span>
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
import BigNumber from 'bignumber.js'
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
            account: '',
            type: 'trc21',
            balance: 0,
            txFee: 0,
            gasPrice: 10000000000000,
            isEnoughTOMO: true
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
    watch : { },
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        next()
    },
    created: async function () {
        this.account = store.get('address') ||
        this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        await this.getBalance()
        this.config = store.get('config') || await this.appConfig()
        const chainConfig = this.config.blockchain
        this.txFee = new BigNumber(chainConfig.gas * this.gasPrice).div(10 ** 18).toString(10)
        if (this.balance < this.txFee) {
            this.isEnoughTOMO = false
        }
    },
    methods: {
        async getBalance () {
            const web3 = this.web3
            const result = await web3.eth.getBalance(this.account)
            const balance = new BigNumber(result).div(10 ** 18)
            this.balance = balance.toNumber().toFixed(4)
        },
        validate: function () {
            this.$v.$touch()
            if (!this.$v.$invalid && this.isEnoughTOMO) {
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
        },
        onChangeSupply (newValue) {
            const value = newValue.replace(/[^0-9.]/g, '')
            const result = value.replace(/\D/g, '')
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            this.totalSupply = result
        }
    }
}
</script>
