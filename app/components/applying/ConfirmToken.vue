<template>
    <div class="container container-small flex-content-center">
        <div class="confirm-table tomo-body-fullw-issue issue-confirm">
            <div class="info-header">
                <h2 class="tmp-title-large m-0">Token Issuance Review</h2>
                <p class="text-center mt-5"><i class="tm-icon-startup"/></p>
                <div class="text-center mb-5">
                    <strong>{{ `${formatNumber(totalSupply)} ${tokenSymbol}` }}</strong>
                </div>
                <!-- <h2 class="tmp-title-large">{{ `${formatNumber(totalSupply)} ${tokenSymbol}` }}</h2> -->
            </div>
            <div class="tmp-table-two grid-two issue-confirm">
                <table>
                    <tr>
                        <td>Token name</td>
                        <td>{{ tokenName }}</td>
                    </tr>
                    <tr>
                        <td>Token symbol</td>
                        <td>{{ tokenSymbol }}</td>
                    </tr>
                    <tr>
                        <td>Token supply</td>
                        <td>{{ formatNumber(totalSupply) }}</td>
                    </tr>
                    <tr>
                        <td>Decimal</td>
                        <td>{{ decimals }}</td>
                    </tr>
                    <tr>
                        <td>Type</td>
                        <td>{{ type.toUpperCase() }}</td>
                    </tr>
                    <tr>
                        <td>Reissuable</td>
                        <td>{{ mintable ? 'Yes' : 'No' }}</td>
                    </tr>
                    <tr>
                        <td>Est. Issuance Fee</td>
                        <td>~{{ txFee }} TOMO</td>
                    </tr>
                    <tr>
                        <td >Code review</td>
                        <td/>
                    </tr>
                    <tr style="grid-template-columns: 100%;">
                        <td colspan="2">
                            <codemirror
                                ref="code"
                                v-model="sourceCode"
                                :options="{mode:'application/ld+json',styleActiveLine:false}"/>
                        </td>
                        <td />
                    </tr>
                </table>
            </div>
            <div class="btn-box">
                <b-button
                    class="tmp-btn-boder-blue btn-min"
                    to="createToken">
                    Back
                </b-button>
                <b-button
                    class="tmp-btn-blue"
                    @click="deploy">
                    Issue Token
                </b-button>
            </div>
            <b-modal
                ref="newtokenmodal"
                size="md"
                hide-header
                hide-footer
                centered
                no-close-on-esc
                no-close-on-backdrop>
                <div class="tomo-modal-default">
                    <div class="msg-txt">
                        <i class="tm-icon-checkmark-outline"/>
                        <h3><b>Successful</b></h3>
                        <p>Token successfully issued</p>
                        <p>
                            Transaction hash:
                            <a
                                :href="config.tomoscanUrl + '/txs/' +
                                transactionHash.toLowerCase()"
                                :title="transactionHash"
                                target="_blank">
                                {{ truncate(transactionHash, 26) }}
                            </a>
                        </p>
                    </div>
                    <div class="btn-box">
                        <router-link
                            :to="'token/' + contractAddress"
                            class="tmp-btn-blue">View detail
                        </router-link>
                    </div>
                </div>
            </b-modal>
        </div>
        <div
            :class="(loading ? 'tomo-loading' : '')"/>
    </div>
</template>

