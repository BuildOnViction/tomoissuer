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
                                to="/"
                                title="0x48c4eef517b79ff5259374fed4245359d8fb3ea9">
                                0x48c4eef517b79ff5259374fed4245359d8fb3ea9
                            </b-link>
                            <span>Owner address</span>
                        </td>
                    </tr>
                    <tr>
                        <td>To</td>
                        <td>
                            <b-link
                                to="/"
                                title="0x7e1e827c7c22834f31075b4530e9e0e2b7815ad8">
                                0x7e1e827c7c22834f31075b4530e9e0e2b7815ad8
                            </b-link>
                            <span>TIIM SmartContract</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Amount of donation</td>
                        <td>500 TOMO</td>
                    </tr>
                    <tr>
                        <td>Transaction fee</td>
                        <td>0.0001 TOMO</td>
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
                    class="tmp-btn-boder-blue btn-min"
                    to="donate">
                    Back
                </b-button>
                <b-button
                    v-b-modal.modal-donate
                    class="tmp-btn-blue">
                    Donate now
                </b-button>
            </div>
            <b-modal
                id="modal-donate"
                size="md"
                hide-header
                hide-footer
                centered>
                <div class="tomo-modal-default">
                    <div class="msg-txt">
                        <i class="tomoissuer-icon-checkmark-outline"/>
                        <h4>Successful</h4>
                        <p>You’ve succesfully donated 500 TOMO</p>
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
import store from 'store'
export default {
    name: 'App',
    components: { },
    data () {
        return {
            web3: this.web3,
            transactionHash: '',
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
    },
    methods: {
    }
}
</script>
