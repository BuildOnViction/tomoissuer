<template>
    <div class="container container-small flex-content-center">
        <div class="tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Deposit TRC-21 fee</h2>
                <p>Current {{ token.name }} fee fund: {{ currentPoolingFee }} TOMO</p>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    :description="`TX fee: 0.0005 TOMO, Available balance: ${showingBalance} TOMO`"
                    :class="'mb-4' + ($v.depositFee.$dirty ? ' input-warn' : '') + warningClass"
                    label-for="depositFee">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="depositFee"
                        type="number"
                        placeholder="How much TOMO do you want to deposit?..."
                        @input="onChange"/>
                    <div
                        v-if="$v.depositFee.$dirty && !$v.depositFee.required"
                        class="text-danger pt-2">Required field</div>
                    <div
                        v-else-if="$v.depositFee.$dirty && !$v.depositFee.minValue"
                        class="text-danger pt-2">Deposit amount should be more than 0 TOMO</div>
                    <div
                        v-else-if="depositingError"
                        class="text-danger pt-2">Not enough TOMO</div>
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
                        Deposit
                    </b-button>
                </div>
            </b-form>
        </div>
    </div>
</template>

<script>
import store from 'store'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { validationMixin } from 'vuelidate'
import {
    required,
    minValue
} from 'vuelidate/lib/validators'
export default {
    name: 'DepositFee',
    mixins: [validationMixin],
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            config: {},
            token: {},
            loading: false,
            currentPoolingFee: '',
            depositFee: '',
            balance: '',
            depositingError: '',
            warningClass: '',
            showingBalance: ''
        }
    },
    validations: {
        depositFee: {
            required,
            minValue: minValue(0.1)
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        this.account = store.get('address') ||
            this.$store.state.address || await self.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        await this.getData()
        this.getPoolingFee()
        this.getBalance()
    },
    methods: {
        async getData () {
            const self = this
            const vuexStore = self.$store.state
            if (vuexStore.token) {
                self.token = vuexStore.token
            } else {
                const { data } = await axios.get(`/api/token/${self.address}`)
                self.token = data
            }
        },
        getPoolingFee () {
            const contract = this.TRC21Issuer
            contract.methods.getTokenCapacity(this.address).call().then(capacity => {
                let balance = new BigNumber(this.web3.utils.hexToNumberString(capacity))
                this.currentPoolingFee = balance.div(10 ** 18).toNumber().toFixed(2)
            }).catch(error => {
                console.log(error)
                this.$toatsed.show(error, { type: 'error' })
            })
        },
        getBalance () {
            const web3 = this.web3
            web3.eth.getBalance(this.account).then(result => {
                const balance = new BigNumber(result).div(10 ** 18)
                this.balance = balance
                this.showingBalance = balance.toNumber().toFixed(4)
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        validate: function () {
            const self = this
            self.depositFee = self.depositFee.replace(/,/g, '')
            self.$v.$touch()
            if (!self.$v.$invalid) {
                if ((new BigNumber(self.depositFee)).isGreaterThanOrEqualTo(self.balance)) {
                    self.depositingError = true
                } else {
                    self.depositingError = false
                    self.confirm()
                }
            }
        },
        onChange () {
            const self = this
            if ((new BigNumber(self.depositFee)).isGreaterThanOrEqualTo(self.balance)) {
                self.depositingError = true
                self.warningClass = ' input-warn'
            } else {
                self.depositingError = false
                self.warningClass = ''
            }
        },
        confirm () {
            this.$router.push({ name: 'DepositConfirm',
                params: {
                    address: this.address,
                    currentPoolingFee: this.currentPoolingFee,
                    depositFee: this.depositFee
                }
            })
        }
    }
}
</script>
