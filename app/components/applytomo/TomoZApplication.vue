<template>
    <div class="container container-small">
        <div class="tomo-apply">
            <div class="info-header text-center">
                <p>
                    <span class="tm-icon-tomoz-new"><span class="path1"/><span class="path2"/></span>
                </p>
                <!-- <p><i class="tm-icon-tomoz-new"/></p> -->
                <h2 class="tmp-title-large">TomoZ Protocol Application</h2>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    :description="`TX fee: 0.0005 TOMO, Available balance: ${balance} TOMO`"
                    :class="'mb-4' + ($v.depositFee.$dirty ? ' input-warn' : '') + warningClass"
                    label="Deposit amount"
                    label-for="depositFee">
                    <span class="txt-fixed">TOMO</span>
                    <b-form-input
                        v-model="depositFee"
                        type="text"
                        placeholder="How much TOMO do you want to deposit? (Min: 10 TOMO)..."
                        @input="onChange"/>
                    <div
                        v-if="$v.depositFee.$dirty && !$v.depositFee.required"
                        class="text-danger pt-2">Required field</div>
                    <div
                        v-else-if="$v.depositFee.$dirty && !$v.depositFee.minValue"
                        class="text-danger pt-2">Minimum of depositing is 10 TOMO</div>
                    <div
                        v-else-if="depositingError"
                        class="text-danger pt-2">Not enough TOMO</div>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-boder-violet btn-min"
                        @click="back">
                        Back
                    </b-button>
                    <b-button
                        class="tmp-btn-violet"
                        type="submit">
                        Submit
                    </b-button>
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
export default {
    name: 'TomoZApplication',
    mixins: [validationMixin],
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            token: {},
            sourceCode: '',
            account: '',
            depositFee: '',
            balance: '',
            depositingError: '',
            warningClass: ''
        }
    },
    validations: {
        depositFee: {
            required,
            minValue: minValue(10)
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        const self = this
        self.account = store.get('address') ||
            self.$store.state.address || await self.getAccount()
        if (!self.account) {
            self.$router.push({ path: '/login' })
        }
        self.getData()
        self.getBalance()
    },
    methods: {
        getData () {
            const self = this
            const vuexStore = self.$store.state
            if (vuexStore.token) {
                self.token = vuexStore.token
            } else {
                axios.get(`/api/token/${self.address}`).then(response => {
                    self.token = response.data
                }).catch(error => {
                    console.log(error)
                    self.$toasted.show(error, { type: 'error' })
                })
            }
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
        getBalance () {
            const web3 = this.web3
            if (this.account && web3) {
                web3.eth.getBalance(this.account).then(result => {
                    const balance = new BigNumber(result).div(10 ** 18)
                    this.balance = balance.toNumber().toFixed(4)
                }).catch(error => {
                    console.log(error)
                    this.$toasted.show(error, { type: 'error' })
                })
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
        back () {
            this.$router.go(-2)
        },
        confirm () {
            this.$router.push({ name: 'TomoZConfirm',
                params: {
                    address: this.address,
                    token: this.token,
                    depositFee: this.depositFee
                }
            })
        }
    }
}
</script>
