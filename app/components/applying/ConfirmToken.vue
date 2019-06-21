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
                        <td>100,000,000 TIIM</td>
                    </tr>
                    <tr>
                        <td>Decimal</td>
                        <td>6</td>
                    </tr>
                    <tr>
                        <td>Type</td>
                        <td>{{ type.toUpperCase() }}</td>
                    </tr>
                    <tr>
                        <td>Issue fee</td>
                        <td>5 TOMO</td>
                    </tr>
                    <tr>
                        <td>Code review</td>
                        <td>
                            <codemirror
                                ref="code"
                                v-model="sourceCode"
                                :options="{mode:'application/ld+json',styleActiveLine:false}"/>
                                <!-- 1.  name  TriipMiles string<br>
                                2.  totalTeamAllocated  0 uint256<br>
                                3.  totalSupply  500000000000000000000000000 uint256<br>
                                4.  TIIM_UNIT  1000000000000000000 uint256<br>
                                5.  decimals  18 uint256<br>
                                6.  endTime  1554051599 uint256<br>
                                7.  tiimEcosystemWallet  0x8a7A6E2BFc70E9AB0cC9eAeac542BE3D08f510cC address<br>
                                8.  teamTranchesReleased  0 uint256<br>
                                9.  teamWallet<br> -->
                        </td>
                    </tr>
                </table>
            </div>
            <div class="btn-box">
                <b-button
                    class="tmp-btn-boder-blue btn-min"
                    to="create">
                    Back
                </b-button>
                <b-button
                    v-b-modal.modal-newtoken
                    class="tmp-btn-blue">
                    Donate now
                </b-button>
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
            <b-modal
                id="modal-newtoken"
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
                            <b-link
                                to="/"
                                title="0x88448943534324230030030">
                                0x88448943534324230030030
                            </b-link>
                        </p>
                    </div>
                    <div class="btn-box">
                        <b-button
                            class="tmp-btn-blue"
                            to="/"
                            @click="hide()">View detail
                        </b-button>
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
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
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

                    const data = {
                        data: deploy,
                        to: '0x'
                    }

                    let nonce = await self.web3.eth.getTransactionCount(self.account)
                    const dataTx = {
                        from: self.account.toLowerCase(),
                        gas: web3.utils.toHex(40000000),
                        gasPrice: web3.utils.toHex(10000000000000),
                        gasLimit: web3.utils.toHex(40000000),
                        value: '0x',
                        chainId: self.chainConfig.networkId
                    }
                    Object.assign(
                        data,
                        dataTx,
                        {
                            nonce: web3.utils.toHex(nonce)
                        }
                    )

                    const signature = await self.signTransaction(data)
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
