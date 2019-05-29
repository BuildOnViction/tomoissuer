<template>
    <div class="container container--wide">
        <b-table
            :items="tokens"
            :fields="fields"
            :per-page="perPage"
            empty-text="There are no candidates to show"
            stacked="lg">

            <template
                slot="hash"
                slot-scope="data">
                <router-link
                    :to="'/token/' + data.item.hash">
                    {{ truncate(data.item.hash, 20) }}
                </router-link>
            </template>

            <template
                slot="symbol"
                slot-scope="data">{{ data.item.symbol }}
            </template>
        </b-table>
        <b-pagination
            v-if="totalRows > 0 && totalRows > perPage"
            :total-rows="totalRows"
            :per-page="perPage"
            v-model="currentPage"
            align="center"
            @change="pageChange">
            <span
                slot="first-text"
                class="text-success">First</span>
            <span
                slot="prev-text"
                class="text-danger">Prev</span>
            <span
                slot="next-text"
                class="text-warning">Next</span>
            <span
                slot="last-text"
                class="text-info">Last</span>
            <div slot="ellipsis-text">
                <b-spinner
                    small
                    type="grow"/>
                <b-spinner
                    small
                    type="grow"/>
                <b-spinner
                    small
                    type="grow"/>
            </div>
            <span
                slot="page"
                slot-scope="{ page, active }">
                <b v-if="active">{{ page }}</b>
                <i v-else>{{ page }}</i>
            </span>
        </b-pagination>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'App',
    components: { },
    data () {
        return {
            address: this.$route.params.address.toLowerCase(),
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
