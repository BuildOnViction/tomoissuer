<template>
    <div class="container container-small">
        <div class="newtoken">
            <h2 class="tmp-title-large">Token Issuance</h2>
            <b-form
                class="form-new-token"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    :class="'mb-4 ' + ($v.tokenName.$dirty && !checkName ? 'input-warn' : '') + warningName"
                    label-for="tokenName"
                    label="Token Name">
                    <b-form-input
                        v-model="tokenName"
                        type="text"
                        autocomplete="off"
                        maxlength="20"
                        placeholder="Please use only Latin letters and numbers, e.g. “TomoChain”"
                        @input="onChangeName"
                        @change="onChangeName"/>
                    <div
                        v-if="checkName"
                        class="txt-fixed-behind">
                        <i class="tm-icon-checkmark-outline custom-checkmark"/>
                    </div>
                    <!-- <small
                        tabindex="-1"
                        class="form-text text-muted">
                        Please use only Latin letters and numbers, e.g. “TomoChain”
                    </small> -->
                    <small
                        class="float-right txt-fixed-description">
                        Character left: {{ nameLeft }}
                    </small>
                    <div
                        v-if="$v.tokenName.$dirty && !$v.tokenName.required"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <b-form-group
                    :class="'mb-4 form-group' +
                    ($v.tokenSymbol.$dirty && !checkSymbol ? ' input-warn' : '') + warningSymbol"
                    label-for="tokenSymbol"
                    label="Token Symbol">
                    <b-form-input
                        v-model="tokenSymbol"
                        autocomplete="off"
                        type="text"
                        maxlength="5"
                        placeholder="Please use only Latin letters and numbers, e.g. “TOMO”"
                        @input="onChangeSymbol"
                        @change="onChangeSymbol"/>
                    <div
                        v-if="checkSymbol"
                        class="txt-fixed-behind">
                        <i class="tm-icon-checkmark-outline custom-checkmark"/>
                    </div>
                    <!-- <small
                        tabindex="-1"
                        class="form-text text-muted">
                        Please use only Latin letters and numbers, e.g. “TOMO”
                    </small> -->
                    <small
                        class="float-right txt-fixed-description">
                        Character left: {{ symbolLeft }}
                    </small>
                    <div
                        v-if="$v.tokenSymbol.$dirty && !$v.tokenSymbol.required"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <b-form-group
                    :class="'mb-4 form-group' + ($v.totalSupply.$dirty && !checkSupply ? ' input-warn' : '')"
                    label-for="totalSupply">
                    <label>
                        Token Supply
                        <i
                            id="totalSupply"
                            class="tm-icon-info mb-2"/>
                    </label>
                    <b-tooltip
                        target="totalSupply">
                        This field refers to the total amount of tokens supply that your asset will contain
                    </b-tooltip>
                    <b-row class="align-items-center">
                        <b-col
                            cols="12"
                            md="5"
                            class="mb-sp-4">
                            <div class="clearfix">
                                <b-form-input
                                    v-model="totalSupply"
                                    type="text"
                                    autocomplete="off"
                                    placeholder="Please use only number"
                                    @input="onChangeSupply"
                                    @change="onChangeSupply"/>
                                <div
                                    v-if="checkSupply"
                                    class="txt-fixed-behind">
                                    <i class="tm-icon-checkmark-outline custom-checkmark"/>
                                </div>
                            </div>
                        </b-col>
                        <b-col
                            :class="($v.totalSupply.$dirty && !checkSupply ? ' input-warn' : '')"
                            label-for="mintable"
                            cols="12"
                            md="7">
                            <b-row>
                                <b-col cols="5">
                                    <b-form-radio
                                        v-model="mintable"
                                        :value="true"
                                        class="flex-box">
                                        Reissuable
                                        <i
                                            id="mintable"
                                            class="tm-icon-info mb-2"/>
                                    </b-form-radio>
                                    <b-tooltip
                                        target="mintable">
                                        The reissuable token is the token type which its total
                                        supply could be increased by the issuer at a later point or not, at any time
                                    </b-tooltip>
                                    <div
                                        v-if="$v.mintable.$dirty && !$v.mintable.required"
                                        class="text-danger">Please select one</div>
                                </b-col>
                                <b-col cols="7">
                                    <b-form-radio
                                        v-model="mintable"
                                        :value="false"
                                        class="flex-box">
                                        Non-reissueable
                                        <i
                                            id="notmintable"
                                            class="tm-icon-info mb-2"/>
                                    </b-form-radio>
                                    <b-tooltip
                                        target="notmintable">
                                        The non-reissuable token is the token type which its
                                        total supply will be fixed and could not be increased at a later point
                                    </b-tooltip>
                                </b-col>
                            </b-row>
                        </b-col>
                    </b-row>
                    <!-- <small
                        tabindex="-1"
                        class="form-text text-muted">
                        Please use only number
                    </small> -->
                    <div
                        v-if="$v.totalSupply.$dirty && !$v.totalSupply.required"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <b-form-group
                    v-if="isEditDecimals"
                    :class="'mb-4' + ($v.decimals.$dirty && !checkDecimals ? ' input-warn' : '') + warningDecimals"
                    label-for="decimals"
                    label="Decimals">
                    <b-form-input
                        v-model="decimals"
                        autocomplete="off"
                        type="number"
                        placeholder="Please use the number from 0 to 18"
                        @input="onChangeDecimals"
                        @change="onChangeDecimals"/>
                    <!-- <small
                        tabindex="-1"
                        class="form-text text-muted">
                        Please use the number from 0 to 18
                    </small> -->
                    <div
                        v-if="checkDecimals"
                        class="txt-fixed-behind">
                        <i class="tm-icon-checkmark-outline custom-checkmark"/>
                    </div>
                    <div
                        v-if="$v.decimals.$dirty && !$v.decimals.required"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <b-form-group
                    v-if="!isEditDecimals"
                    class="flex-box mb-4"
                    label="Decimals"
                    label-for="decimals">
                    {{ decimals }}
                    <b-button
                        v-if="!isEditDecimals"
                        class="text-decoration-none button-fixed text-blue"
                        variant="link"
                        @click="editDecimals">Edit</b-button>
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
                <div class="form-group flex-box mb-4">
                    <label>Est. Issuance Fee</label><span>~{{ txFee }} TOMO</span>
                </div>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-blue"
                        type="submit">Save & Review</b-button>
                </div>
                <div
                    v-if="!isEnoughTOMO"
                    class="text-center text-danger">
                    <span>
                        Your balance is not enough to pay the inssuance fee</span>
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
    maxValue,
    helpers
} from 'vuelidate/lib/validators'
import BigNumber from 'bignumber.js'

