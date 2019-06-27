<template>
    <div class="container container-small">
        <div class="confirm-table">
            <div class="info-header text-center">
                <p><i class="tomoissuer-icon-startup"/></p>
                <h2 class="tmp-title-large">{{ formatCurrencySymbol(formatNumber(totalSupply), tokenSymbol) }}</h2>
            </div>
            <div class="tmp-table-three">
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
                        <td>Issue fee</td>
                        <td>50 TOMO</td>
                    </tr>
                    <tr>
                        <td>Code review</td>
                        <td>
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
            <b-modal
                ref="newtokenmodal"
                size="md"
                hide-header
                hide-footer
                centered>
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
            tokenName: this.$route.params.name,
            tokenSymbol: this.$route.params.symbol,
            decimals: this.$route.params.decimals,
            minFee: 0,
            totalSupply: this.$route.params.totalSupply,
            type: this.$route.params.type || '',
            sourceCode: 'Generating Contract...',
            transactionHash: '',
            contractAddress: '',
            account: '',
            provider: this.NetworkProvider,
            loading: false,
            config: {},
            gasPrice: ''
        }
    },
    async updated () {},
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
    created: async function () {
        const self = this

        self.web3.eth.getGasPrice().then(result => {
            self.gasPrice = result
        }).catch(error => {
            console.log(error)
            self.$toasted.show(error, { type: 'error' })
        })

        self.appConfig().then(result => {
            self.config = result
        }).catch(error => {
            console.log(error)
            self.$toasted.show(error, { type: 'error' })
        })
        self.account = store.get('address') || await self.getAccount()
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
                const chainConfig = this.config.blockchain
                const web3 = self.web3
                self.loading = true
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
                    await contract.deploy({
                        arguments: [
                            self.tokenName,
                            self.tokenSymbol,
                            self.decimals,
                            (new BigNumber(self.totalSupply).multipliedBy(1e+18)).toString(10),
                            (new BigNumber(self.minFee).multipliedBy(1e+18)).toString(10)
                        ]
                    }).send({
                        from: self.account,
                        gas: web3.utils.toHex(chainConfig.gas),
                        gasPrice: web3.utils.toHex(self.gasPrice)
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
                        gasPrice: web3.utils.toHex(self.gasPrice),
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
                    if (this.NetworkProvider === 'ledger') {
                        // delete data.from
                    }
                    console.log(data)

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
