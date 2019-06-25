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
                    to="/createToken">
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
                            :items="listokenItems"
                            :fields="listokenFields"
                            :per-page="listokenPerPage"
                            stacked="lg">
                            <template
                                slot="token"
                                slot-scope="data">
                                <router-link
                                    :to="`token/${data.item.hash}`"
                                    :title="data.item.hash">
                                    {{ data.value }}
                                </router-link>
                            </template>
                            <template
                                slot="price"
                                slot-scope="data">
                                {{ data.item.price || '---' }}
                            </template>
                            <template
                                slot="totalSupply"
                                slot-scope="data">
                                {{ formatNumber(data.value) }}
                            </template>
                            <template
                                slot="volume"
                                slot-scope="data">
                                {{ data.item.volume || '---' }}
                            </template>
                            <template
                                slot="overBalance"
                                slot-scope="data">
                                {{ data.item.overBalance || '---' }}
                            </template>
                            <template
                                slot="holders"
                                slot-scope="data">
                                {{ data.item.holders || '---' }}
                            </template>
                            <template
                                slot="transferToken"
                                slot-scope="data">
                                <b-link
                                    :to="`/transferToken`">
                                    Transfer Token
                                </b-link>
                            </template>
                            <template
                                slot="applytomoz"
                                slot-scope="data">
                                <a
                                    :href="`/tomozcondition/${data.item.hash}`">
                                    Apply TomoZ
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
                        align="center"
                        @change="pageChange"/>
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
            listokenCurrentPage: this.$store.state.listokenCurrentPage || 1,
            listokenRows: 10,
            listokenPerPage: 7,
            listokenFields: [
                { key: 'token', label: 'Token' },
                { key: 'price', label: 'Price' },
                { key: 'volume', label: 'Volume 24h' },
                { key: 'totalSupply', label: 'Total supply' },
                { key: 'overBalance', label: 'Over balance' },
                { key: 'holders', label: 'Holders' },
                { key: 'transferToken', label: '', variant: 'sp-text-center' },
                { key: 'applytomoz', label: '', variant: 'sp-text-center' }
            ],
            listokenItems: [],
            address: store.get('address'),
            sortBy: 'totalSupplyNumber',
            sortDesc: true,
            tokens: [],
            loading: false
        }
    },
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        if (!store.get('address')) {
            next('/login')
        } else next()
    },
    created: async function () {
        await this.getTokens()
    },
    methods: {
        async getTokens () {
            const self = this
            try {
                const params = {
                    limit: self.listokenPerPage,
                    page: self.listokenCurrentPage
                }
                const query = self.serializeQuery(params)
                const items = []
                const { data } = await axios.get(`/api/account/${self.address}/listTokens?${query}`)
                data.items.map(i => {
                    items.push({
                        token: `${i.symbol}(${i.name})`,
                        hash: i.hash,
                        price: '---',
                        volume: '---',
                        totalSupply: i.totalSupplyNumber,
                        overBalance: '---',
                        holders: '---'
                    })
                })
                self.listokenItems = items
                self.listokenRows = data.total
            } catch (error) {
                console.log(error)
                self.$toasted.show(error, { type: 'error' })
            }
        },
        pageChange (page) {
            this.$store.state.listokenCurrentPage = page
            this.listokenCurrentPage = page
            this.getTokens()
        }
    }
}
</script>
