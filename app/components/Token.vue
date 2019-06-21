<template>
    <div class="container">
        <div class="main-box-header">
            <div class="row">
                <div class="col-md-7">
                    <h2 class="tmp-title-large">TIIM</h2>
                    <div class="under">
                        <span
                            v-if="!moreInfo">
                            TriipProtocol
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
                                    to="/tomozcondition">
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
                                        class="fsz-size text-blue"
                                        title="900,000,000,000">
                                        9B
                                    </p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Transfer</p>
                                    <p class="fsz-size text-yellow">981</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">Holder</p>
                                    <p class="fsz-size text-oranges">8678</p>
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
                                                    href="#"
                                                    title="0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74">
                                                    0x999fdsf89dsf8d9sf8ds9fd9s8f4y7fcsjfh74
                                                </a>
                                            </p>
                                        </li>
                                        <li>
                                            <p>Decimals</p>
                                            <p>9</p>
                                        </li>
                                        <li>
                                            <p>
                                                Transactions fee
                                                <b-link
                                                    to="/edittransactionsfee">
                                                    <i class="tomoissuer-icon-edit-pencil"/>
                                                </b-link>
                                            </p>
                                            <p>0.4334</p>
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
                                                <span>100,000,000  TIIM</span>
                                                <span>
                                                    <b-link
                                                        to="#">
                                                        Transfer
                                                    </b-link>
                                                </span>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Pooling fee</p>
                                            <div class="flex-box">
                                                <span>2,000 TOMO</span>
                                                <span>
                                                    <b-link
                                                        to="/depositfee">
                                                        Deposit more
                                                    </b-link>
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
                            <p>A total of 822,078 transactions found (Showing the last 100K records)</p>
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
                                        {{ data.item.age }} mins ago
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
                            <p>A total of 822,078 transactions found (Showing the last 100K records)</p>
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
            <!-- /tmp-table-one -->
        </div>
        <!-- /main-box-header -->
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
            transactionHash: '',
            tranferCurrentPage: 1,
            tranferRows: 10,
            tranferPerPage: 6,
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
                    txn_hash: 'xf3032c1e82e198459a29272c446b9ec73ab979911bd1a471f3b1c648f2145619',
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
            holdersPerPage: 6,
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
            self.holdersCount = data.tokenholders
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
