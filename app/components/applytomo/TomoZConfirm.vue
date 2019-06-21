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
                        <td>100 TOMO</td>
                    </tr>
                    <tr>
                        <td>Transaction fee</td>
                        <td>1 TIIM/transaction</td>
                    </tr>
                </table>
            </div>
            <div class="btn-box">
                <b-button
                    class="tmp-btn-boder-violet btn-min"
                    to="/tomozapplication">
                    Back
                </b-button>
                <b-button
                    v-b-modal.modal-tomoz
                    class="tmp-btn-violet">
                    Apply to pay fee by token
                </b-button>
            </div>
            <b-modal
                id="modal-tomoz"
                size="md"
                hide-header
                hide-footer
                centered>
                <div class="tomo-modal-default icon-violet">
                    <div class="msg-txt">
                        <i class="tomoissuer-icon-checkmark-outline"/>
                        <h4>Successful</h4>
                        <p>TIIM token successfully applied to TomoZ</p>
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
                            @click="hide()">Token detail
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
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
    created: async function () {},
    methods: {}
}
</script>
