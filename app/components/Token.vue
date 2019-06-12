<template>
    <div class="container container-tomochain">
        <div class="main-box-header">
            <div class="">
                <h2 class="tmp-title-large">TIIM</h2>
                <i
                    v-if="moreInfo"
                    class="fa fa-check-circle token-status"
                    aria-hidden="true"/>
                <b-row>
                    ds
                </b-row>
            </div>
        </div><!-- main-box-header -->
        <div class="main-box-body">
            body
        </div>
        <!-- main-box-header -->
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { required, minValue } from 'vuelidate/lib/validators'

export default {
    name: 'App',
    components: {},
    mixins: [validationMixin],
    data () {
        return {
            web3: this.web3,
            address: this.$route.params.address.toLowerCase(),
            token: null,
            tokenName: null,
            symbol: null,
            tokenTxsCount: 0,
            holdersCount: 0,
            moreInfo: '',
            loading: false,
            depositeAmount: '',
            isApplied: false,
            transactionHash: ''
        }
    },
    validations: {
        depositeAmount: {
            required,
            minValue: minValue(10)
        }
    },
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        try {
            const self = this
            self.getTokenDetail()
            self.checkApplied()
        } catch (error) {
            console.log(error)
            this.$toasted.show(error, { type :'error' })
        }
    },
    mounted () {},
    methods: {
        async getTokenDetail () {
            const self = this
            const { data } = await axios.get(`/api/token/${self.address}`)
            self.token = data
            self.tokenName = data.name
            self.symbol = data.symbol
            self.tokenTxsCount = data.tokenTxs
            self.holdersCount = data.tokenHolders
        },
        async applyToken () {
            try {
                this.loading = true
                const contract = await this.getTRC21IssuerInstance()
                const txParams = {
                    from: (await this.getAccount()).toLowerCase(),
                    value: this.web3.utils.toHex(new BigNumber(this.depositeAmount)
                        .multipliedBy(10 ** 18).toString(10)),
                    gasPrice: this.web3.utils.toHex(10000000000000),
                    gas: this.web3.utils.toHex(40000000),
                    gasLimit: this.web3.utils.toHex(40000000)
                }
                const result = await contract.apply(this.address, txParams)
                this.transactionHash = result.tx
                this.loading = false
            } catch (error) {
                this.loading = false
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            }
        },
        async checkApplied () {
            const contract = await this.getTRC21IssuerInstance()
            const result = await contract.tokens()
            if (result && result.length > 0) {
                const lowerCaseArr = result.map(m => m.toLowerCase())
                if (lowerCaseArr.indexOf(this.address) > -1) {
                    this.isApplied = true
                }
            }
        },
        validate () {
            this.$v.$touch()

            if (!this.$v.$invalid) {
                this.applyToken()
            }
        }
    }
}
</script>
