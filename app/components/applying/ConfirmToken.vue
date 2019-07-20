<template>
    <div class="container container-small">
        <div class="confirm-table">
            <div class="info-header text-center">
                <p><i class="tomoissuer-icon-startup"/></p>
                <h2 class="tmp-title-large">{{ `${tokenName} (${tokenSymbol})` }}</h2>
            </div>
            <div class="tmp-table-three">
                <table>
                    <tr>
                        <td>Token supply</td>
                        <td>{{ formatNumber(totalSupply) }} {{ tokenSymbol }}</td>
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
                        <td>Issuance fee</td>
                        <td>~ {{ issueFee }} TOMO</td>
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
                        <i class="tomoissuer-icon-checkmark-outline"/>
                        <h4>Successful</h4>
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
            issueFee: this.$route.params.issueFee || '',
            minFee: 0,
            totalSupply: (this.$route.params.totalSupply || '').replace(/,/g, ''),
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
    beforeRouteEnter (to, from, next) {
        next()
    },
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
            self.config = store.get('config') || await self.appConfig()
            await self.createContract()
            self.getBalance()
        }
    },
    methods: {
        getBalance () {
            const web3 = this.web3
            web3.eth.getBalance(this.account).then(result => {
                this.balance = new BigNumber(result).div(10 ** 18)
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
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
                        type: self.type
                    }
                )
                if (tokenContract && tokenContract.data) {
                    // token source code
                    self.sourceCode = tokenContract.data.contractCode.toString()
                    self.$refs.code.codemirror = tokenContract.data.contractCode
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
                self.txFee = new BigNumber(chainConfig.gas * chainConfig.deployPrice).div(10 ** 18)
                if (self.balance.isLessThan(self.txFee)) {
                    self.loading = false
                    self.$toasted.show('Not enough TOMO', { type: 'error' })
                } else {
                    const compiledContract = await axios.post('/api/token/compileContract', {
                        name: self.tokenName,
                        sourceCode: self.sourceCode
                    })

                    const contract = new web3.eth.Contract(
                        compiledContract.data.abi, null, { data: '0x' + compiledContract.data.bytecode })

                    // deployment
                    switch (self.provider) {
                    case 'custom':
                    case 'metamask':
                    case 'tomowallet':
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
                            gas: web3.utils.toHex(chainConfig.gas),
                            gasPrice: web3.utils.toHex(chainConfig.deployPrice)
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
                                        self.$refs.newtokenmodal.show()
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
                                    self.loading = false
                                    check = false
                                    self.$refs.newtokenmodal.show()
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
                    error, { type : 'error' }
                )
            }
        }
    }
}
</script>
