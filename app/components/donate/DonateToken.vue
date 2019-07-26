<template>
    <div class="container container-small">
        <div class="tomo-donate">
            <h2 class="tmp-title-large">Donate TRC-21 transaction fee</h2>
            <div class="box-desc">
                <h6 class="tmp-title-normal weightbold">Why do we need to donate TRC-21 transaction fee?</h6>
                <p>
                    Token transactions will not be processed if the remaining deposit is not
                    enough to pay transaction fees. In such a case, to resume the processing
                    of token transactions, any TOMO holder can deposit/donate TOMO to the TomoIssuer smart contract.
                </p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label="Enter the token name or contract address you would like to donate"
                    label-for="tokenName">
                    <auto-complete
                        :page="this"/>
                    <!-- <b-form-input
                        v-model="tokenAddress"
                        type="text"
                        placeholder="Token name"/> -->
                    <div
                        v-if="$v.tokenAddress.$dirty && !$v.tokenAddress.required"
                        class="text-danger pt-2">Required field</div>
                    <div
                        v-if="token.hash"
                        class="pt-2">
                        <div>
                            Contract address:
                            <b-link
                                :href="config.tomoscanUrl + '/tokens/' + tokenAddress"
                                target="_blank">
                                {{ tokenAddress }}
                            </b-link>
                        </div>
                        <div>
                            TRC-21 fee fund: {{ formatNumber(poolingFee) }} TOMO
                        </div>
                    </div>
                    <div
                        v-if="!tokenExist"
                        class="text-danger pt-2">Token not found</div>
                </b-form-group>
                <b-form-group
                    :description="`Available balance:  ${balance} TOMO`"
                    :class="'mb-4' + ($v.donationAmount.$dirty ? ' input-warn' : '') + warningClass"
                    label="Donation amount"
                    label-for="donationAmount">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="donationAmount"
                        type="number"
                        placeholder="Donation amount"
                        @input="onChange"/>
                    <div
                        v-if="$v.donationAmount.$dirty && !$v.donationAmount.required"
                        class="text-danger pt-2">Required field</div>
                    <div
                        v-else-if="$v.donationAmount.$dirty && !$v.donationAmount.minValue"
                        class="text-danger pt-2">Deposit amount should be more than 0 TOMO</div>
                    <div
                        v-else-if="depositingError"
                        class="text-danger pt-2">Not enough TOMO</div>
                </b-form-group>
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
import BigNumber from 'bignumber.js'
import axios from 'axios'
import { validationMixin } from 'vuelidate'
import {
    required,
    minValue
} from 'vuelidate/lib/validators'
import AutoComplete from '../Searching.vue'
const regexAddress = /^0x[a-fA-F0-9]{40}$/
export default {
    name: 'Donate',
    components: {
        AutoComplete
    },
    mixins: [validationMixin],
    data () {
        return {
            account: '',
            balance: '',
            donationAmount: '',
            depositingError: false,
            tokenAddress: '',
            config: {},
            poolingFee: '',
            token: {},
            tokenExist: true,
            warningClass: ''
        }
    },
    validations: {
        tokenAddress: {
            required
        },
        donationAmount: {
            required,
            minValue: minValue(0)
        }
    },
    computed: {},
    watch: {
        tokenAddress: async function (newValue) {
            if (regexAddress.test(newValue)) {
                await this.getData()
                this.getPoolingFee()
            }
            if (newValue === '') {
                this.token = {}
            }
        }
    },
    async updated () {
    },
    destroyed () { },
    created: async function () {
        this.account = store.get('address') ||
            this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        this.config = store.get('configIssuer') ||
            this.appConfig().then(result => {
                this.config = result
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        this.getBalance()
    },
    methods: {
        async getData () {
            const self = this
            try {
                const vuexStore = self.$store.state
                if (vuexStore.token) {
                    self.token = vuexStore.token
                } else {
                    const { data } = await axios.get(`/api/token/${self.tokenAddress}`)
                    if (data) {
                        self.token = data
                        self.tokenExist = true
                    } else {
                        self.token = {}
                        self.tokenExist = false
                    }
                }
            } catch (error) {
                self.token = {}
                self.tokenExist = false
                self.tokenAddress = ''
            }
        },
        getBalance () {
            const web3 = this.web3
            web3.eth.getBalance(this.account).then(result => {
                const balance = new BigNumber(result).div(10 ** 18)
                this.balance = balance.toNumber().toFixed(4)
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        getPoolingFee () {
            const contract = this.TRC21Issuer
            contract.methods.getTokenCapacity(this.tokenAddress).call().then(capacity => {
                let balance = new BigNumber(this.web3.utils.hexToNumberString(capacity))
                this.poolingFee = balance.div(10 ** 18).toNumber()
            }).catch(error => {
                console.log(error)
                this.$toatsed.show(error, { type: 'error' })
            })
        },
        validate: function () {
            const self = this
            self.donationAmount = self.donationAmount.replace(/,/g, '')
            self.$v.$touch()
            if (!self.$v.$invalid) {
                if ((new BigNumber(self.donationAmount)).isGreaterThanOrEqualTo(self.balance)) {
                    self.depositingError = true
                } else {
                    self.depositingError = false
                    self.confirm()
                }
            }
        },
        onChange () {
            const self = this
            if ((new BigNumber(self.donationAmount)).isGreaterThanOrEqualTo(self.balance)) {
                self.depositingError = true
                self.warningClass = ' input-warn'
            } else {
                self.depositingError = false
                self.warningClass = ''
            }
        },
        confirm () {
            this.$router.push({ name: 'ConfirmDonate',
                params: {
                    address: this.tokenAddress,
                    donationAmount: this.donationAmount
                }
            })
        }
    }
}
</script>
