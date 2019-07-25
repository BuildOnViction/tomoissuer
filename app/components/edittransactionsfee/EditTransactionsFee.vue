<template>
    <div class="container container-small flex-content-center">
        <div class="tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Edit transaction fee</h2>
            </div>
            <b-form
                class="tmp-form-one"
                novalidate
                @submit.prevent="validate()">
                <p>Current Tx fee is {{ currentFee }} {{ token.symbol }}</p>
                <b-form-group
                    :class="'mb-4' + ($v.newFee.$dirty ? ' input-warn' : '')"
                    label-for="newFee">
                    <span class="txt-fixed">{{ token.symbol }}</span>
                    <b-form-input
                        :placeholder="`Enter the new transaction fee`"
                        v-model="newFee"
                        type="number"/>
                    <div
                        v-if="$v.newFee.$dirty && !$v.newFee.required"
                        class="text-danger pt-2">Required field</div>
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
                        Update
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
    required
} from 'vuelidate/lib/validators'
export default {
    name: 'EditTransactionsFee',
    mixins: [validationMixin],
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            newFee: '',
            currentFee: '',
            token: {}
        }
    },
    validations: {
        newFee: {
            required
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        this.account = store.get('address') ||
            this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        await this.getData()
        this.getCurrentFee()
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
            this.$v.$touch()
            if (!this.$v.$invalid) {
                this.confirm()
            }
        },
        confirm () {
            this.$router.push({ name: 'EditTransactionsFeeConfirm',
                params: {
                    address: this.address,
                    currentFee: this.currentFee,
                    newFee: this.newFee
                }
            })
        }
    }
}
</script>
