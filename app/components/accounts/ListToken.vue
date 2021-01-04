<template>
    <div
        v-if="listokenItems"
        class="container">
        <h2 class="tmp-title-large">Token List</h2>
        <div class="tmp-table-one other-dots">
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
                                #cell(logo)="data">
                                <div
                                    :class="'token-logo' + (data.item.logo ? ' set-logo' : '')">
                                    <div
                                        v-if="!data.value">
                                        {{ data.item.name.substring(0, 1) }}
                                    </div>
                                    <img
                                        v-if="data.value"
                                        :src="data.value">
                                </div>
                            </template>
                            <div
                                slot="table-busy"
                                class="loading"/>
                            <template
                                #cell(token)="data">
                                <router-link
                                    :to="`token/${data.item.hash}`"
                                    :title="data.item.hash">
                                    {{ data.value }}
                                </router-link>
                            </template>
                            <template
                                #cell(price)="data">
                                {{ data.item.price || '---' }}
                            </template>
                            <template
                                #cell(totalSupply)="data">
                                {{ formatNumber(data.value) }}
                            </template>
                            <template
                                #cell(volume)="data">
                                {{ data.item.volume || '---' }}
                            </template>
                            <template
                                #cell(ownerBalance)="data">
                                {{ data.item.ownerBalance || '---' }}
                            </template>
                            <template
                                #cell(holders)="data">
                                {{ data.item.holders || '---' }}
                            </template>
                            <template
                                #cell(transferToken)="">
                                <b-link
                                    :href="config.tomowalletUrl"
                                    target="_blank">
                                    Transfer Token
                                </b-link>
                            </template>
                            <template
                                #cell(applytomoz)="data">
                                <b-dropdown
                                    class="tmp-btn-dots"
                                    right
                                    no-caret
                                    toggle-class="text-decoration-none"
                                    variant="link">
                                    <template
                                        slot="button-content">
                                        <i class="tm-three-dots" />
                                    </template>
                                    <b-dropdown-item
                                        v-if="!data.item.applytomoz"
                                        :to="'/tomozcondition/' + data.item.hash">
                                        Apply to TomoZ
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="!data.item.applytomox"
                                        :to="'/tomoxcondition/' + data.item.hash">
                                        Apply to TomoX
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        href="https://github.com/tomochain/tokens"
                                        target="_blank">
                                        Update Token Info
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="data.item.mintable"
                                        :to="'/reissueToken/' + data.item.hash">
                                        Reissue Token
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="data.item.mintable"
                                        :to="'/burnToken/' + data.item.hash">
                                        Burn Token
                                    </b-dropdown-item>
                                </b-dropdown>
                                <!-- <router-link
                                    v-if="!data.value"
                                    :to="`/tomozcondition/${data.item.hash}`">
                                    Apply TomoZ
                                </router-link> -->
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
                { key: 'logo', label: '', variant: 'sp-text-center' },
                { key: 'token', label: 'Token' },
                { key: 'ownerBalance', label: 'Balance' },
                { key: 'holders', label: 'Holders' },
                { key: 'price', label: 'Price' },
                { key: 'value', label: 'Value' },
                // { key: 'totalSupply', label: 'Total supply' },
                { key: 'transferToken', label: '', variant: 'sp-text-center' },
                { key: 'applytomoz', label: '', variant: 'sp-text-center' }
            ],
            listokenItems: [],
            sortBy: 'totalSupplyNumber',
            sortDesc: true,
            tokens: [],
            loading: false,
            appliedZList: [],
            appliedXList: [],
            account: '',
            config: {}
        }
    },
    async updated () {
    },
    destroyed () { },
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
                let promises = this.checkAppliedZ()
                let appliedXPromise = this.checkAppliedX()
                const { data } = await axios.get(`/api/account/${self.account}/listTokens?${query}`)
                self.appliedZList = await promises
                self.appliedXList = await appliedXPromise
                if (data.items.length > 0) {
                    const map = await Promise.all(data.items.map(async i => {
                        return {
                            name: i.name,
                            token: `${i.name} (${i.symbol})`,
                            symbol: i.symbol,
                            hash: i.hash,
                            price: '---',
                            value: '---',
                            totalSupply: i.totalSupplyNumber,
                            ownerBalance: this.formatNumber(await self.getOwnerBalance(i.hash, i.decimals)),
                            holders: i.holders || '---',
                            applytomoz: ((self.appliedZList || []).indexOf(i.hash) > -1),
                            applytomox: ((self.appliedXList || []).indexOf(i.hash) > -1),
                            logo: await self.getLogo(i.hash),
                            mintable: i.isMintable
                        }
                    }))
                    self.listokenItems = map
                    self.listokenRows = data.total
                    self.loading = false
                } else { self.listokenItems = null }
            } catch (error) {
                self.loading = false
                console.log(error)
                self.$toasted.show(error, { type: 'error' })
            }
        },
        async getLogo (address) {
            try {
                const { data } = await axios.get('/api/token/getLogo/' + address)
                if (data.image) {
                    return data.image
                } else return false
            } catch (error) {
                return false
            }
        },
        async pageChange (page) {
            this.$store.state.listokenCurrentPage = page
            this.listokenCurrentPage = page
            await this.getTokens()
        },
        async checkAppliedZ () {
            const contract = await this.TRC21Issuer
            if (contract) {
                const result = await contract.methods.tokens.call()
                if (result && result.length > 0) {
                    let lowerCaseArr = result.map(m => m.toLowerCase())
                    return lowerCaseArr
                }
            }
            return null
        },
        async checkAppliedX () {
            const contract = await this.TomoXListing
            if (contract) {
                const result = await contract.methods.tokens.call()
                if (result && result.length > 0) {
                    let lowerCaseArr = result.map(m => m.toLowerCase())
                    return lowerCaseArr
                }
            }
            return null
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
        },
        transferToken () {
            alert('You can use TomoWallet mobile version to transfer TRC21 Tokens.' +
                'We will release TomoWallet web version soon.')
        }
    }
}
</script>
