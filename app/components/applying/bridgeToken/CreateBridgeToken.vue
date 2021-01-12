<template>
    <div class="container container-small">
        <div class="newtoken">
            <h2 class="tmp-title-large">Wrap-ERC20 Token Issuance</h2>
            <p>Bring your ERC-20 token to TomoChain network.</p>
            <b-form
                class="form-new-token"
                novalidate
                @submit.prevent="validate()">
                <b-form-group
                    class="mb-4"
                    label-for="tokenAddress"
                    label="Token address">
                    <div class="d-flex">
                        <b-form-input
                            v-model="tokenAddress"
                            type="text"
                            autocomplete="off"
                            placeholder="Search ERC20 token"/>
                        <b-button
                            class="tmp-btn-search"
                            @click="searchToken"><b-icon icon="search" /></b-button>
                    </div>
                    <div
                        v-if="isTokenAddressEmpty"
                        class="text-danger pt-2">Required field</div>
                </b-form-group>
                <div
                    v-if="foundToken">
                    <div class="box-info-token">
                        <div class="form-group mb-3">
                            <label>Token name</label><span>{{ tokenName }}</span>
                        </div>
                        <div class="form-group mb-3">
                            <label>Symbol</label><span>{{ tokenSymbol }}</span>
                        </div>
                        <div class="form-group mb-3">
                            <label>Decimals</label><span>{{ decimals }}</span>
                        </div>
                        <div class="form-group mb-3">
                            <label>Est. Issuance Fee</label><span>~{{ issueFee }} TOMO</span>
                        </div>
                    </div>
                    <div
                        v-if="duplicateToken"
                        class="text-center text-danger">
                        <span>
                            This token has already been issued to TomoBridge</span>
                    </div>
                    <div class="btn-box">
                        <b-button
                            :disabled="duplicateToken"
                            class="tmp-btn-blue"
                            type="submit">Save & Review</b-button>
                    </div>
                    <div
                        v-if="!isEnoughTOMO"
                        class="text-center text-danger">
                        <span>
                            Your balance is not enough to pay the inssuance fee</span>
                    </div>
                </div>
            </b-form>
        </div>
        <div
            :class="(loading ? 'tomo-loading' : '')"/>
    </div>
</template>

<script>
import store from 'store'
import axios from 'axios'
import urljoin from 'url-join'
import { validationMixin } from 'vuelidate'
import {
    required
} from 'vuelidate/lib/validators'
import BigNumber from 'bignumber.js'
import Web3 from 'web3'
// import _get from 'lodash.get'

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
            issueFee: '',
            tokenAddress: '',
            foundToken: false,
            depositFee: '',
            isTokenAddressEmpty: false,
            // coingecko_id: '',
            duplicateToken: false,
            // minDeposit: 0,
            tokenPrice: 0,
            loading: false
        }
    },
    validations: {
        tokenAddress: { required }
    },
    computed: { },
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
            this.$router.push({ name: 'ConfirmBridgeToken',
                params: {
                    name: this.tokenName,
                    symbol: this.tokenSymbol,
                    decimals: this.decimals,
                    type: this.type,
                    totalSupply: this.totalSupply,
                    issueFee: this.issueFee,
                    tokenAddress: this.tokenAddress
                }
            })
        },
        async searchToken () {
            try {
                if (!this.tokenAddress) {
                    this.isTokenAddressEmpty = true
                } else {
                    this.loading = true
                    this.foundToken = false
                    this.isTokenAddressEmpty = false
                    const config = this.config
                    const { data } = await axios.get(
                        urljoin(config.etherscanAPI,
                            `api?module=contract&action=getabi&address=${this.tokenAddress}`)
                    )

                    // const data = { status: '1' }
                    if (data.status === '1') {
                        const ethWeb3 = new Web3(new Web3.providers.HttpProvider(config.etherChain.rpc))
                        let contract = new ethWeb3.eth.Contract(
                            JSON.parse(data.result),
                            this.tokenAddress
                        )
                        // In case etherscan cannot find contract
                        if (!contract.methods.name) {
                            contract = new ethWeb3.eth.Contract(
                                this.ERC20.abi,
                                this.tokenAddress
                            )
                        }
                        this.tokenName = this.checkTokenName(await contract.methods.name.call())
                        this.tokenSymbol = this.checkTokenName(await contract.methods.symbol.call())
                        // contract.methods.name.call().then(name => {
                        //     this.tokenName = this.checkTokenName(name)
                        // }).catch(error => error)
                        // contract.methods.symbol.call().then(symbol => {
                        //     this.tokenSymbol = this.checkTokenName(symbol)
                        // }).catch(error => error)
                        contract.methods.decimals.call().then(decimals => {
                            this.decimals = new BigNumber(decimals).toNumber()
                        }).catch(error => error)

                        await this.checkDuplicate(this.tokenName, this.tokenSymbol)

                        const contractBridge = new this.web3.eth.Contract(
                            this.TomoBridgeWrapToken.abi, null, { data: this.TomoBridgeWrapToken.bytecode })
                        contractBridge.deploy({
                            arguments: [
                                config.blockchain.bridgeTokenOwners,
                                config.blockchain.defaultRequired,
                                'BridgeToken', 'BTK', 18, 0, 0,
                                [0, 0], // deposit fee and withdraw fee
                                this.tokenAddress,
                                'ETH' // hardcode for ethereum network
                            ]
                        }).estimateGas().then((gas) => {
                            this.issueFee = new BigNumber(gas * config.blockchain.deployPrice)
                                .div(10 ** 18).toNumber()
                            if (this.balance.isLessThan(this.issueFee)) {
                                this.isEnoughTOMO = false
                            }
                            this.issueFee = this.issueFee.toFixed(4)
                        })
                            .catch(error => error)
                        this.foundToken = true
                        this.loading = false
                    } else {
                        this.loading = false
                        this.$toasted.show(
                            'Etherscan error: ' + data.result,
                            { type: 'error' }
                        )
                    }
                }
            } catch (error) {
                console.log(error)
                this.loading = false
                this.$toasted.show(
                    'Cannot find token. Make sure token address is corrected',
                    { type: 'error' }
                )
            }
        },
        async checkDuplicate (name, symbol) {
            try {
                const { data } = await axios.get(
                    urljoin(
                        '/api/token/getToken?token=' + this.tokenAddress,
                        '&name=' + name,
                        '&symbol=' + symbol
                    )
                )
                this.duplicateToken = data.status
            } catch (error) {
                this.$toasted.show(error, { type: 'error' })
            }
        },
        checkTokenName (name) {
            if (name.indexOf('0x') === 0) {
                const a = this.web3.utils.hexToUtf8(name)
                return a.trim()
            }

            return name
        }
    }
}
</script>
