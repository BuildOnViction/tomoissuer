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
                            0.0001 TIIM
                        </td>
                    </tr>
                    <tr>
                        <td>New fee</td>
                        <td>
                            0.0002 TIIM
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
                    class="tmp-btn-boder-violet btn-min"
                    to="/edittransactionsfee">
                    Back
                </b-button>
                <b-button
                    v-b-modal.modal-transactionsfee
                    class="tmp-btn-violet">
                    Change
                </b-button>
            </div>
            <b-modal
                id="modal-transactionsfee"
                size="md"
                hide-header
                hide-footer
                centered>
                <div class="tomo-modal-default icon-violet">
                    <div class="msg-txt">
                        <i class="tomoissuer-icon-checkmark-outline"/>
                        <h4>Successful</h4>
                        <p>You changed the transacion fee</p>
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
                            class="tmp-btn-violet"
                            to="/"
                            @click="hide()">Done
                        </b-button>
                    </div>
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TomoZConfirm',
    data () {
        return {
            tokenName: '',
            tokenSymbol: '',
            decimals: '',
            minFee: '',
            tokenSupply: '',
            sourceCode: '',
            account: '',
            type: ''
        }
    },
    async updated () {},
    destroyed () { },
    created: async function () {},
    methods: {}
}
</script>
