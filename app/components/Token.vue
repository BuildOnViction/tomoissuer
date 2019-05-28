<template>
    <div class="container container--wide">
        <div class="card tomo-card tomo-card--token">
            <div class="tomo-card__header">
                <h2 class="tomo-card__headline">{{ tokenName }}&nbsp;</h2>
                <i
                    v-if="moreInfo"
                    class="fa fa-check-circle token-status"
                    aria-hidden="true"/>
                <h6 class="mb-0">{{ symbol }}</h6>
            </div>
            <div class="tomo-card__body">
                <b-row>
                    <b-col md="6">
                        <table
                            v-if="token"
                            class="tomo-card__table">
                            <tbody>
                                <tr>
                                    <td>Total Supply</td>
                                    <td>{{ formatNumber(token.totalSupplyNumber) }} {{ symbol }}</td>
                                </tr>
                                <tr>
                                    <td>Holders</td>
                                    <td>{{ formatNumber(holdersCount) }}
                                        {{ holdersCount > 1 ? 'addresses' : 'address' }}</td>
                                </tr>
                                <tr>
                                    <td>Transfers</td>
                                    <td>{{ formatNumber(tokenTxsCount) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                    <b-col md="6">
                        <table
                            v-if="token"
                            class="tomo-card__table">
                            <tbody>
                                <tr>
                                    <td>Contract</td>
                                    <td>
                                        {{ token.hash }}
                                    </td>
                                </tr>
                                <tr v-if="token.type === 'trc20'">
                                    <td>Decimal</td>
                                    <td>{{ token.decimals }}</td>
                                </tr>
                                <tr>
                                    <td>Type</td>
                                    <td>{{ token.type.toUpperCase() }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                </b-row>
            </div>
        </div>
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import axios from 'axios'

export default {
    name: 'App',
    components: {},
    mixins: [validationMixin],
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
            token: null,
            tokenName: null,
            symbol: null,
            tokenTxsCount: 0,
            holdersCount: 0,
            moreInfo: ''
        }
    },
    validations: {},
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        const self = this
        await self.getTokenDetail()
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
        }
    }
}
</script>
