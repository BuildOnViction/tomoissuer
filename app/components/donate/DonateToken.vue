<template>
    <div class="container container-small">
        <div class="tomo-donate">
            <h2 class="tmp-title-large">Donate TRC-21 transaction fee</h2>
            <div class="box-desc">
                <h6 class="tmp-title-normal weightbold">What is donation fee</h6>
                <p>
                    TomoChain is an innovative solution to scalability problem with the
                    Ethereum blockchain, and other blockchain platforms.
                    TomoChain features a 150-Masternodes architecture with
                    Proof of Stake Voting (POSV) consensus for near-zero fee,
                    and instant transaction confirmation.
                </p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label="Enter your token name or contract address "
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
                </b-form-group>
                <b-form-group
                    :description="`Available balance:  ${balance} TOMO`"
                    class="mb-4"
                    label="Donation amount"
                    label-for="donationAmount">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="donationAmount"
                        type="text"
                        placeholder="Donation amount"/>
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
import { validationMixin } from 'vuelidate'
import {
    required,
    minValue
} from 'vuelidate/lib/validators'
import AutoComplete from '../Searching.vue'
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
            tokenAddress: '',
            depositingError: false
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
    watch: {},
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        next()
    },
    created: async function () {
        this.account = store.get('address') || await self.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        this.getBalance()
    },
    methods: {
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
