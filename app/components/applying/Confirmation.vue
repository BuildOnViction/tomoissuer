<template>
    <div class="container">
        <div
            v-if="account"
            style="text-align: center; padding-top: 1em;padding-bottom: 1em;">
            Welcome {{ account }}
        </div>
        <codemirror
            ref="code"
            v-model="sourceCode"
            :options="{mode:'application/ld+json',styleActiveLine:false}"/>
        <div class="buttons text-right">
            <b-button
                variant="primary"
                @click="deploy">Create</b-button>
        </div>
        <div
            v-if="loading"
            class="mt-5">loading.....</div>
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
            <b-form-group
                v-if="contractAddress"
                class="mb-4"
                label="Contract Address"
                label-for="contractAddress">
                <b-form-input
                    v-model="contractAddress"
                    type="text" />
            </b-form-group>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import BigNumber from 'bignumber.js'
import store from 'store'
export default {
    name: 'App',
    components: { },
    data () {
        return {
            web3: this.web3,
            tokenName: this.$route.query.name,
            tokenSymbol: this.$route.query.symbol,
            decimals: this.$route.query.decimals,
            minFee: this.$route.query.minFee,
            totalSupply: this.$route.query.totalSupply,
            type: this.$route.query.type,
            sourceCode: 'Generating Contract...',
            transactionHash: '',
            contractAddress: '',
            account: '',
            provider: this.NetworkProvider,
            loading: false
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        const self = this
        self.account = await self.getAccount()
        const config = await self.appConfig()
        self.chainConfig = config.blockchain
        await self.createContract()
    },
    methods: {
        async createContract () {
            const self = this
            try {
                const tokenContract = await axios.post(
                    '/api/token/createToken',
                    {
                        name: self.tokenName,
                        symbol: self.tokenSymbol,
                        decimals: self.decimals,
                        totalSupply: self.totalSupply,
                        minFee: self.minFee,
                        type: self.type
                    }
                )
                if (tokenContract && tokenContract.data) {
                    // token source code
                    self.sourceCode = tokenContract.data.contractCode.toString()
                    self.$refs.code.codemirror = tokenContract.data.contractCode
                    // push to confirmation page
                }
            } catch (error) {
                self.$toasted.show(
                    error, { type: 'error' }
                )
            }
        },
        async deploy () {
            const self = this
            try {
                const web3 = self.web3
                self.loading = true
                self.account = await self.getAccount()
                const compiledContract = await axios.post('/api/token/compileContract', {
                    name: self.tokenName,
                    sourceCode: self.sourceCode
                })

                const contract = new web3.eth.Contract(
                    compiledContract.data.abi, null, { data: '0x' + compiledContract.data.bytecode })
                if (self.provider === 'ledger') {
                    const a = await self.appEth.getAddress(
                        store.get('hdDerivationPath')
                    )
                    self.account = a.address
                }
                // deployment
                let result
                switch (self.provider) {
                case 'custom':
                case 'metamask':
                    await contract.deploy({
                        arguments: [
                            self.tokenName,
                            self.tokenSymbol,
                            self.decimals,
                            (new BigNumber(self.totalSupply).multipliedBy(1e+18)).toString(10),
                            (new BigNumber(1).multipliedBy(1e+18)).toString(10)
                        ]
                    }).send({
                        from: self.account.toLowerCase(),
                        gas: web3.utils.toHex(40000000),
                        gasPrice: web3.utils.toHex(10000000000000)
                    })
                        .on('transactionHash', async (txHash) => {
                            self.transactionHash = txHash
                            let check = true
                            while (check) {
                                const receipt = await web3.eth.getTransactionReceipt(txHash)
                                if (receipt) {
                                    self.contractAddress = receipt.contractAddress
                                    self.loading = false
                                    check = false
                                }
                            }
                        })
                    break
                case 'ledger':
                case 'trezor':
                    const deploy = await contract.deploy({
                        arguments: [
                            self.tokenName,
                            self.tokenSymbol,
                            self.decimals,
                            (new BigNumber(self.totalSupply).multipliedBy(1e+18)).toString(10),
                            (new BigNumber(self.minFee).multipliedBy(1e+18)).toString(10)
                        ]
                    }).encodeABI()

                    let nonce = await self.web3.eth.getTransactionCount(self.account)
                    const dataTx = {
                        from: self.account,
                        gasPrice: web3.utils.toHex(10000000000000),
                        gasLimit: web3.utils.toHex(40000000),
                        data: deploy,
                        chainId: self.chainConfig.networkId,
                        nonce: web3.utils.toHex(nonce),
                        to: '0x',
                        value: '0x'
                    }
                    const signature = await self.signTransaction(dataTx)
                    result = await self.sendSignedTransaction(dataTx, signature)
                    if (result && result.contractAddress) {
                        self.transactionHash = result.transactionHash
                        self.contractAddress = result.contractAddress
                    }
                    break
                default:
                    break
                }
                if (self.transactionHash && self.contractAddress) {
                    self.$toasted.show('Successfull')
                    self.loading = false
                }
            } catch (error) {
                self.loading = false
                console.log(error)
                self.$toasted.show(
                    error, { type : 'error' }
                )
            }
        }
    }
}
</script>
