<template>
    <div
        v-if="listokenItems.length <= 0"
        class="container container-medium flex-content-center">
        <div class="tomo-body-fullw text-center">
            <p>
                <b-img
                    src="/app/assets/images/issuer-not-item.png"
                    alt="issuer-not-item.png"/>
            </p>
            <p class="tmp-mgt-three">
                It looks like there are no tokens here.<br>
                Maybe you would like to
                <b-link
                    to="/create">
                    issue a new one
                </b-link>
            </p>
        </div>
    </div>
    <div
        v-else
        class="container">
        <h2 class="tmp-title-large">Issue token</h2>
        <div class="tmp-table-one">
            <b-tab
                title="Transfer"
                active>
                <template>
                    <div class="tomo_main_table colum-8">
                        <b-table
                            id="transfer_table"
                            :per-page="listokenPerPage"
                            :current-page="listokenCurrentPage"
                            :fields="listokenFields"
                            :items="listokenItems"
                            stacked="lg">
                            <template
                                slot="token"
                                slot-scope="data">
                                <a
                                    :href="`token/0x2f8fa62a62410febc56c96c3ceb8666e193a1be3`"
                                    :title="data.value">
                                    {{ data.value }}
                                </a>
                            </template>
                            <template
                                slot="age"
                                slot-scope="data">
                                {{ data.item.age }} mins ago
                            </template>
                            <template
                                slot="transfertoken"
                                slot-scope="data">
                                <a
                                    :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`"
                                    :title="data.value">
                                    {{ data.value }}
                                </a>
                            </template>
                            <template
                                slot="applytomoz"
                                slot-scope="data">
                                <a
                                    :href="`/tomozcondition`"
                                    :title="data.value">
                                    {{ data.value }}
                                </a>
                            </template>
                        </b-table>
                    </div>
                </template>
                <div class="mt-3 common_tmp_page">
                    <b-pagination
                        v-model="listokenCurrentPage"
                        :total-rows="listokenRows"
                        :per-page="listokenPerPage"
                        aria-controls="transfer_table"
                        align="center"/>
                </div>
            </b-tab>
        </div>
        <!-- /tmp-table-one -->
    </div>
</template>

<script>
import axios from 'axios'
import store from 'store'
export default {
    name: 'App',
    components: { },
    data () {
        return {
            listokenCurrentPage: 1,
            listokenRows: 10,
            listokenPerPage: 7,
            listokenFields: [
                { key: 'token', label: 'Token' },
                { key: 'price', label: 'Price' },
                { key: 'volume', label: 'Volume 24h' },
                { key: 'totalsupply', label: 'Total supply' },
                { key: 'overbalance', label: 'Over balance' },
                { key: 'holders', label: 'Holders' },
                { key: 'transfertoken', label: '', variant: 'sp-text-center' },
                { key: 'applytomoz', label: '', variant: 'sp-text-center' }
            ],
            listokenItems: [
                {
                    token: 'TIIM (Triip Protocol)',
                    price: 40,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '54354',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'TIMES (USA Invesment)',
                    price: 21,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'DAS (My Reload)',
                    price: 89,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 40,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 29,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 40,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 21,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 89,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 40,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                },
                {
                    token: 'NIKO (NIKEN Company)',
                    price: 29,
                    volume: '43443',
                    totalsupply: '3424',
                    overbalance: '43443',
                    holders: '92',
                    transfertoken: 'Transfer token',
                    applytomoz: 'Apply TomoZ'
                }
            ],
            address: store.get('address'),
            fields: [
                {
                    key: 'hash',
                    label: 'Hash'
                },
                {
                    key: 'name',
                    label: 'Name'
                },
                {
                    key: 'symbol',
                    label: 'Symbol'
                },
                {
                    key: 'totalSupplyNumber',
                    label: 'Total Supply'
                },
                {
                    key: 'decimals',
                    label: 'Decimals'
                },
                {
                    key: 'type',
                    label: 'Type',
                    formatter: value => {
                        return (value || '').toUpperCase()
                    }
                }
            ],
            sortBy: 'totalSupplyNumber',
            sortDesc: true,
            tokens: [],
            currentPage: this.$store.state.currentPage || 1,
            perPage: 10,
            totalRows: 0,
            loading: false
        }
    },
    async updated () {
    },
    destroyed () { },
    created: async function () {
        await this.getTokens()
    },
    methods: {
        async getTokens () {
            const self = this
            try {
                const params = {
                    limit: self.perPage,
                    page: self.currentPage
                }
                const query = self.serializeQuery(params)
                const { data } = await axios.get(`/api/account/${self.address}/listTokens?${query}`)
                self.tokens = data.items
                self.totalRows = data.total
            } catch (error) {
                console.log(error)
                self.$toasted.show(error, { type: 'error' })
            }
        },
        pageChange (page) {
            this.$store.state.currentPage = page
            this.currentPage = page
            this.getTokens()
        }
    }
}
</script>
