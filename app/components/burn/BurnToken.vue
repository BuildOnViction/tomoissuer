<template>
    <div class="container container-small flex-content-center">
        <div class="tomo-body-fullw">
            <h2 class="tmp-title-large">{{ token.name }} Token Burn</h2>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <div class="d-flex justify-content-between mb-4">
                    <b-card-text
                        class="m-0">
                        Current Total supply
                    </b-card-text>
                    <b-card-text
                        class="m-0">
                        {{ formatNumber(token.totalSupplyNumber) }} {{ token.symbol }}
                    </b-card-text>
                </div>
                <div class="d-flex justify-content-between mb-4">
                    <b-card-text
                        class="m-0">
                        Current owner balance
                    </b-card-text>
                    <b-card-text
                        class="m-0">
                        {{ formatNumber(ownerBalance) }} {{ token.symbol }}
                    </b-card-text>
                </div>
                <b-form-group
                    :description="`Transaction fee:  ${currentFee} ${token.symbol}`"
                    :class="'mb-4' + ($v.burnAmount.$dirty ? ' input-warn' : '') + warningClass"
                    label-for="burnAmount">
                    <span class="txt-fixed">{{ token.symbol }}</span>
                    <b-form-input
                        v-model="burnAmount"
                        type="text"
                        placeholder="Quantity of token to be burned"
                        @input="onChangeSupply"/>
                    <div
                        v-if="$v.burnAmount.$dirty && !$v.burnAmount.required"
                        class="text-danger pt-2">Required field</div>
                    <div
                        v-else-if="$v.burnAmount.$dirty && !$v.burnAmount.minValue"
                        class="text-danger pt-2">Deposit amount should be more than 0 TOMO</div>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-blue"
                        type="submit">Next</b-button>
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
// const regexAddress = /^0x[a-fA-F0-9]{40}$/
export default {
    name: 'Reissue',
    components: {
        AutoComplete
    },
    mixins: [validationMixin],
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            balance: '',
            burnAmount: '',
            config: {},
            token: {},
            tokenExist: true,
            warningClass: '',
            currentFee: '',
            ownerBalance: '',
            contractCreation: '',
            checkSupply: false
        }
    },
    validations: {
        burnAmount: {
            required,
            minValue: minValue(0)
        }
    },
    computed: {},
    watch: {
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
        await this.getTokenDetail()
        this.getCurrentFee()
        this.getOwnerBalance()
    },
    methods: {
        async getTokenDetail () {
            const self = this
            const { data } = await axios.get(`/api/account/${self.address}`)
            const token = data.token
            self.token = token || {}
            self.contractCreation = data.contractCreation
        },
        getOwnerBalance () {
            const web3 = this.web3
            if (this.contractCreation && web3) {
                // 0x70a08231 is balanceOf(address) function code
                let data = '0x70a08231' +
                    '000000000000000000000000' +
                    this.contractCreation.substr(2) // chop off the 0x
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.ownerBalance = balance.div(10 ** this.token.decimals).toNumber()
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
        },
        getCurrentFee () {
            const web3 = this.web3
            if (this.account && web3) {
                // 0x24ec7590 is minFee function code
                let data = '0x24ec7590' +
                    '00000000000000000000000000000000000000000000000000000000'
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.currentFee = balance.div(10 ** this.token.decimals).toNumber()
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
        },
        validate: function () {
            const self = this
            self.burnAmount = self.burnAmount.replace(/,/g, '')
            self.$v.$touch()
            if (!self.$v.$invalid) {
                self.confirm()
            }
        },
        onChangeSupply (newValue) {
            const value = newValue.replace(/[^0-9.]/g, '')
            const result = value.replace(/\D/g, '')
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            this.burnAmount = result
            if (this.burnAmount.length !== 0) {
                this.checkSupply = true
            } else { this.checkSupply = false }
        },
        confirm () {
            this.$router.push({ name: 'BurnTokenConfirm',
                params: {
                    address: this.address,
                    burnAmount: this.burnAmount,
                    ownerBalance: this.ownerBalance
                }
            })
        }
    }
}
</script>