<script>
import axios from 'axios'
import BigNumber from 'bignumber.js'
import store from 'store'
export default {
    name: 'App',
    components: { },
    mixins: [],
    data () {
        return {
            web3: this.web3,
            tokenName: (this.$route.params.name || '').trim(),
            tokenSymbol: (this.$route.params.symbol || '').trim(),
            decimals: this.$route.params.decimals || '',
            minFee: 0,
            totalSupply: (this.$route.params.totalSupply || '').replace(/,/g, ''),
            mintable: this.$route.params.mintable,
            type: this.$route.params.type || '',
            sourceCode: 'Generating Contract...',
            transactionHash: '',
            contractAddress: '',
            account: '',
            provider: this.NetworkProvider,
            loading: false,
            config: {},
            gasPrice: 10000000000000,
            balance: 0,
            txFee: 0
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
        if (!self.tokenName || !self.tokenSymbol) {
            self.$router.push({ path: '/createToken' })
        } else {
            self.config = store.get('configIssuer') || await self.appConfig()
            // const chainConfig = self.config.blockchain
            await self.createContract()
            await self.getBalance()
            self.estimateFee()
            // self.txFee = new BigNumber(chainConfig.gas * chainConfig.deployPrice).div(10 ** 18)
        }
    },
    methods: {
        async getBalance () {
            try {
                const web3 = this.web3
                const result = await web3.eth.getBalance(this.account)
                this.balance = new BigNumber(result).div(10 ** 18)
            } catch (error) {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            }
        },
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
                        type: self.type,
                        mintable: this.mintable
                    }
                )
                if (tokenContract && tokenContract.data) {
                    // token source code
                    self.sourceCode = tokenContract.data.contractCode.toString()
                    // self.$refs.code.codemirror = tokenContract.data.contractCode
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
                const chainConfig = this.config.blockchain
                const web3 = self.web3
                self.loading = true
                self.account = await self.getAccount()
                if (self.balance.isLessThan(self.txFee)) {
                    self.loading = false
                    self.$toasted.show('Not enough TOMO', { type: 'error' })
                } else {
                    // const compiledContract = await axios.post('/api/token/compileContract', {
                    //     name: self.tokenName,
                    //     sourceCode: self.sourceCode,
                    //     mintable: this.mintable
                    // })
                    const compiledContract = self.mintable ? self.MyTRC21Mintable : self.MyTRC21

                    const contract = new web3.eth.Contract(
                        compiledContract.abi, null, { data: compiledContract.bytecode })

                    // deployment
                    switch (self.provider) {
                    case 'custom':
                    case 'metamask':
                    case 'tomowallet':
                    case 'pantograph':
                        const estimateGas = await contract.deploy({
                            arguments: [
                                self.tokenName,
                                self.tokenSymbol,
                                self.decimals,
                                (new BigNumber(self.totalSupply).multipliedBy(10 ** self.decimals)).toString(10),
                                (new BigNumber(self.minFee).multipliedBy(10 ** self.decimals)).toString(10)
                            ]
                        }).estimateGas()
                        await contract.deploy({
                            arguments: [
                                self.tokenName,
                                self.tokenSymbol,
                                self.decimals,
                                (new BigNumber(self.totalSupply).multipliedBy(10 ** self.decimals)).toString(10),
                                (new BigNumber(self.minFee).multipliedBy(10 ** self.decimals)).toString(10)
                            ]
                        }).send({
                            from: self.account,
                            gas: web3.utils.toHex(estimateGas),
                            gasPrice: web3.utils.toHex(chainConfig.deployPrice)
                        })
                            .on('transactionHash', async (txHash) => {
                                self.transactionHash = txHash
                                let check = true
                                while (check) {
                                    const receipt = await web3.eth.getTransactionReceipt(txHash)
                                    if (receipt) {
                                        self.contractAddress = receipt.contractAddress
                                        setTimeout(() => {
                                            self.loading = false
                                            check = false
                                            self.$refs.newtokenmodal.show()
                                        }, 1500)
                                    }
                                }
                            })
                        break
                    case 'ledger':
                    case 'trezor':
                        let deploy = await contract.deploy({
                            arguments: [
                                self.tokenName,
                                self.tokenSymbol,
                                self.decimals,
                                (new BigNumber(self.totalSupply).multipliedBy(1e+18)).toString(10),
                                (new BigNumber(self.minFee).multipliedBy(1e+18)).toString(10)
                            ]
                        }).encodeABI()

                        const data = {
                            data: deploy,
                            to: '0x'
                        }

                        let nonce = await web3.eth.getTransactionCount(self.account)
                        const dataTx = {
                            from: self.account,
                            gas: web3.utils.toHex(chainConfig.gas),
                            gasPrice: web3.utils.toHex(chainConfig.deployPrice),
                            gasLimit: web3.utils.toHex(chainConfig.gas),
                            value: web3.utils.toHex(0),
                            chainId: chainConfig.networkId
                        }
                        Object.assign(
                            data,
                            dataTx,
                            {
                                nonce: web3.utils.toHex(nonce)
                            }
                        )

                        const signature = await self.signTransaction(data)
                        const txHash = await self.sendSignedTransaction(data, signature)
                        if (txHash) {
                            self.transactionHash = txHash
                            let check = true
                            while (check) {
                                const receipt = await web3.eth.getTransactionReceipt(txHash)
                                if (receipt) {
                                    self.contractAddress = receipt.contractAddress
                                    setTimeout(() => {
                                        self.loading = false
                                        check = false
                                        self.$refs.newtokenmodal.show()
                                    }, 1500)
                                }
                            }
                        }
                        break
                    default:
                        break
                    }
                }
            } catch (error) {
                self.loading = false
                console.log(error)
                self.$toasted.show(
                    error.message ? error.message : error, { type : 'error' }
                )
            }
        },
        async estimateFee () {
            const web3 = this.web3
            const chainConfig = this.config.blockchain
            if (this.account && web3) {
                const contractAbi = this.MyTRC21Mintable
                const contract = new web3.eth.Contract(
                    contractAbi.abi, null, { data: contractAbi.bytecode })
                const estimatedAmount = await contract.deploy({
                    arguments: [
                        this.tokenName,
                        this.tokenSymbol,
                        this.decimals,
                        (new BigNumber(this.totalSupply).multipliedBy(10 ** 18)).toString(10),
                        (new BigNumber(0).multipliedBy(10 ** 18)).toString(10)
                    ]
                }).estimateGas()
                this.txFee = new BigNumber(estimatedAmount * chainConfig.deployPrice)
                    .div(10 ** 18).toNumber()
            }
        }
    }
}
</script>
