<template>
    <div class="container container-small flex-content-center">
        <div class="confirm-table tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Deposit more?</h2>
            </div>
            <div class="tmp-table-three">
                <table>
                    <tr>
                        <td>From</td>
                        <td>
                            <b-link
                                :href="config.tomoscanUrl + '/address/' + account"
                                :title="account"
                                target="_blank">
                                {{ account }}
                            </b-link>
                            <span>Owner address</span>
                        </td>
                    </tr>
                    <tr>
                        <td>To</td>
                        <td>
                            <b-link
                                :href="config.tomoscanUrl + '/address/' + address"
                                :title="address"
                                target="_blank">
                                {{ address }}
                            </b-link>
                            <span>{{ token.name }} SmartContract</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Amount of donation</td>
                        <td>{{ depositFee }} TOMO</td>
                    </tr>
                    <tr>
                        <td>Transaction fee</td>
                        <td>1 {{ token.symbol }}/transaction</td>
                    </tr>
                </table>
                <p class="txt_note">*Your deposit amount will be locked and could not be withdrawed</p>
            </div>
            <div class="qr-code-donate text-center d-none">
                <p>
                    <b-img
                        src="/app/assets/images/img-qrcode-tomowallet.png"
                        alt="img-qrcode-tomowallet.png"/>
                </p>
                <p>
                    <b>Scan QR code below using TomoWallet to donate</b>
                </p>
            </div>
            <div class="btn-box">
                <b-button
                    :to="'/depositfee/' + address"
                    class="tmp-btn-boder-violet btn-min">
                    Back
                </b-button>
                <b-button
                    class="tmp-btn-violet"
                    @click="deposit">
                    Deposit now
                </b-button>
            </div>
            <b-modal
                id="modal-deposit"
                ref="poolingFeeModal"
                size="md"
                hide-header
                hide-footer
                centered>
                <div class="tomo-modal-default icon-violet">
                    <div class="msg-txt">
                        <i class="tomoissuer-icon-checkmark-outline"/>
                        <h4>Successful</h4>
                        <p>You’ve just successfully deposited {{ depositFee }} TOMO</p>
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
                        <b-button
                            :to="'/token/' + address"
                            class="tmp-btn-violet">
                            Token detail
                        </b-button>
                    </div>
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
import store from 'store'
import axios from 'axios'
import BigNumber from 'bignumber.js'
export default {
    name: 'TomoZConfirm',
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            account: '',
            transactionHash: '',
            depositFee: this.$route.params.depositFee,
            token: {},
            config: {},
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
        this.account = store.get('address') || await this.getAccount()
        this.appConfig().then(config => {
            this.config = config
        }).catch(error => {
            console.log(error)
            this.$toasted.show(error, { type: 'error' })
        })
        this.getData()
    },
    methods: {
        getData () {
            const self = this
            const vuexStore = self.$store.state
            if (vuexStore.token) {
                self.token = vuexStore.token
            } else {
                axios.get(`/api/token/${self.address}`).then(response => {
                    self.token = response.data
                }).catch(error => {
                    console.log(error)
                    self.$toasted.show(error, { type: 'error' })
                })
            }
        },
        async deposit () {
            try {
                if (this.depositFee) {
                    this.loading = true
                    const txParams = {
                        from: this.account,
                        gasPrice: this.web3.utils.toHex(10000000000000),
                        gas: this.web3.utils.toHex(40000000),
                        gasLimit: this.web3.utils.toHex(40000000),
                        value: this.web3.utils.toHex(new BigNumber(this.depositFee).multipliedBy(10 ** 18)).toString(10)
                    }

                    const contract = this.TRC21Issuer
                    const provider = this.NetworkProvider
                    if (provider === 'ledger' || provider === 'trezor') {
                        let data = await contract.methods.charge(
                            this.address
                        ).encodeABI()

                        const dataTx = {
                            data,
                            to: this.config.blockchain.issuerAddress
                        }
                        let nonce = await this.web3.eth.getTransactionCount(this.account)
                        Object.assign(
                            dataTx,
                            dataTx,
                            txParams,
                            {
                                nonce: this.web3.utils.toHex(nonce)
                            }
                        )
                        let signature = await this.signTransaction(dataTx)
                        const txHash = await this.sendSignedTransaction(dataTx, signature)
                        if (txHash) {
                            this.transactionHash = txHash
                            let check = true
                            while (check) {
                                const receipt = await this.web3.eth.getTransactionReceipt(txHash)
                                if (receipt) {
                                    self.loading = false
                                    check = false
                                    this.$refs.poolingFeeModal.show()
                                }
                            }
                        }
                    } else {
                        contract.methods.charge(
                            this.address
                        ).send(txParams)
                            .on('transactionHash', async (txHash) => {
                                this.transactionHash = txHash
                                let check = true
                                while (check) {
                                    const receipt = await this.web3.eth.getTransactionReceipt(txHash)
                                    if (receipt) {
                                        self.loading = false
                                        check = false
                                        this.$refs.poolingFeeModal.show()
                                    }
                                }
                            })
                    }
                }
            } catch (error) {
                console.log(error)
                this.loading = false
                this.$toasted.show(error, { type: 'error' })
            }
        }
    }
}
</script>
