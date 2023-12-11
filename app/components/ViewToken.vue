<template>
    <div :class="`container container-small ${sourceCode ? 'flex-content-center' : 'flex-content-between'}`">
        <div class="confirm-table tomo-body-fullw-issue issue-confirm">
            <b-link
                :to="'/token/' + address"
                class="d-flex align-items-center font-weight-bold mt-4 mb-4 text-dark">
                <b-icon-arrow-left
                    class="mr-3"
                    font-scale="1.5"/>BACK
            </b-link>
            <div class="info-header">
                <h2 class="tmp-title-large m-0">Token Information</h2>
                <p class="text-center mt-3">
                    <i
                        v-if="!logo"
                        class="tm-icon-startup"/>
                    <img
                        v-else
                        :src="logo"
                        class="review-logo">
                </p>
                <div class="text-center mb-5">
                    <strong>{{ `${formatNumber(token.totalSupply)} ${token.symbol}` }}</strong>
                </div>
                <!-- <h2 class="tmp-title-large">{{ `${formatNumber(totalSupply)} ${tokenSymbol}` }}</h2> -->
            </div>
            <div class="tmp-table-two grid-two issue-confirm">
                <table>
                    <tr v-if="isBridgeToken">
                        <td>Original contract</td>
                        <td>
                            <a
                                :href="tokenAddressURL"
                                target="_blank">
                                {{ truncate(tokenERC20Address, 34) }}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>Token name</td>
                        <td>{{ token.name }}</td>
                    </tr>
                    <tr>
                        <td>Token symbol</td>
                        <td>{{ token.symbol }}</td>
                    </tr>
                    <tr>
                        <td>Token supply</td>
                        <td>{{ formatNumber(token.totalSupply) }}</td>
                    </tr>
                    <tr>
                        <td>Decimal</td>
                        <td>{{ token.decimals }}</td>
                    </tr>
                    <tr>
                        <td>Type</td>
                        <td>{{ token.type.toUpperCase() }}</td>
                    </tr>
                    <tr>
                        <td>Reissuable</td>
                        <td>{{ token.mintable ? 'Yes' : 'No' }}</td>
                    </tr>
                    <tr>
                        <td >Code review</td>
                        <td/>
                    </tr>
                    <tr style="grid-template-columns: 100%;">
                        <td colspan="2">
                            <div
                                v-if="sourceCode">
                                <div class="pb-2 text-danger">Generated following Viction sourcecode,
                                if not your sourcecode, please ignore</div>
                                <codemirror
                                    ref="code"
                                    v-model="sourceCode"
                                    :options="{mode:'application/ld+json',styleActiveLine:false}"/>
                            </div>
                            <div v-else>
                                <span class="w-100 pb-2 text-danger">Source code is not verified</span>
                                <a
                                    :href="config.tomoscanUrl + '/address/' + token.address + '#code'"
                                    target="_blank">
                                    Verify code on Explorer
                                </a>
                            </div>

                        </td>
                        <td />
                    </tr>
                </table>
            </div>
        </div>
        <div
            :class="(loading ? 'tomo-loading' : '')"/>
    </div>
</template>

<script>
import axios from 'axios'
import store from 'store'
export default {
    name: 'App',
    components: { },
    mixins: [],
    data () {
        return {
            web3: this.web3,
            minFee: 0,
            sourceCode: '',
            provider: this.NetworkProvider,
            loading: false,
            txFee: 0,
            config: {},
            address: this.$route.params.address,
            token: {
                name: '',
                symbol: '',
                decimals: 0,
                totalSupply: 0,
                type: ''
            },
            logo: '',
            isBridgeToken: false,
            tokenERC20Address: '',
            tokenAddressURL: ''
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        const self = this
        self.config = store.get('configIssuer') || await self.appConfig()
        await self.getTokenDetail()
        await self.getLogo()
        await self.checkBridgeToken()
        if (self.token.type === 'trc21' || self.token.type === 'trc20') {
            await self.createContract()
        }
    },
    methods: {
        async createContract () {
            const self = this
            const token = self.token
            let tokenContract
            try {
                if (self.isBridgeToken) {
                    tokenContract = await axios.get(
                        '/api/token/getBridgeTokenContract'
                    )
                } else {
                    tokenContract = await axios.post(
                        '/api/token/createToken',
                        {
                            minFee: self.minFee,
                            name: token.name,
                            symbol: token.symbol,
                            decimals: token.decimals,
                            type: token.type,
                            mintable: token.mintable || false,
                            totalSupply: token.totalSupply
                        }
                    )
                }
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
        async getTokenDetail () {
            const self = this
            const { data } = await axios.get(`/api/account/${self.address}`)
            const token = data.tokenData
            if (token) {
                const { data : tokenData } = await axios.get(`/api/token/${self.address}`)
                self.token = {
                    address: tokenData.address,
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    decimals: tokenData.decimals,
                    type: tokenData.type || '',
                    mintable: tokenData.isMintable,
                    totalSupply: tokenData.totalSupplyNumber
                }
            }
            if (data.contractData && data.contractData.sourceCode) {
                const fileName = Object.keys(data.contractData.sourceCode)[0]
                self.sourceCode = data.contractData.sourceCode[fileName].content
            }
            self.contractCreation = data.contractCreation
        },
        async getLogo () {
            try {
                const { data } = await axios.get('/api/token/getLogo/' + this.address)
                if (data.image) {
                    this.logo = data.image
                }
            } catch (error) {
                console.log(error)
            }
        },
        async checkBridgeToken () {
            const self = this
            self.isBridgeToken = false
            return false
            // try {
            //     const contract = new this.web3.eth.Contract(
            //         this.TomoBridgeWrapToken.abi,
            //         this.address
            //     )
            //     await contract.methods.original_contract().call()
            //         .then(result => {
            //             self.isBridgeToken = (this.web3.utils.isAddress(result) || false)
            //             self.tokenERC20Address = result
            //             if (!result) {
            //                 self.isBridgeToken = false
            //                 return
            //             }
            //             self.tokenAddressURL = urljoin(
            //                 self.config.etherChain.etherScanURL,
            //                 'token',
            //                 result
            //             )
            //         })
            //         .catch(error => {
            //             console.log(error)
            //             self.isBridgeToken = false
            //         })
            // } catch (error) {
            //     console.log(error)
            // }
        }
    }
}
</script>
