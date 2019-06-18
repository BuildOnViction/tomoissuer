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
                                    class="tmp-btn-violet"
                                    to="/create">
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
                                    <p class="fsz-size text-blue">{{ formatCapacity(token.totalSupplyNumber) }}</p>
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
                                                <a href="#">{{ token.hash }}</a>
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
                            <div class="tomo_main_table">
                                <b-table
                                    id="transfer_table"
                                    :per-page="perPage"
                                    :current-page="currentPage"
                                    :fields="fields"
                                    :items="items"
                                    stacked="lg">
                                    <template
                                        slot="txn_hash"
                                        slot-scope="data">
                                        <a
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`">
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
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                    <template
                                        slot="icon"
                                        slot-scope="data">
                                        <i class="tomoissuer-icon-angle-double-right"/>
                                    </template>
                                    <template
                                        slot="to"
                                        slot-scope="data">
                                        <a
                                            :href="`#${data.value.replace(/[^a-z]+/i,'-').toLowerCase()}`">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                </b-table>
                            </div>
                        </template>
                        <div class="mt-3 common_tmp_page">
                            <b-pagination
                                v-model="currentPage"
                                :total-rows="totalRows"
                                :per-page="perPage"
                                aria-controls="transfer_table"
                                align="center"/>
                        </div>
                    </b-tab>
                    <b-tab title="Holders">
                        <b-card-text>Tab Contents 2</b-card-text>
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
            perPage: 5,
            currentPage: 1,
            totalRows: 0,
            fields: [
                { key: 'txn_hash', label: 'Txn Hash' },
                { key: 'age', label: 'Age' },
                { key: 'from', label: 'From' },
                { key: 'icon', label: '', variant: 'icon d-none d-lg-block' },
                { key: 'to', label: 'To' },
                { key: 'quantity', label: 'Quantity' }
            ],
            items: [
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: '40',
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 21,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 89,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 40,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 29,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: '40',
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 21,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 89,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 40,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
                },
                {
                    txn_hash: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    age: 29,
                    from: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    icon: '->',
                    to: '0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74',
                    quantity: '0.46448'
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
    computed: {
        // totalRows () {
        //     return this.items.length
        // }
    },
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
            await self.getTransferTable()
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
            axios.get(`/api/token/txes/${this.address}`).then(response => {
                if (response.data) {
                    this.tokenTransfers = response.data.total
                }
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        getTokenHolders () {
            axios.get(`/api/token/holders/${this.address}`).then(response => {
                if (response.data) {
                    this.tokenHolders = response.data.total
                }
            }).catch(error => {
                console.log(error)
                this.$toasted.show(error, { type: 'error' })
            })
        },
        getOwnerBalance () {
            const account = store.get('address').toLowerCase()
            const web3 = this.web3
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
        async getTransferTable () {
            try {
                const self = this
                const { data } = await axios.get(`/api/token/txes/${self.address}`)
                const items = []
                data.items.map(m => {
                    items.push({
                        txn_hash: m.transactionHash,
                        age: moment(m.createdAt).fromNow(),
                        from: m.from,
                        to: m.to,
                        quantity: new BigNumber(m.value).div(10 ** self.token.decimals).toNumber()
                    })
                })
                self.items = items
                self.totalRows = data.total
            } catch (error) {
                console.log(error)
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
