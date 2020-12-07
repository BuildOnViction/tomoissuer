<template>
    <div class="container container-small flex-content-center">
        <div class="confirm-table tomo-body-fullw">
            <div class="info-header">
                <h2 class="tmp-title-large">Change transaction fee?</h2>
            </div>
            <div class="tmp-table-three">
                <table>
                    <tr>
                        <td>Current fee</td>
                        <td>
                            {{ currentFee }} {{ token.symbol }}
                        </td>
                    </tr>
                    <tr>
                        <td>New fee</td>
                        <td>
                            {{ newFee }} {{ token.symbol }}
                        </td>
                    </tr>
                </table>
                <p class="txt_note">*Your change will be applied at the next block</p>
            </div>
            <div class="qr-code-donate text-center d-none">
                <p>
                    <b-img
                        src="/app/assets/images/img-qrcode-tomowallet.png"
                        alt="img-qrcode-tomowallet.png"/>
                </p>
                <p>
                    <b>Scan QR code below using TomoWallet to edit</b>
                </p>
            </div>
            <div class="btn-box">
                <b-button
                    :to="'/edittransactionsfee/' + address"
                    class="tmp-btn-boder-violet btn-min">
                    Back
                </b-button>
                <b-button
                    class="tmp-btn-violet"
                    @click="changeTXFee">
                    Change
                </b-button>
            </div>
            <b-modal
                ref="transactionsFeeModal"
                size="md"
                hide-header
                hide-footer
                centered
                no-close-on-esc
                no-close-on-backdrop>
                <div class="tomo-modal-default icon-violet">
                    <div class="msg-txt">
                        <i class="tm-icon-checkmark-outline"/>
                        <h3><b>Successful</b></h3>
                        <p>You changed the transacion fee</p>
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
                            class="tmp-btn-violet">Done
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
import axios from 'axios'
import BigNumber from 'bignumber.js'
export default {
    name: 'TomoZConfirm',
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            loading: false,
            account: '',
            newFee: this.$route.params.newFee,
            currentFee: this.$route.params.currentFee,
            token: {},
            transactionHash: '123',
            config: {},
            gasPrice: ''
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {
        this.account = (store.get('address') ||
            this.$store.state.address || await this.getAccount()).toLowerCase()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        if (!this.newFee) {
            this.$router.push({ path: '/edittransactionsfee/' + this.address })
        }
        this.config = store.get('configIssuer') || await this.appConfig()
        this.web3.eth.getGasPrice().then(result => {
            this.gasPrice = result
        }).catch(error => {
            console.log(error)
            this.$toasted.show('Cannot get gasPrice ' + error, { type: 'error' })
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
        async changeTXFee () {
            try {
                if (this.newFee) {
                    this.loading = true
                    this.account = await this.getAccount()
                    const chainConfig = this.config.blockchain
                    const txParams = {
                        from: this.account,
                        gasPrice: this.web3.utils.toHex(this.gasPrice),
                        gas: this.web3.utils.toHex(chainConfig.gas),
                        gasLimit: this.web3.utils.toHex(chainConfig.gas),
                        chainId: chainConfig.networkId
                    }
                    const { data } = await axios.get('/api/token/getABI')
                    if (!data.abi) {
                        this.loading = false
                        this.$toasted.show('This contract is not verified. Please go to tomoscan to verify contract')
                    } else {
                        const tokenContract = new this.web3.eth.Contract(
                            data.abi,
                            this.address
                        )
                        const provider = this.NetworkProvider
                        if (provider === 'ledger' || provider === 'trezor') {
                            txParams.value = this.web3.utils.toHex(0)

                            let data = await tokenContract.methods.setMinFee(
                                (new BigNumber(this.newFee).multipliedBy(10 ** this.token.decimals)).toString(10)
                            ).encodeABI()

                            const dataTx = {
                                data,
                                to: this.address
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
                                        this.$refs.transactionsFeeModal.show()
                                    }
                                }
                            }
                        } else {
                            tokenContract.methods.setMinFee(
                                (new BigNumber(this.newFee).multipliedBy(10 ** this.token.decimals)).toString(10)
                            ).send(txParams)
                                .on('transactionHash', async (txHash) => {
                                    this.transactionHash = txHash
                                    let check = true
                                    while (check) {
                                        const receipt = await this.web3.eth.getTransactionReceipt(txHash)
                                        if (receipt) {
                                            self.loading = false
                                            check = false
                                            this.$refs.transactionsFeeModal.show()
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
                }
                self.loading = false
            } catch (error) {
                console.log(error)
                this.loading = false
                this.$toasted.show(error.message ? error.message : error, { type: 'error' })
            }
        }
    }
}
</script>
