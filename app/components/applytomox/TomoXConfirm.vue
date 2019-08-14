<template>
    <div class="container container-small flex-content-center">
        <TomoXApplied
            v-if="isAppliedX"
            :address="address"/>
        <div
            v-else
            class="tomo-body-fullw tomo-apply">
            <div class="info-header text-center">
                <p><i class="tomoissuer-icon-tomox"/></p>
                <h2 class="tmp-title-large">Apply to TomoX protocol</h2>
            </div>
            <h6 class="tmp-title-normal weightbold mt-5">Condition</h6>
            <p>
                You need to pay
                <strong>100 TOMO</strong> as TomoX protocol listing fee
            </p>
            <b-form
                class="tmp-form-one">
                <b-form-group
                    class="mb-4"
                    label-for="newFee">
                    <span
                        class="txt-fixed"
                        style="clear">TOMO</span>
                    <b-form-input
                        v-model="txFee"
                        disabled
                        type="number"/>
                </b-form-group>
                <div class="btn-box">
                    <b-button
                        class="tmp-btn-boder-blue btn-min"
                        @click="back">
                        Back
                    </b-button>
                    <b-button
                        v-b-modal.applyTomoX
                        class="tmp-btn-blue">
                        Apply to TomoX protocol
                    </b-button>
                </div>
                <div
                    v-if="!isEnoughTOMO"
                    class="text-center text-danger mt-3">
                    <span>
                        Not enough TOMO</span>
                </div>
            </b-form>
            <b-modal
                id="applyTomoX"
                ref="applyTomoX"
                size="md"
                hide-header
                hide-footer
                no-close-on-esc
                no-close-on-backdrop
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
                            class="btn tmp-btn-boder-violet btn-secondary">Token detail
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
import store from 'store'
import BigNumber from 'bignumber.js'
import axios from 'axios'
import TomoXApplied from './TomoXApplied'
export default {
    name: 'TomoXConfirm',
    components: {
        TomoXApplied
    },
    mixins: [],
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            newFee: '',
            currentFee: '',
            txFee: 100,
            token: {},
            config: {},
            loading: false,
            transactionHash: '',
            balance: '',
            isEnoughTOMO: true,
            isAppliedX: false
        }
    },
    validations: {},
    async updated () {},
    destroyed () { },
    created: async function () {
        this.account = store.get('address') ||
            this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        this.config = store.get('configIssuer') || await self.appConfig()
        this.getBalance()
        await this.checkAppliedX()
    },
    methods: {
        async getData () {
            const self = this
            const vuexStore = self.$store.state
            if (vuexStore.token) {
                self.token = vuexStore.token
            } else {
                const { data } = await axios.get(`/api/token/${self.address}`)
                self.token = data
            }
        },
        getBalance () {
            const web3 = this.web3
            web3.eth.getBalance(this.account).then(result => {
                this.balance = new BigNumber(result).div(10 ** 18)
                if (this.balance.isLessThan(this.txFee)) {
                    this.isEnoughTOMO = false
                }
            }).catch(error => {
                console.log(error)
                this.$toatsed.show(error, { type: 'error' })
            })
        },
        getCurrentFee () {
            const web3 = this.web3
            if (this.account && web3) {
                // 0x24ec7590 is minFee function code
                let data = '0x24ec7590' +
                    '00000000000000000000000000000000000000000000000000000000'
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.currentFee = balance.div(10 ** this.token.decimals).toNumber()
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
        },
        back () {
            this.$router.go(-1)
        },
        async applyTomoX () {
            try {
                this.loading = true
                const tomoXContract = this.TomoXListing
                const chainConfig = this.config.blockchain
                const txParams = {
                    from: (await this.getAccount()).toLowerCase(),
                    value: this.web3.utils.toHex(
                        (new BigNumber(this.txFee).multipliedBy(1e+18)).toString(10)
                    ),
                    gasPrice: this.web3.utils.toHex(chainConfig.deployPrice),
                    gas: this.web3.utils.toHex(chainConfig.gas),
                    gasLimit: this.web3.utils.toHex(chainConfig.gas)
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
        async checkAppliedX () {
            const contract = this.TomoXListing
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
