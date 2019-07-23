<template>
    <div
        v-if="listokenItems"
        class="container">
        <h2 class="tmp-title-large">Token List</h2>
        <div class="tmp-table-one">
            <b-tab
                title="Transfer"
                active>
                <template>
                    <div
                        class="tomo_main_table colum-8">
                        <b-table
                            id="transfer_table"
                            :items="listokenItems"
                            :fields="listokenFields"
                            :per-page="listokenPerPage"
                            :busy="loading"
                            stacked="lg">
                            <template
                                slot="table-busy">
                                <div class="text-center text-danger my-2">
                                    <b-spinner
                                        class="align-middle" />
                                    <strong>Loading...</strong>
                                </div>
                            </template>
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
                                slot="ownerBalance"
                                slot-scope="data">
                                {{ data.item.ownerBalance || '---' }}
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
                                    :href="config.tomowalletUrl + '/trc21/' + data.item.hash"
                                    target="_blank">
                                    Transfer Token
                                </b-link>
                            </template>
                            <template
                                slot="applytomoz"
                                slot-scope="data">
                                <router-link
                                    v-if="!data.value"
                                    :to="`/tomozcondition/${data.item.hash}`">
                                    Apply TomoZ
                                </router-link>
                            </template>
                        </b-table>
                    </div>
                </template>
                <div class="mt-3 common_tmp_page">
                    <b-pagination
                        v-if="listokenRows > 2"
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
    <div
        v-else
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
</template>

<script>
import axios from 'axios'
import store from 'store'
import BigNumber from 'bignumber.js'
export default {
    name: 'App',
    components: { },
    data () {
        return {
            listokenCurrentPage: this.$store.state.listokenCurrentPage || 1,
            listokenRows: 0,
            listokenPerPage: 7,
            listokenFields: [
                { key: 'token', label: 'Token' },
                { key: 'price', label: 'Price' },
                { key: 'volume', label: 'Volume 24h' },
                { key: 'totalSupply', label: 'Total supply' },
                { key: 'ownerBalance', label: 'Owner balance' },
                { key: 'holders', label: 'Holders' },
                { key: 'transferToken', label: '', variant: 'sp-text-center' },
                { key: 'applytomoz', label: '', variant: 'sp-text-center' }
            ],
            listokenItems: [],
            sortBy: 'totalSupplyNumber',
            sortDesc: true,
            tokens: [],
            loading: false,
            appliedList: [],
            account: '',
            config: {}
        }
    },
    async updated () {
    },
    destroyed () { },
    beforeRouteEnter (to, from, next) {
        next()
    },
    created: async function () {
        this.account = store.get('address') ||
            this.$store.state.address || await this.getAccount()
        if (!this.account) {
            this.$router.push({ path: '/login' })
        }
        this.config = store.get('configIssuer') || await this.appConfig()
        await this.getTokens()
    },
    methods: {
        async getTokens () {
            const self = this
            try {
                self.loading = true
                const params = {
                    limit: self.listokenPerPage,
                    page: self.listokenCurrentPage
                }
                const query = self.serializeQuery(params)
                const items = []
                let promises = this.checkAppliedZ()
                const { data } = await axios.get(`/api/account/${self.account}/listTokens?${query}`)
                self.appliedList = await promises
                if (data.items.length > 0) {
                    await Promise.all(data.items.map(async i => {
                        items.push({
                            token: `${i.symbol} (${i.name})`,
                            hash: i.hash,
                            price: '---',
                            volume: '---',
                            totalSupply: i.totalSupplyNumber,
                            ownerBalance: this.formatNumber(await self.getOwnerBalance(i.hash, i.decimals)),
                            holders: i.holders || '---',
                            applytomoz: ((self.appliedList || []).indexOf(i.hash) > -1)
                        })
                    }))
                    self.listokenItems = items
                    self.listokenRows = data.total
                    self.loading = false
                } else { self.listokenItems = null }
            } catch (error) {
                self.loading = false
                console.log(error)
                self.$toasted.show(error, { type: 'error' })
            }
        },
        async pageChange (page) {
            this.$store.state.listokenCurrentPage = page
            this.listokenCurrentPage = page
            await this.getTokens()
        },
        async checkAppliedZ () {
            const contract = this.TRC21Issuer
            const result = await contract.methods.tokens.call()
            if (result && result.length > 0) {
                let lowerCaseArr = result.map(m => m.toLowerCase())
                return lowerCaseArr
            } else return null
        },
        async getOwnerBalance (address, decimals) {
            const web3 = this.web3
            if (this.account && web3) {
                // 0x70a08231 is balanceOf(address) function code
                let data = '0x70a08231' +
                    '000000000000000000000000' +
                    this.account.substr(2) // chop off the 0x
                const result = await web3.eth.call({ to: address, data: data })
                let balance = new BigNumber(web3.utils.hexToNumberString(result))
                return balance.div(10 ** decimals).toNumber()
            }
        }
    }
}
</script>
