<template>
    <div class="container">
        <div class="main-box-header">
            <div class="row">
                <div class="col-md-6">
                    <h2 class="tmp-title-large">{{ token.name }}</h2>
                    <div class="under">
                        <span
                            v-if="!moreInfo">
                            {{ token.symbol }}
                        </span>
                        <span
                            v-if="token.type === 'trc21'"
                            class="apply-trc">
                            TRC-21
                        </span>
                        <span
                            v-if="isAppliedZ"
                            class="apply-tomoz">
                            TomoZ
                        </span>
                    </div>
                </div>
                <div class="col-md-6 text-right">
                    <div class="tomo-btn">
                        <ul>
                            <li>
                                <b-link
                                    v-if="!isAppliedZ"
                                    :to="'/tomozcondition/' + address"
                                    class="tmp-btn-violet">
                                    <i class="tomoissuer-icon-tomoz"/>
                                    Apply to pay fee by token
                                </b-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div><!-- main-box-header -->
        <div class="main-box-body">
            <div class="info_tiim">
                <div class="row">
                    <div class="col-lg-4">
                        <div class="row">
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Price</p>
                                    <p class="fsz-size text-violet">---</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Total supply</p>
                                    <p
                                        :title="formatNumber(token.totalSupplyNumber)"
                                        class="fsz-size text-blue">
                                        {{ formatCapacity(token.totalSupplyNumber) }}
                                    </p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Transfer</p>
                                    <p class="fsz-size text-yellow">{{ tokenTransfers }}</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Holder</p>
                                    <p class="fsz-size text-oranges">{{ tokenHolders }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="row common_height_max">
                            <div class="col-12">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Profile summary</p>
                                    <ul>
                                        <li>
                                            <p>Profile summary</p>
                                            <p class="common_txt_ellipsis text-blue">
                                                <a
                                                    :title="token.hash"
                                                    :href="config.tomoscanUrl + '/address/' + address"
                                                    target="_blank">
                                                    {{ token.hash }}
                                                </a>
                                            </p>
                                        </li>
                                        <li>
                                            <p>Decimals</p>
                                            <p>{{ token.decimals }}</p>
                                        </li>
                                        <li>
                                            <p>
                                                Transactions fee
                                                <b-link
                                                    :to="`/edittransactionsfee/${address}`">
                                                    <i class="tomoissuer-icon-edit-pencil"/>
                                                </b-link>
                                            </p>
                                            <p>{{ txFee || '---' }}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="row common_height_max">
                            <div class="col-12">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Balance</p>
                                    <ul>
                                        <li>
                                            <p>Owner balance</p>
                                            <div class="flex-box">
                                                <span>{{ formatCurrencySymbol(
                                                formatNumber(ownerBalance), token.symbol) }}</span>
                                                <span>
                                                    <b-link
                                                        :href="config.tomowalletUrl + '/trc21/' + address"
                                                        target="_blank">Transfer</b-link>
                                                </span>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Pooling fee</p>
                                            <div class="flex-box">
                                                <span>{{ formatNumber(poolingFee) }} TOMO</span>
                                                <span>
                                                    <b-link :to="'/depositfee/' + address">Deposit more</b-link>
                                                </span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /info_tiim -->
            <div class="tmp-table-one">
                <b-tabs
                    content-class="mt-3">
                    <b-tab
                        title="Transfer"
                        active>
                        <template>
                            <p>A total of {{ formatNumber(tokenTransfers) }} transactions found
                            (Showing the last 100K records)</p>
                            <div :class="'tomo_main_table' + (loading ? '' : ' colum-5')">
                                <b-table
                                    id="transfer_table"
                                    :per-page="transferPerPage"
                                    :fields="transferFields"
                                    :items="transferItems"
                                    :busy="loading"
                                    stacked="lg">
                                    <template
                                        slot="table-busy">
                                        <div class="text-center text-danger my-2">
                                            <b-spinner class="align-middle" />
                                            <strong>Loading...</strong>
                                        </div>
                                    </template>
                                    <template
                                        slot="txn_hash"
                                        slot-scope="data">
                                        <a
                                            :href="config.tomoscanUrl + '/txs/' +
                                            data.value.toLowerCase()"
                                            :title="data.value"
                                            target="_blank">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                    <template
                                        slot="age"
                                        slot-scope="data">
                                        {{ data.item.age }}
                                    </template>
                                    <template
                                        slot="from"
                                        slot-scope="data">
                                        <a
                                            :href="config.tomoscanUrl + '/address/' + data.value"
                                            :title="data.value"
                                            target="_blank">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                    <template
                                        slot="icon">
                                        <i class="tomoissuer-icon-next-right"/>
                                    </template>
                                    <template
                                        slot="to"
                                        slot-scope="data">
                                        <a
                                            :href="config.tomoscanUrl + '/address/' + data.value"
                                            :title="data.value"
                                            target="_blank">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                </b-table>
                            </div>
                        </template>
                        <div class="mt-3 common_tmp_page">
                            <b-pagination
                                v-model="transferCurrentPage"
                                :total-rows="transferRows"
                                :per-page="transferPerPage"
                                aria-controls="transfer_table"
                                align="center"/>
                        </div>
                    </b-tab>
                    <b-tab
                        title="holders">
                        <template>
                            <p>A total of {{ formatNumber(tokenHolders) }}
                                {{ tokenHolders > 1 ? 'holders' : 'holder' }} found
                                (Showing the last 100K records)</p>
                            <div :class="'tomo_main_table' + (loading ? '' : 'colum-4')">
                                <b-table
                                    id="holders_table"
                                    :per-page="holdersPerPage"
                                    :fields="holdersFields"
                                    :items="holdersItems"
                                    :busy="loading"
                                    stacked="lg">
                                    <template
                                        slot="table-busy">
                                        <div class="text-center text-danger my-2">
                                            <b-spinner class="align-middle" />
                                            <strong>Loading...</strong>
                                        </div>
                                    </template>
                                    <template
                                        slot="address"
                                        slot-scope="data">
                                        <a
                                            :href="config.tomoscanUrl + '/address/' + data.value"
                                            :title="data.value"
                                            target="_blank">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                </b-table>
                            </div>
                        </template>
                        <div class="mt-3 common_tmp_page">
                            <b-pagination
                                v-model="holdersCurrentPage"
                                :total-rows="holdersRows"
                                :per-page="holdersPerPage"
                                aria-controls="holders_table"
                                align="center"/>
                        </div>
                    </b-tab>
                </b-tabs>
            </div>
            <!-- /tmp-table-one -->
        </div>
        <!-- /main-box-header -->
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import store from 'store'
import moment from 'moment'

export default {
    name: 'App',
    components: {},
    mixins: [validationMixin],
    data () {
        return {
            web3: this.web3,
            address: this.$route.params.address.toLowerCase(),
            account: '',
            token: {},
            tokenName: null,
            symbol: null,
            tokenTransfers: 0,
            tokenHolders: 0,
            moreInfo: '',
            loading: false,
            depositeAmount: '',
            isAppliedZ: false,
            transactionHash: '',
            ownerBalance: '',
            poolingFee: '',
            txFee: '',
            config: {},
            tomoscanUrl: '',
            transferCurrentPage: 1,
            transferRows: 10,
            transferPerPage: 6,
            transferFields: [
                { key: 'txn_hash', label: 'Txn Hash' },
                { key: 'age', label: 'Age' },
                { key: 'from', label: 'From' },
                { key: 'icon', label: '', variant: 'icon d-none d-lg-block' },
                { key: 'to', label: 'To' },
                { key: 'amount', label: 'Amount' }
            ],
            transferItems: [],
            holdersCurrentPage: 1,
            holdersRows: 7,
            holdersPerPage: 6,
            holdersFields: [
                { key: 'rank', label: 'Rank' },
                { key: 'address', label: 'Address' },
                { key: 'amount', label: 'Amount' },
                { key: 'percentage', label: 'Percentage (%)' }
            ],
            holdersItems: []
        }
    },
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    beforeRouteEnter (to, from, next) {
        next()
    },
    created: async function () {
        try {
            const self = this
            self.account = store.get('address') ||
                self.$store.state.address || await self.getAccount()
            if (!self.account) {
                self.$router.push({ path: '/login' })
            }
            self.config = store.get('config') || await self.appConfig()
            await self.getTokenDetail()
            self.getTokenTransfer()
            self.getTokenHolders()
            self.getOwnerBalance()
            self.getPoolingFee()
            self.checkAppliedZ()
            self.getTransactionFee()
        } catch (error) {
            console.log(error)
            this.$toasted.show(error, { type :'error' })
        }
    },
    mounted: async function () {
    },
    methods: {
        async getTokenDetail () {
            const self = this
            const { data } = await axios.get(`/api/token/${self.address}`)
            self.token = data
            self.tokenName = data.name
            self.symbol = data.symbol

            self.$store.state.token = data
        },
        getTokenTransfer () {
            const self = this
            self.loading = true
            const isTrc21 = self.token.type
            axios.get(`/api/token/txes/${isTrc21}/${this.address}`).then(response => {
                const data = response.data
                if (data) {
                    const items = []
                    data.items.map(m => {
                        items.push({
                            txn_hash: m.transactionHash,
                            age: moment(m.createdAt).fromNow(),
                            from: m.from,
                            to: m.to,
                            amount: self.formatNumber(
                                new BigNumber(m.value).div(10 ** self.token.decimals).toNumber())
                        })
                    })
                    self.transferItems = items
                    self.transferRows = data.total
                    self.tokenTransfers = response.data.total
                    self.loading = false
                }
            }).catch(error => {
                self.loading = false
                console.log(error)
                self.$toasted.show(error, { type: 'error' })
            })
        },
        getTokenHolders () {
            const self = this
            self.loading = true
            const params = {
                page: self.holdersCurrentPage,
                limit: self.holdersPerPage
            }
            const isTrc21 = self.token.type === 'trc21' ? 'trc21/' : ''
            const query = self.serializeQuery(params)
            axios.get(`/api/token/holders/${isTrc21}${this.address}?${query}`).then(response => {
                const data = response.data
                if (data) {
                    const items = []
                    data.items.map(m => {
                        items.push({
                            rank: m.rank,
                            address: m.hash,
                            amount: self.formatNumber(m.quantityNumber),
                            percentage: m.percentage
                        })
                    })
                    self.holdersItems = items
                    self.holdersRows = data.total
                    self.tokenHolders = response.data.total
                    self.loading = false
                }
            }).catch(error => {
                self.loading = false
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        getOwnerBalance () {
            const web3 = this.web3
            if (this.account && web3) {
                // 0x70a08231 is balanceOf(address) function code
                let data = '0x70a08231' +
                    '000000000000000000000000' +
                    this.account.substr(2) // chop off the 0x
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.ownerBalance = balance.div(10 ** this.token.decimals).toNumber()
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
        },
        getPoolingFee () {
            const contract = this.TRC21Issuer
            contract.methods.getTokenCapacity(this.address).call().then(capacity => {
                let balance = new BigNumber(this.web3.utils.hexToNumberString(capacity))
                this.poolingFee = balance.div(10 ** this.token.decimals).toNumber()
                this.$store.state.token['poolingFee'] = this.poolingFee
            }).catch(error => {
                console.log(error)
                this.$toatsed.show(error, { type: 'error' })
            })
        },
        getTransactionFee () {
            const web3 = this.web3
            if (this.account && web3) {
                // 0x24ec7590 is minFee function code
                let data = '0x24ec7590' +
                    '00000000000000000000000000000000000000000000000000000000'
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.txFee = balance.div(10 ** this.token.decimals).toNumber()
                    this.$store.state.token['txFee'] = this.txFee
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
        },
        checkAppliedZ () {
            const contract = this.TRC21Issuer
            contract.methods.tokens.call()
                .then(result => {
                    if (result && result.length > 0) {
                        const lowerCaseArr = result.map(m => m.toLowerCase())
                        if (lowerCaseArr.indexOf(this.address) > -1) {
                            this.isAppliedZ = true
                        }
                    }
                }).catch(error => {
                    console.log(error)
                    this.$toasted.show(error, { type: 'error' })
                })
        }
    }
}
</script>
