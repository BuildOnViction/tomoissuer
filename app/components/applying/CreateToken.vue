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
                        placeholder="Please use only Latin letters and numbers, e.g. “Viction”"
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
                        Please use only Latin letters and numbers, e.g. Viction
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
                        placeholder="Please use only Latin letters and numbers, e.g. “VIC”"
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
                        Please use only Latin letters and numbers, e.g. “VIC”
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
                        <b-row class="mt-3 mt-md-0">
                            <b-col
                                cols="3"
                                md="4">
                                <b-form-radio
                                    value="vrc25"
                                    class="font-weight-bold">
                                    VRC25
                                    <i
                                        id="vrc25"
                                        class="tm-icon-info mb-2"/>
                                    <!-- <span class="new-gif">new</span> -->
                                    <b-tooltip
                                        target="vrc25">
                                        VRC25 is the standard token that goes along with Viction Zero Gas Protocol.
                                    </b-tooltip>
                                </b-form-radio>
                            </b-col>
                            <!-- <b-col
                                cols="3"
                                md="4">
                                <b-form-radio
                                    value="trc20"
                                    class="font-weight-bold">
                                    VRC20
                                    <i
                                        id="trc20"
                                        class="tm-icon-info mb-2"/>
                                    <b-tooltip
                                        target="trc20">
                                        VRC20 is the most standard token on Viction.
                                        Transaction fees are paid through the native VIC token.
                                    </b-tooltip>
                                </b-form-radio>
                            </b-col>
                            <b-col
                                cols="3"
                                md="4">
                                <b-form-radio
                                    value="trc21">
                                    VRC21
                                    <i
                                        id="trc21"
                                        class="tm-icon-info mb-2"/>
                                    <b-tooltip
                                        target="trc21">
                                        VRC21 is the standard token that goes along with Viction Zero Gas Protocol.
                                        Transaction fees are paid by the token itself.
                                    </b-tooltip>
                                </b-form-radio>
                            </b-col> -->
                            <!-- <b-col
                                cols="4"
                                md="3">
                                <div
                                    class="tokenInfotrc2021"
                                    @click="showModal">Differences?</div>
                            </b-col> -->
                        </b-row>
                    </b-form-radio-group>
                </b-form-group>
                <div class="form-group flex-box mb-4">
                    <label>Est. Issuance Fee</label><span>~{{ txFee }} VIC</span>
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
        <b-modal
            id="moreInfoModal"
            ref="moreInfoModal"
            centered
            scrollable
            size="md"
            hide-footer>
            <template
                #modal-header>
                <div class="mx-auto">
                    <h5>
                        More information on VRC20/VRC21
                    </h5>
                </div>
            </template>
            <div class="tomo-modal-default text-left token-warning tmp-table-tokenInfo">
                <div class="tomo_main_table">
                    <b-table
                        :items="tokenInfoItems"
                        :fields="tokenInfoFields"
                        striped>
                        <template
                            #cell(trc21)="data">
                            {{ typeof(data.value) === 'boolean' ? (data.value ? '&#10004;' : '&#10006;') : data.value }}
                        </template>
                        <template
                            #cell(trc20)="data">
                            {{ typeof(data.value) === 'boolean' ? (data.value ? '&#10004;' : '&#10006;') : data.value }}
                        </template>
                    </b-table>
                </div>
                <div class="btn-box mt-2">
                    <b-button
                        class="tmp-btn-blue"
                        @click="closeModal">Understand</b-button>
                </div>
            </div>
        </b-modal>
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
            type: 'vrc25',
            balance: 0,
            txFee: 0,
            gasPrice: 250000000,
            isEnoughTOMO: true,
            checkName: false,
            checkSymbol: false,
            checkSupply: false,
            checkDecimals: false,
            isEditDecimals: false,
            warningName: '',
            warningSymbol: '',
            warningDecimals: '',
            warningMintable: '',
            mintable: true,
            tokenInfoFields: [
                { key: 'title', label: '' },
                { key: 'trc20', label: 'TRC20' },
                { key: 'trc21', label: 'TRC21' }
            ],
            tokenInfoItems: [
                { title: 'Technical Requirements for Dapp Integration', trc20: 'Low', trc21: 'Moderate' },
                { title: 'Technical Requirements for Exchange Listing ', trc20: 'Low', trc21: 'Moderate' },
                // { title: 'VICP Compatibility', trc20: true, trc21: true },
                // { title: 'VICX Compatibility', trc20: false, trc21: true },
                { title: 'VICZ Compatibility', trc20: false, trc21: true },
                {
                    title: 'Transaction Fees',
                    trc20: 'Native VIC',
                    trc21: 'By the transaction token itself (no need for native VIC)'
                }
            ]
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
        this.estimateGas()
    },
    destroyed () { },
    created: async function () {
        this.account = store.get('address') ||
        this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        this.web3.eth.getGasPrice().then(result => {
            this.gasPrice = result
        }).catch(error => {
            console.log(error)
            this.$toasted.show('Cannot get gasPrice ' + error, { type: 'error' })
        })
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
        openTokenWarning () {
            this.$refs.moreInfoModal.show()
        },
        confirm () {
            this.$refs.moreInfoModal.hide()
            this.$router.push({ name: 'ConfirmToken',
                params: {
                    name: this.tokenName,
                    symbol: this.tokenSymbol,
                    decimals: this.decimals,
                    type: this.type,
                    totalSupply: this.totalSupply,
                    txFee: this.txFee,
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
        getAbi () {
            if (this.type === 'vrc25' && this.mintable) {
                return {
                    contractAbi: this.MyVRC25Mintable,
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10)
                    ]
                }
            }
            if (this.type === 'vrc25' && !this.mintable) {
                return {
                    contractAbi: this.MyVRC25,
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10)
                    ]
                }
            }
            if (this.type === 'trc20' && this.mintable) {
                return {
                    contractAbi: this.MyTRC20Mintable,
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10)
                    ]
                }
            }
            if (this.type === 'trc20' && !this.mintable) {
                return {
                    contractAbi: this.MyTRC20,
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10)
                    ]
                }
            }
            if (this.type === 'trc21' && this.mintable) {
                return {
                    contractAbi: this.MyTRC21Mintable,
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10),
                        (new BigNumber(0).multipliedBy(10 ** 18)).toString(10)
                    ]
                }
            }
            if (this.type === 'trc21' && !this.mintable) {
                return {
                    contractAbi: this.MyTRC21,
                    arguments: [
                        'example',
                        'example',
                        18,
                        (new BigNumber(100000000).multipliedBy(10 ** 18)).toString(10),
                        (new BigNumber(0).multipliedBy(10 ** 18)).toString(10)
                    ]
                }
            }
        },
        async estimateGas () {
            const web3 = this.web3
            if (this.account && web3) {
                const tokenAbi = this.getAbi()
                const contract = new web3.eth.Contract(
                    tokenAbi.contractAbi.abi, null, { data: tokenAbi.contractAbi.bytecode })
                const estimatedAmount = await contract.deploy({
                    arguments: tokenAbi.arguments
                }).estimateGas()
                this.txFee = new BigNumber(estimatedAmount * this.gasPrice)
                    .div(10 ** 18).toNumber()
                if (this.balance.isLessThan(this.txFee)) {
                    this.isEnoughTOMO = false
                }
            }
        },
        editDecimals () {
            this.isEditDecimals = true
            this.decimals = ''
        },
        showModal () {
            this.$refs.moreInfoModal.show()
        },
        closeModal () {
            this.$refs.moreInfoModal.hide()
        }
    }
}
</script>
