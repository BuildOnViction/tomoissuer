<template>
    <div class="container container-small">
        <div class="confirm-table">
            <div class="info-header text-center">
                <h2 class="tmp-title-large">Donate TRC-21 transaction fee</h2>
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
                                title="0x7e1e827c7c22834f31075b4530e9e0e2b7815ad8"
                                target="_blank">
                                {{ token.hash }}
                            </b-link>
                            <span>{{ token.name }} SmartContract</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Amount of donation</td>
                        <td>{{ formatNumber(donationAmount) }} TOMO</td>
                    </tr>
                    <tr>
                        <td>Transaction fee</td>
                        <td>{{ txFee }} {{ token.symbol }}</td>
                    </tr>
                </table>
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
                    :to="'/donateTxFee'"
                    class="tmp-btn-boder-blue btn-min">
                    Back
                </b-button>
                <b-button
                    class="tmp-btn-blue"
                    @click="deposit">
                    Donate now
                </b-button>
            </div>
            <b-modal
                id="modal-donate"
                ref="modaldonate"
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
                        <p>You’ve succesfully donated {{ donationAmount }} TOMO</p>
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
                            to="/"
                            class="btn tmp-btn-boder-blue btn-secondary">
                            Back to Homepage
                        </b-button>
                        <b-button
                            to="/donateTxFee"
                            class="tmp-btn-blue">
                            Another donation
                        </b-button>
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
import axios from 'axios'
import BigNumber from 'bignumber.js'
export default {
    name: 'App',
    components: { },
    data () {
        return {
            address: (this.$route.params.address || '').toLowerCase(),
            donationAmount: this.$route.params.donationAmount,
            web3: this.web3,
            transactionHash: '',
            account: '',
            provider: this.NetworkProvider,
            loading: false,
            config: {},
            token: {},
            gasPrice: '',
            txFee: ''
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

        self.config = store.get('configIssuer') || await self.appConfig()

        self.web3.eth.getGasPrice().then(result => {
            self.gasPrice = result
        }).catch(error => {
            console.log(error)
            self.$toasted.show('Cannot get gasPrice ' + error, { type: 'error' })
        })
        await self.getData()
        self.getTransactionFee()
    },
    methods: {
        async getData () {
            const { data } = await axios.get(`/api/token/${this.address}`)
            this.token = data
        },
        getTransactionFee () {
            const web3 = this.web3
            if (this.account && web3) {
                // 0x24ec7590 is minFee function code
                let data = '0x24ec7590' +
                    '00000000000000000000000000000000000000000000000000000000'
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.txFee = balance.div(10 ** this.token.decimals).toNumber()
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error.message ? error.message : error, { type: 'error' })
                })
            }
        },
        async deposit () {
            try {
                if (this.donationAmount) {
                    this.loading = true
                    this.account = await this.getAccount()
                    const chainConfig = this.config.blockchain
                    const txParams = {
                        from: this.account,
                        gasPrice: this.web3.utils.toHex(this.gasPrice),
                        gas: this.web3.utils.toHex(chainConfig.gas),
                        gasLimit: this.web3.utils.toHex(chainConfig.gas),
                        value: this.web3.utils.toHex(
                            new BigNumber(this.donationAmount).multipliedBy(10 ** 18)).toString(10)
                    }

                    const contract = this.TRC21Issuer
                    const provider = this.NetworkProvider
                    if (provider === 'ledger' || provider === 'trezor') {
                        let data = await contract.methods.charge(
                            this.address
                        ).encodeABI()

                        const dataTx = {
                            data,
                            to: chainConfig.issuerAddress
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
                                    this.$refs.modaldonate.show()
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
                                        this.$refs.modaldonate.show()
                                    }
                                }
                            })
                            .catch(error => {
                                console.log(error)
                                this.loading = false
                                this.$toasted.show(error.message ? error.message : error, { type: 'error' })
                            })
                    }
                }
            } catch (error) {
                console.log(error)
                this.loading = false
                this.$toasted.show(error.message ? error.message : error, { type: 'error' })
            }
        }
    }
}
</script>
