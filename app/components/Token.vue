<template>
    <div class="container container--wide">
        <div>
            <div>
                <h2 class="tmp-title-one">TIIM (TriipProtocol)</h2>
                <i
                    v-if="moreInfo"
                    class="fa fa-check-circle token-status"
                    aria-hidden="true"/>
                <h6 class="mb-0">{{ symbol }}</h6>
            </div>
            <div>
                <b-row>
                    <b-col md="6">
                        <table
                            v-if="token">
                            <tbody>
                                <tr>
                                    <td>Total Supply</td>
                                    <td>{{ formatNumber(token.totalSupplyNumber) }} {{ symbol }}</td>
                                </tr>
                                <tr>
                                    <td>Holders</td>
                                    <td>{{ formatNumber(holdersCount) }}
                                        {{ holdersCount > 1 ? 'addresses' : 'address' }}</td>
                                </tr>
                                <tr>
                                    <td>Transfers</td>
                                    <td>{{ formatNumber(tokenTxsCount) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                    <b-col md="6">
                        <table
                            v-if="token">
                            <tbody>
                                <tr>
                                    <td>Contract</td>
                                    <td>
                                        {{ token.hash }}
                                    </td>
                                </tr>
                                <tr v-if="token.type === 'trc20'">
                                    <td>Decimal</td>
                                    <td>{{ token.decimals }}</td>
                                </tr>
                                <tr>
                                    <td>Type</td>
                                    <td>{{ token.type ? token.type.toUpperCase() : token.type }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                </b-row>
            </div>
            <div
                v-if="isApplied"
                class="mt-3">This token is already applied</div>
            <div
                v-else
                class="mt-3">
                <b-form
                    novalidate
                    @submit.prevent="validate()">
                    <b-form-group
                        id="deposite"
                        label="Deposite"
                        label-for="deposite">
                        <b-form-input
                            id="deposite"
                            v-model="depositeAmount" />
                        <span
                            v-if="$v.depositeAmount.$dirty && !$v.depositeAmount.minValue"
                            class="text-danger">Minimum of depositing is 10 TOMO</span>
                        <span
                            v-if="$v.depositeAmount.$dirty && !$v.depositeAmount.required"
                            class="text-danger">Depositing amount is required</span>
                    </b-form-group>
                    <b-button
                        type="submit"
                        variant="primary">Apply</b-button>
                </b-form>
            </div>
            <div
                v-if="loading"
                class="mt-5">
                Loading...
            </div>
            <div class="mt-5">
                <b-form-group
                    v-if="transactionHash"
                    class="mb-4"
                    label="Transaction Hash"
                    label-for="transactionHash">
                    <b-form-input
                        v-model="transactionHash"
                        type="text" />
                </b-form-group>
            </div>
        </div>
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { required, minValue } from 'vuelidate/lib/validators'

export default {
    name: 'App',
    components: {},
    mixins: [validationMixin],
    data () {
        return {
            web3: this.web3,
            address: this.$route.params.address.toLowerCase(),
            token: null,
            tokenName: null,
            symbol: null,
            tokenTxsCount: 0,
            holdersCount: 0,
            moreInfo: '',
            loading: false,
            depositeAmount: '',
            isApplied: false,
            transactionHash: ''
        }
    },
    validations: {
        depositeAmount: {
            required,
            minValue: minValue(10)
        }
    },
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        try {
            const self = this
            self.getTokenDetail()
            self.checkApplied()
        } catch (error) {
            console.log(error)
            this.$toasted.show(error, { type :'error' })
        }
    },
    mounted () {},
    methods: {
        async getTokenDetail () {
            const self = this
            const { data } = await axios.get(`/api/token/${self.address}`)
            self.token = data
            self.tokenName = data.name
            self.symbol = data.symbol
            self.tokenTxsCount = data.tokenTxs
            self.holdersCount = data.tokenHolders
        },
        async applyToken () {
            try {
                this.loading = true
                const contract = await this.getTRC21IssuerInstance()
                const txParams = {
                    from: (await this.getAccount()).toLowerCase(),
                    value: this.web3.utils.toHex(new BigNumber(this.depositeAmount)
                        .multipliedBy(10 ** 18).toString(10)),
                    gasPrice: this.web3.utils.toHex(10000000000000),
                    gas: this.web3.utils.toHex(40000000),
                    gasLimit: this.web3.utils.toHex(40000000)
                }
                const result = await contract.apply(this.address, txParams)
                this.transactionHash = result.tx
                this.loading = false
            } catch (error) {
                this.loading = false
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            }
        },
        async checkApplied () {
            const contract = await this.getTRC21IssuerInstance()
            const result = await contract.tokens()
            if (result && result.length > 0) {
                const lowerCaseArr = result.map(m => m.toLowerCase())
                if (lowerCaseArr.indexOf(this.address) > -1) {
                    this.isApplied = true
                }
            }
        },
        validate () {
            this.$v.$touch()

            if (!this.$v.$invalid) {
                this.applyToken()
            }
        }
    }
}
</script>
