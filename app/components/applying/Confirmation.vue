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
            sourceCode: '11',
            transactionHash: '',
            contractAddress: '',
            account: ''
        }
    },
    async updated () {
    },
    destroyed () { },
    created: async function () {
        const self = this
        console.log(this.web3)
        self.account = await self.getAccount()
        await self.createContract()
        // console.log(self.sourceCode)
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
                const compiledContract = await axios.post('/api/token/compileContract', {
                    name: self.tokenName,
                    sourceCode: self.sourceCode
                })

                const contract = new web3.eth.Contract(
                    compiledContract.data.abi, null, { data: '0x' + compiledContract.data.bytecode })
                console.log(typeof contract)
                if (self.NetworkProvider === 'ledger') {
                    const a = await self.appEth.getAddress(
                        store.get('hdDerivationPath')
                    )
                    console.log(a)
                    self.account = a.address
                }

                const result = await contract.deploy({
                    arguments: [
                        self.tokenName,
                        self.tokenSymbol,
                        self.decimals,
                        (new BigNumber(self.totalSupply).multipliedBy(1e+18)).toString(10),
                        (new BigNumber(1).multipliedBy(1e+18)).toString(10)
                    ]
                }).send({
                    from: self.account,
                    gas: web3.utils.toHex(40000000),
                    gasPrice: web3.utils.toHex(10000000000000)
                })
                // .on('error', (error) => {
                //     self.$toasted.show(
                //         error, { type : 'error' }
                //     )
                // })
                // .on('transactionHash', (txHash) => { self.txHash = txHash })
                // .then((newContractInstance) => {
                //     self.contractAddress = newContractInstance.options.address
                // }).catch(e => console.log())
                if (result) {
                    console.log('OK', result)
                    self.$toasted.show('Successfull')
                }
            } catch (error) {
                console.log(error)
                self.$toasted.show(
                    error, { type : 'error' }
                )
            }
        }
    }
}
</script>
