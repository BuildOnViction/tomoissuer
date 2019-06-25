<template>
    <div class="container container-small">
        <div class="confirm-table">
            <div class="info-header text-center">
                <p><i class="tomoissuer-icon-tomoz"/></p>
                <h2 class="tmp-title-large">TomoZ Protocol Application</h2>
            </div>
            <div class="tmp-table-three">
                <table>
                    <tr>
                        <td>From</td>
                        <td>
                            <b-link
                                :title="account"
                                to="/">
                                {{ account }}
                            </b-link>
                            <span>Owner address</span>
                        </td>
                    </tr>
                    <tr>
                        <td>To</td>
                        <td>
                            <b-link
                                :title="address"
                                to="/">
                                {{ address }}
                            </b-link>
                            <span>{{ token.name }} SmartContract</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Amount of donation</td>
                        <td>{{ formatNumber(depositeFee) }} TOMO</td>
                    </tr>
                    <tr
                        v-if="tokenTxFee">
                        <td>Transaction fee</td>
                        <td>{{ tokenTxFee || 0 }} {{ token.symbol }}/transaction</td>
                    </tr>
                </table>
            </div>
            <div class="btn-box">
                <b-button
                    :to="'/tomozapplication/' + address"
                    class="tmp-btn-boder-violet btn-min">
                    Back
                </b-button>
                <b-button
                    class="tmp-btn-violet"
                    @click="applyTomoZ">
                    Apply to pay fee by token
                </b-button>
            </div>
            <b-modal
                ref="applyTomoZ"
                size="md"
                hide-header
                hide-footer
                centered>
                <div class="tomo-modal-default icon-violet">
                    <div class="msg-txt">
                        <i class="tomoissuer-icon-checkmark-outline"/>
                        <h4>Successful</h4>
                        <p>{{ token.name }} token successfully applied to TomoZ</p>
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
                            :to="{ path: `/token/${address}` }"
                            class="tmp-btn-violet">Token detail
                        </router-link>
                    </div>
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
import store from 'store'
import BigNumber from 'bignumber.js'
export default {
    name: 'TomoZConfirm',
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            token: this.$route.params.token,
            depositeFee: this.$route.params.depositFee,
            tokenTxFee: this.$route.params.tokenTxFee,
            config: {},
            transactionHash: ''
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
        self.account = store.get('address') || await self.getAccount()
        self.appConfig().then(result => {
            self.config = result
        }).catch(error => {
            console.log(error)
            self.$toasted.show(error, { type: 'error' })
        })
    },
    methods: {
        async applyTomoZ () {
            try {
                this.loading = true
                const contract = this.TRC21Issuer
                const txParams = {
                    from: (await this.getAccount()).toLowerCase(),
                    value: this.web3.utils.toHex(new BigNumber(this.depositeFee)
                        .multipliedBy(10 ** 18).toString(10)),
                    gasPrice: this.web3.utils.toHex(10000000000000),
                    gas: this.web3.utils.toHex(40000000),
                    gasLimit: this.web3.utils.toHex(40000000)
                }
                await contract.methods.apply(this.address).send(txParams)
                    .on('transactionHash', async (txHash) => {
                        this.transactionHash = txHash
                        self.loading = false
                        this.$refs.applyTomoZ.show()
                    })
            } catch (error) {
                this.loading = false
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            }
        }
    }
}
</script>
