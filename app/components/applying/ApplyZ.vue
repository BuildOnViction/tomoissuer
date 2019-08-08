<template>
    <div class="container">
        <div
            v-if="isAppliedZ"
            class="mt-3"><b>This token is already applied to tomoZ</b></div>
        <div
            v-if="isAppliedX"
            class="mt-3"><b>This token is already applied to tomoX</b></div>
        <div
            v-if="!isAppliedZ">
            <b-form-group
                id="deposite"
                label="Deposite"
                label-for="deposite">
                <b-form-input
                    id="deposite"
                    v-model="depositeAmount" />
            </b-form-group>
            <b-button
                variant="primary"
                @click="applyTomoZ">ApplyZ</b-button>
        </div>
        <div
            v-if="!isAppliedX"
            class="mt-3">
            Apply tomoX<br>
            <b-button
                variant="primary"
                @click="applyTomoX">ApplyX</b-button>
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
</template>

<script>
import BigNumber from 'bignumber.js'
import axios from 'axios'
import store from 'store'
export default {
    name: 'App',
    components: {
    },
    mixins: [],
    data () {
        return {
            depositeAmount: '',
            address: this.$route.params.address.toLowerCase(),
            isAppliedZ: false,
            isAppliedX: false,
            transactionHash: '',
            loading: false,
            txFee: '',
            issuerContract: this.TRC21Issuer,
            tomoXContract: this.TomoXListing,
            config: {},
            token: {}
        }
    },
    validations: {},
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        this.config = store.get('configIssuer') || await this.appConfig()
        await this.getData()
        await this.checkAppliedX()
        await this.checkAppliedZ()
    },
    mounted () {},
    methods: {
        async getData () {
            const self = this
            const { data } = await axios.get(`/api/token/${self.address}`)
            self.token = data
        },
        async applyTomoZ () {
            try {
                this.loading = true
                const contract = this.issuerContract
                const txParams = {
                    from: (await this.getAccount()).toLowerCase(),
                    value: this.web3.utils.toHex(new BigNumber(this.depositeAmount)
                        .multipliedBy(10 ** 18).toString(10)),
                    gasPrice: this.web3.utils.toHex(10000000000000),
                    gas: this.web3.utils.toHex(20000000),
                    gasLimit: this.web3.utils.toHex(20000000)
                }
                await contract.methods.apply(this.address).send(txParams)
                    .on('transactionHash', async (txHash) => {
                        let check = true
                        while (check) {
                            const receipt = await this.web3.eth.getTransactionReceipt(txHash)
                            if (receipt) {
                                this.transactionHash = txHash
                                this.isAppliedZ = true
                                this.loading = false
                                check = false
                            }
                        }
                    })
            } catch (error) {
                this.loading = false
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            }
        },
        async applyTomoX () {
            try {
                this.loading = true
                const tomoXContract = this.tomoXContract
                const txParams = {
                    from: (await this.getAccount()).toLowerCase(),
                    value: this.web3.utils.toHex(),
                    gasPrice: this.web3.utils.toHex(10000000000000),
                    gas: this.web3.utils.toHex(20000000),
                    gasLimit: this.web3.utils.toHex(20000000)
                }

                await tomoXContract.methods.apply(this.address).send(txParams)
                    .on('transactionHash', async (txHash) => {
                        let check = true
                        while (check) {
                            const receipt = await this.web3.eth.getTransactionReceipt(txHash)
                            if (receipt) {
                                check = false
                                this.transactionHash = txHash
                                this.isAppliedX = true
                                this.loading = false
                                if (this.isAppliedX && this.transactionHash !== '') {
                                    // announce tomo relayer
                                    axios.post('/api/token/announceRelayer', {
                                        tokenName: this.token.name,
                                        tokenSymbol: this.token.symbol,
                                        totalSupply: this.token.totalSupplyNumber,
                                        address: this.token.hash
                                    }).then(response => console.log('OK'))
                                        .catch(error => console.log(error))
                                }
                            }
                        }
                    })
            } catch (error) {
                this.loading = false
                console.log(error)
            }
        },
        async checkAppliedZ () {
            const contract = this.TRC21Issuer
            if (contract) {
                const result = await contract.methods.tokens().call()
                if (result && result.length > 0) {
                    const lowerCaseArr = result.map(m => m.toLowerCase())
                    if (lowerCaseArr.indexOf(this.address) > -1) {
                        this.isAppliedZ = true
                    }
                }
            }
        },
        async checkAppliedX () {
            const contract = this.tomoXContract
            if (contract) {
                const result = await contract.methods.tokens().call()
                if (result && result.length > 0) {
                    const lowerCaseArr = result.map(m => m.toLowerCase())
                    if (lowerCaseArr.indexOf(this.address) > -1) {
                        this.isAppliedX = true
                    }
                }
            }
        }
    }
}
</script>
