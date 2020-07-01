<template>
    <div :class="`container container-small ${sourceCode ? 'flex-content-center' : 'flex-content-between'}`">
        <div class="confirm-table tomo-body-fullw-issue issue-confirm">
            <div class="info-header">
                <h2 class="tmp-title-large m-0">Token Information</h2>
                <p class="text-center mt-5"><i class="tomoissuer-icon-startup"/></p>
                <div class="text-center mb-5">
                    <strong>{{ `${formatNumber(token.totalSupply)} ${token.symbol}` }}</strong>
                </div>
                <!-- <h2 class="tmp-title-large">{{ `${formatNumber(totalSupply)} ${tokenSymbol}` }}</h2> -->
            </div>
            <div class="tmp-table-two grid-two issue-confirm">
                <table>
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
                                v-if="token.type === 'trc21' || token.type === 'trc20'">
                                <div class="pb-2 text-danger">Generated following tomochain sourcecode,
                                if not your sourcecode, please ignore</div>
                                <codemirror
                                    ref="code"
                                    v-model="sourceCode"
                                    :options="{mode:'application/ld+json',styleActiveLine:false}"/>
                            </div>
                            <span
                                v-else
                                class="w-100">This is not TRC21 or TRC20 token</span>
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
            address: this.$route.params.address,
            token: {}
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        const self = this
        await self.getTokenDetail()
        if (self.token.type === 'trc21' || self.token.type === 'trc20') {
            await self.createContract()
        }
    },
    methods: {
        async createContract () {
            const self = this
            const token = self.token
            try {
                const tokenContract = await axios.post(
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
            const token = data.token
            self.token = {
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                type: token.type,
                mintable: token.isMintable,
                totalSupply: token.totalSupplyNumber
            }
            self.contractCreation = data.contractCreation
        }
    }
}
</script>