const regexName = /^[a-zA-Z0-9\s]*$/
const regexSymbol = /^[a-zA-Z0-9]*$/
const latin = helpers.regex('latin', regexName)
const checkSymbol = helpers.regex('latin', regexSymbol)
export default {
    name: 'App',
    components: { },
    mixins: [validationMixin],
    data () {
        return {
            tokenName: '',
            tokenSymbol: '',
            decimals: 18,
            totalSupply: '',
            account: '',
            type: 'trc21',
            balance: 0,
            txFee: 0,
            gasPrice: 10000000000000,
            isEnoughTOMO: true,
            checkName: false,
            checkSymbol: false,
            checkSupply: false,
            checkDecimals: false,
            // issueFee: '',
            isEditDecimals: false,
            warningName: '',
            warningSymbol: '',
            warningDecimals: '',
            warningMintable: '',
            mintable: ''
        }
    },
    validations: {
        decimals: {
            required,
            minValue: minValue(0),
            maxValue: maxValue(18)
        },
        tokenName: { required, latin },
        tokenSymbol: { required, checkSymbol },
        totalSupply: { required },
        mintable: { required }
    },
    computed: {
        nameLeft: function () {
            return 20 - this.tokenName.length
        },
        symbolLeft: function () {
            return 5 - this.tokenSymbol.length
        }
    },
    watch : { },
    async updated () {
    },
    destroyed () { },
    created: async function () {
        this.account = store.get('address') ||
        this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        await this.getBalance()
        this.config = store.get('configIssuer') || await this.appConfig()
        this.estimateGas()
    },
    methods: {
        async getBalance () {
            const web3 = this.web3
            const result = await web3.eth.getBalance(this.account)
            this.balance = new BigNumber(result).div(10 ** 18)
        },
        validate: function () {
            this.$v.$touch()
            if (!this.$v.$invalid && this.isEnoughTOMO) {
                this.confirm()
            }
        },
        confirm () {
            this.$router.push({ name: 'ConfirmToken',
                params: {
                    name: this.tokenName,
                    symbol: this.tokenSymbol,
                    decimals: this.decimals,
                    type: this.type,
                    totalSupply: this.totalSupply,
                    issueFee: this.issueFee,
                    estimatedAmount: this.estimatedAmount,
                    mintable: this.mintable
                }
            })
        },
        onChangeSupply (newValue) {
            const value = newValue.replace(/[^0-9.]/g, '')
            const result = value.replace(/\D/g, '')
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            this.totalSupply = result
            if (this.totalSupply.length !== 0) {
                this.checkSupply = true
            } else { this.checkSupply = false }
        },
        onChangeName (name) {
            if (name.length !== 0 &&
                regexName.test(name)) {
                this.checkName = true
                this.warningName = ''
            } else {
                this.checkName = false
                this.warningName = ' input-warn'
            }
        },
        onChangeSymbol () {
            if (this.tokenSymbol.length !== 0 &&
                regexSymbol.test(this.tokenSymbol)) {
                this.checkSymbol = true
                this.warningSymbol = ''
            } else {
                this.checkSymbol = false
                this.warningSymbol = ' input-warn'
            }
        },
        onChangeDecimals () {
            if (this.decimals.length !== 0 && (this.decimals > 0 && this.decimals <= 18)) {
                this.checkDecimals = true
                this.warningDecimals = ''
            } else {
                this.checkDecimals = false
                this.warningDecimals = ' input-warn'
            }
        },
        async estimateGas () {
            const web3 = this.web3
            const chainConfig = this.config.blockchain
            if (this.account && web3) {
                const contractAbi = this.MyTRC21Mintable
                const contract = new web3.eth.Contract(
                    contractAbi.abi, null, { data: contractAbi.bytecode })
                const estimatedAmount = await contract.deploy({
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10),
                        (new BigNumber(0).multipliedBy(10 ** 18)).toString(10)
                    ]
                }).estimateGas()
                this.txFee = new BigNumber(estimatedAmount * chainConfig.deployPrice)
                    .div(10 ** 18).toNumber()
                if (this.balance.isLessThan(this.txFee)) {
                    this.isEnoughTOMO = false
                }
            }
        },
        editDecimals () {
            this.isEditDecimals = true
            this.decimals = ''
        }
    }
}
</script>
