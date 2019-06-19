<template>
    <div class="container">
        <div class="main-box-header">
            <div class="row">
                <div class="col-md-7">
                    <h2 class="tmp-title-large">{{ token.name }}</h2>
                    <div class="under">
                        <span
                            v-if="!moreInfo">
                            {{ token.symbol }}
                        </span>
                        <span
                            v-if="!moreInfo"
                            class="apply-trc">
                            TRC-721
                        </span>
                        <span
                            v-if="!moreInfo"
                            class="apply-tomoz">
                            TomoZ
                        </span>
                    </div>
                </div>
                <div class="col-md-5 text-right">
                    <div class="tomo-btn">
                        <ul>
                            <li>
                                <b-link
                                    :to="'/apply/' + address"
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
                                    <p class="fsz-size text-violet">$0.25</p>
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
                                                    href="#">
                                                    {{ token.hash }}
                                                </a>
                                            </p>
                                        </li>
                                        <li>
                                            <p>Decimals</p>
                                            <p>{{ token.decimals }}</p>
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
                                                <span><a href="#">Transfer</a></span>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Pooling fee</p>
                                            <div class="flex-box">
                                                <span>2,000 TOMO</span>
                                                <span><a href="#">Deposit more</a></span>
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
            <div class="info_others">
                <b-tabs
                    content-class="mt-3">
                    <b-tab
                        title="Transfer"
                        active>
                        <template>
                            <p>A total of {{ formatNumber(tokenTransfers) }} transactions found
                            (Showing the last 100K records)</p>
                            <div class="tomo_main_table colum-5">
                                <b-table
                                    id="transfer_table"
                                    :per-page="tranferPerPage"
                                    :current-page="tranferCurrentPage"
                                    :fields="tranferFields"
                                    :items="tranferItems"
                                    stacked="lg">
                                    <template
                                        slot="txn_hash"
                                        slot-scope="data">
                                        <a
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`"
                                            :title="data.value">
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
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`"
                                            :title="data.value">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                    <template
                                        slot="icon"
                                        slot-scope="data">
                                        <i class="tomoissuer-icon-next-right"/>
                                    </template>
                                    <template
                                        slot="to"
                                        slot-scope="data">
                                        <a
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`"
                                            :title="data.value">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                </b-table>
                            </div>
                        </template>
                        <div class="mt-3 common_tmp_page">
                            <b-pagination
                                v-model="tranferCurrentPage"
                                :total-rows="tranferRows"
                                :per-page="tranferPerPage"
                                aria-controls="transfer_table"
                                align="center"/>
                        </div>
                    </b-tab>
                    <b-tab
                        title="holders">
                        <template>
                            <p>A total of {{ formatNumber(tokenHolders) }} transactions found
                            (Showing the last 100K records)</p>
                            <div class="tomo_main_table colum-4">
                                <b-table
                                    id="holders_table"
                                    :per-page="holdersPerPage"
                                    :current-page="holdersCurrentPage"
                                    :fields="holdersFields"
                                    :items="holdersItems"
                                    stacked="lg">
                                    <template
                                        slot="address"
                                        slot-scope="data">
                                        <a
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`"
                                            :title="data.value">
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
            <!-- /info_others -->
        </div>
        <!-- /main-box-header -->
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { required, minValue } from 'vuelidate/lib/validators'
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
            token: {},
            tokenName: null,
            symbol: null,
            tokenTransfers: 0,
            tokenHolders: 0,
            moreInfo: '',
            loading: false,
            depositeAmount: '',
            isApplied: false,
            transactionHash: '',
            ownerBalance: '',
            tranferCurrentPage: 1,
            tranferRows: 10,
            tranferPerPage: 5,
            tranferFields: [
                { key: 'txn_hash', label: 'Txn Hash' },
                { key: 'age', label: 'Age' },
                { key: 'from', label: 'From' },
                { key: 'icon', label: '', variant: 'icon d-none d-lg-block' },
                { key: 'to', label: 'To' },
                { key: 'amount', label: 'Amount' }
            ],
            tranferItems: [
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: '40',
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 21,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 89,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 40,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 29,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: '40',
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 21,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 89,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 40,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 29,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448'
                }
            ],
            holdersCurrentPage: 1,
            holdersRows: 7,
            holdersPerPage: 5,
            holdersFields: [
                { key: 'rank', label: 'Rank' },
                { key: 'address', label: 'Address' },
                { key: 'amount', label: 'Amount' },
                { key: 'percentage', label: 'Percentage (%)' }
            ],
            holdersItems: [
                {
                    rank: '1',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                },
                {
                    rank: '2',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                },
                {
                    rank: '3',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                },
                {
                    rank: '4',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                },
                {
                    rank: '5',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                },
                {
                    rank: '6',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                },
                {
                    rank: '7',
                    address: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    amount: '0.46448',
                    percentage: '50.62'
                }
            ]
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
            await self.getTokenDetail()
            self.getTokenTransfer()
            self.getTokenHolders()
            self.getOwnerBalance()
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
        },
        getTokenTransfer () {
            const self = this
            const isTrc21 = self.token.type === 'trc21' ? 'trc21/' : ''
            axios.get(`/api/token/txes/${isTrc21}${this.address}`).then(response => {
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
                    self.tranferItems = items
                    self.tranferRows = data.total
                    self.tokenTransfers = response.data.total
                }
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        getTokenHolders () {
            const self = this
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
                }
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        getOwnerBalance () {
            const account = store.get('address').toLowerCase()
            const web3 = this.web3
            if (account && web3) {
                // 0x70a08231 is mean balanceOf(address)
                let data = '0x70a08231' +
                    '000000000000000000000000' +
                    account.substr(2) // chop off the 0x
                web3.eth.call({ to: this.address, data: data }).then(result => {
                    let balance = new BigNumber(web3.utils.hexToNumberString(result))
                    this.ownerBalance = balance.div(10 ** this.token.decimals).toNumber()
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
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
