<template>
    <div class="container">
        <div class="main-box-header">
            <div class="row">
                <div class="col-md-4">
                    <h2 class="tmp-title-large">{{ token.name }}</h2>
                    <div class="under">
                        <span
                            v-if="!moreInfo">
                            {{ token.symbol }}
                        </span>
                        <span
                            v-if="token.type === 'vrc25'"
                            class="apply-trc">
                            VRC-25
                        </span>
                        <span
                            v-if="token.type === 'trc21'"
                            class="apply-trc">
                            VRC-21
                        </span>
                        <span
                            v-if="token.type === 'trc20'"
                            class="apply-trc">
                            VRC-20
                        </span>
                        <span
                            v-if="isBridgeToken && token.type === 'trc21'"
                            id="wraperc20"
                            class="apply-trc">
                            Wrapped: ERC-20
                            <b-tooltip
                                target="wraperc20">
                                This is a VRC-21 standard wrapped token backed by an ERC-20 asset.
                            </b-tooltip>
                        </span>
                        <span
                            v-if="isAppliedZ"
                            class="apply-tomoz">
                            VicZ
                        </span>
                        <!-- <span
                            v-if="isAppliedX"
                            class="apply-tomoz">
                            TomoX
                        </span>
                        <span
                            v-if="isAppliedB"
                            class="apply-tomoz">
                            TomoBridge
                        </span> -->
                    </div>
                </div>
                <div class="col-md-8 text-right">
                    <div class="tomo-btn">
                        <ul>
                            <li>
                                <b-link
                                    v-if="!isAppliedZ
                                    && account === contractCreation"
                                    :to="'/viczcondition/' + address"
                                    class="tmp-btn-violet"
                                    style="width: 240px">
                                    <span class="tm-icon-tomoz-new-w mr-1">
                                        <span class="path1"/><span class="path2"/>
                                    </span>
                                    <!-- <i class="tm-icon-tomoz mr-1"/> -->
                                    Apply Zero Gas Protocol
                                </b-link>
                            </li>
                            <!-- <li>
                                <b-link
                                    v-if="token.type === 'trc21' && !isAppliedX && account === contractCreation"
                                    :to="'/tomoxcondition/' + address"
                                    class="tmp-btn-violet"
                                    style="width: 240px">
                                    <span class="tm-icon-tomox-new-w mr-1">
                                        <span class="path1"/><span class="path2"/><span class="path3"/>
                                    </span>
                                    Apply to TomoX Protocol
                                </b-link>
                            </li> -->
                            <li>
                                <b-dropdown
                                    right
                                    no-caret
                                    class="tmp-btn-transparent"
                                    toggle-class="text-decoration-none"
                                    variant="link">
                                    <template
                                        slot="button-content"
                                        class="tmp-btn-transparent">
                                        <i class="tm-icon-cog" />
                                    </template>
                                    <b-dropdown-item
                                        :to="'/viewToken/' + address">
                                        View Token Info
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        href="https://github.com/buildOnViction/tokens"
                                        target="_blank">
                                        Update Token Info
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="isAppliedZ && contractCreation === account && token.type !== 'vrc25'"
                                        :to="'/edittransactionsfee/' + address">
                                        Edit transaction fee
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="isAppliedZ"
                                        :to="'/depositfee/' + address">
                                        Deposit fee fund
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="token.isMintable"
                                        :to="'/reissueToken/' + address">
                                        Reissue Token
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-if="token.isMintable"
                                        :to="'/burnToken/' + address">
                                        Burn Token
                                    </b-dropdown-item>
                                </b-dropdown>
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
                                    <p class="tmp-title-medium">Total Supply</p>
                                    <p
                                        :title="formatNumber(token.totalSupplyNumber)"
                                        class="fsz-size text-blue common_txt_ellipsis">
                                        {{ formatCapacity(token.totalSupplyNumber) }}
                                    </p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">{{ tokenTransfers > 1 ? 'Transfers' : 'Transfer' }}</p>
                                    <p class="fsz-size text-yellow">{{ tokenTransfers }}</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="box-item">
                                    <p class="tmp-title-medium">{{ tokenHolders > 1 ? 'Holders' : 'Holder' }}</p>
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
                                            <p
                                                class="title-small">
                                                Contract address
                                            </p>
                                            <p class="common_txt_ellipsis text-blue">
                                                <a
                                                    :title="token.address"
                                                    :href="config.tomoscanUrl + '/token/' + address"
                                                    target="_blank">
                                                    {{ token.address }}
                                                </a>
                                            </p>
                                        </li>
                                        <li>
                                            <p class="title-small">Decimals</p>
                                            <p>{{ token.decimals }}</p>
                                        </li>
                                        <li v-if="isAppliedZ">
                                            <p class="title-small">
                                                Transactions fee
                                                <b-link
                                                    v-if="account === contractCreation"
                                                    :to="`/edittransactionsfee/${address}`">
                                                    <i class="tm-icon-edit-pencil"/>
                                                </b-link>
                                            </p>
                                            <p>{{ formatNumber(txFee) }} {{ token.symbol }}</p>
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
                                            <p class="title-small">Owner balance</p>
                                            <div class="flex-box">
                                                <span>{{ formatCurrencySymbol(
                                                formatNumber(ownerBalance), token.symbol) }}</span>
                                                <!-- <span>
                                                    <b-link
                                                        :href="config.tomowalletUrl"
                                                        target="_blank">Transfer</b-link>
                                                </span> -->
                                            </div>
                                        </li>
                                        <li v-if="isAppliedZ">
                                            <p class="title-small">VRC fee fund</p>
                                            <div class="flex-box">
                                                <span>{{ formatNumber(poolingFee) }} VIC</span>
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
                                    <div
                                        slot="table-busy"
                                        class="loading"/>
                                    <!-- <template
                                        slot="table-busy">
                                        <div class="text-center text-danger my-2">
                                            <b-spinner class="align-middle" />
                                            <strong>Loading...</strong>
                                        </div>
                                    </template> -->
                                    <template
                                        #cell(txn_hash)="data">
                                        <a
                                            :href="config.tomoscanUrl + '/tx/' +
                                            data.value.toLowerCase()"
                                            :title="data.value"
                                            target="_blank">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                    <template
                                        #cell(age)="data">
                                        {{ data.item.age }}
                                    </template>
                                    <template
                                        #cell(from)="data">
                                        <a
                                            :href="config.tomoscanUrl + '/address/' + data.value"
                                            :title="data.value"
                                            target="_blank">
                                            {{ data.value }}
                                        </a>
                                    </template>
                                    <template
                                        #cell(icon)="">
                                        <i class="tm-icon-next-right"/>
                                    </template>
                                    <template
                                        #cell(to)="data">
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
                                v-if="transferRows > 2"
                                v-model="transferCurrentPage"
                                :total-rows="transferRows"
                                :per-page="transferPerPage"
                                aria-controls="transfer_table"
                                align="center"
                                @change="transferPageChange"/>
                        </div>
                    </b-tab>
                    <b-tab
                        title="Holders">
                        <template>
                            <p>A total of {{ formatNumber(tokenHolders) }}
                                {{ tokenHolders > 1 ? 'holders' : 'holder' }} found
                                (Showing the last 100K records)</p>
                            <div :class="'tomo_main_table' + (loading ? '' : ' colum-4')">
                                <b-table
                                    id="holders_table"
                                    :per-page="holdersPerPage"
                                    :fields="holdersFields"
                                    :items="holdersItems"
                                    :busy="loading"
                                    stacked="lg">
                                    <div
                                        slot="table-busy"
                                        class="loading"/>
                                    <!-- <template
                                        slot="table-busy">
                                        <div class="text-center text-danger my-2">
                                            <b-spinner class="align-middle" />
                                            <strong>Loading...</strong>
                                        </div>
                                    </template> -->
                                    <template
                                        #cell(address)="data">
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
                                v-if="holdersRows > 2"
                                v-model="holdersCurrentPage"
                                :total-rows="holdersRows"
                                :per-page="holdersPerPage"
                                aria-controls="holders_table"
                                align="center"
                                @change="holderPageChange"/>
                        </div>
                    </b-tab>
                </b-tabs>
            </div>
            <!-- /tmp-table-one -->
        </div>
        <!-- /main-box-header -->
        <b-modal
            id="announceBridgeModal"
            ref="announceBridgeModal"
            size="md"
            hide-header
            hide-footer
            centered
            no-close-on-esc
            no-close-on-backdrop>
            <div class="tomo-modal-default icon-blue">
                <div v-if="step === 1">
                    <div class="msg-txt">
                        <h3>TomoBridge applying</h3>
                        <p>Are you sure you want to apply your token to TomoBridge?</p>
                    </div>
                    <div class="btn-box">
                        <b-button
                            class="tmp-btn-boder-blue btn-min"
                            @click="closeModal">
                            Back
                        </b-button>
                        <b-button
                            class="tmp-btn-blue"
                            @click="announceBridge">
                            Confirm
                        </b-button>
                    </div>
                </div>
                <div
                    v-if="step === 2">
                    <div class="msg-txt">
                        <i class="tm-icon-checkmark-outline"/>
                        <h3><b>Successful</b></h3>
                        <p>You have applied to TomoBridge.</p>
                        <div class="d-flex">
                            <b-form-checkbox v-model="isCheckUpdateInfo"/>
                            <p>
                                To update the token's logo and information, please go to the
                                <a
                                    href="https://github.com/tomochain/tokens"
                                    target="_blank">tokens repository</a>.
                            </p>
                        </div>
                    </div>
                    <div class="btn-box">
                        <b-button
                            :disabled="!isCheckUpdateInfo"
                            class="tmp-btn-blue"
                            @click="closeModal">
                            OK
                        </b-button>
                    </div>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import store from 'store'
import moment from 'moment'
import urljoin from 'url-join'

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
            transferRows: 0,
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
            holdersRows: 0,
            holdersPerPage: 6,
            holdersFields: [
                { key: 'rank', label: 'Rank' },
                { key: 'address', label: 'Address' },
                { key: 'amount', label: 'Amount' },
                { key: 'percentage', label: 'Percentage (%)' }
            ],
            holdersItems: [],
            contractCreation: '',
            isAppliedX: false,
            isAppliedB: false,
            isBridgeToken: false,
            tokenAddressURL: '',
            tokenERC20Address: '',
            step: 1,
            isCheckUpdateInfo: false
        }
    },
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        try {
            const self = this
            self.account = store.get('address') ||
                self.$store.state.address || await self.getAccount()
            if (!self.account) {
                self.$router.push({ path: '/login' })
            }
            self.config = store.get('configIssuer') || await self.appConfig()

            await self.getTokenDetail()
            self.getTokenTransfer()
            self.getTokenHolders()
            self.getOwnerBalance()
            self.getPoolingFee()
            self.checkAppliedZ()
            self.checkAppliedX()
            self.getTransactionFee()
            // self.checkBridgeToken()
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
            self.token.address = (data && data.address ? data.address : self.address).toLowerCase()
            self.token.contract = (data && data.address ? data.address : self.address).toLowerCase()
            self.tokenName = data.name
            self.symbol = data.symbol
            self.contractCreation = (data && data.owner ? data.owner : self.account).toLowerCase()

            self.$store.state.token = self.token
        },
        getTokenTransfer () {
            const self = this
            self.loading = true
            const params = {
                limit: self.transferPerPage,
                page: self.transferCurrentPage
            }
            const query = self.serializeQuery(params)
            axios.get(`/api/token/txs/${this.address}?${query}`).then(response => {
                const data = response.data
                if (data) {
                    const items = []
                    data.data.map(m => {
                        items.push({
                            txn_hash: m.transactionHash,
                            age: moment(m.timestamp * 1000).fromNow(),
                            from: m.from,
                            to: m.to,
                            amount: self.formatNumber(
                                new BigNumber(m.value).div(10 ** m.tokenDecimals).toNumber())
                        })
                    })
                    self.transferItems = items
                    self.transferRows = data.total
                    self.tokenTransfers = data.total
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
            const query = self.serializeQuery(params)
            axios.get(`/api/token/holders/${this.address}?${query}`).then(response => {
                const data = response.data
                if (data) {
                    const items = []
                    data.data.map((m, mIndex) => {
                        items.push({
                            rank: mIndex + 1,
                            address: m.address,
                            amount: self.formatNumber(m.quantityNumber),
                            percentage: (m.quantityNumber * 100 / self.token.totalSupplyNumber).toFixed(2)
                        })
                    })
                    self.holdersItems = items
                    self.holdersRows = data.total
                    self.tokenHolders = data.total
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
            if (this.contractCreation && web3) {
                // 0x70a08231 is balanceOf(address) function code
                let data = '0x70a08231' +
                    '000000000000000000000000' +
                    this.contractCreation.substr(2) // chop off the 0x
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
            const web3 = this.web3
            if (web3) {
                const contract = this.TRC21Issuer
                contract.methods.getTokenCapacity(this.address).call().then(capacity => {
                    this.poolingFee = new BigNumber(capacity).div(10 ** 18).toNumber()
                    this.$store.state.token['poolingFee'] = this.poolingFee
                }).catch(error => {
                    console.log(error)
                    this.$toatsed.show(error, { type: 'error' })
                })
            }
        },
        getTransactionFee () {
            const web3 = this.web3
            if (web3) {
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
            if (this.token.type !== 'vrc25' && this.token.type !== 'vrc21') {
                return false
            }
            if (contract) {
                contract.methods.tokens().call()
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
        },
        checkAppliedX () {
            const contract = this.TomoXListing
            if (contract) {
                contract.methods.tokens().call()
                    .then(result => {
                        if (result && result.length > 0) {
                            const lowerCaseArr = result.map(m => m.toLowerCase())
                            if (lowerCaseArr.indexOf(this.address) > -1) {
                                this.isAppliedX = true
                            }
                        }
                    }).catch(error => {
                        console.log(error)
                        this.$toasted.show(error, { type: 'error' })
                    })
            }
        },
        transferPageChange (page) {
            this.$store.state.transferCurrentPage = page
            this.transferCurrentPage = page
            this.getTokenTransfer()
        },
        holderPageChange (page) {
            this.$store.state.holdersCurrentPage = page
            this.holdersCurrentPage = page
            this.getTokenHolders()
        },
        transferToken () {
            alert('You can use TomoWallet mobile version to transfer VRC21 Tokens.' +
                'We will release TomoWallet web version soon.')
        },
        async checkAppliedB () {
            try {
                const { data } = await axios.get('/api/token/getToken?token=' + this.tokenERC20Address)
                this.isAppliedB = data.status
            } catch (error) {
                this.$toasted.show(error, { type: 'error' })
            }
        },
        async checkBridgeToken () {
            const self = this
            try {
                const contract = new this.web3.eth.Contract(
                    this.TomoBridgeWrapToken.abi,
                    this.address
                )
                await contract.methods.original_contract.call()
                    .then(result => {
                        if (result) {
                            self.isBridgeToken = (this.web3.utils.isAddress(result) || false)
                            self.tokenERC20Address = result
                            self.checkAppliedB()
                            self.tokenAddressURL = urljoin(
                                self.config.etherChain.etherScanURL,
                                'token',
                                result
                            )
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        self.isBridgeToken = false
                    })
            } catch (error) {
                console.log(error)
            }
        },
        showAnnounceBridgeModal () {
            this.step = 1
            this.$refs.announceBridgeModal.show()
        },
        async announceBridge () {
            axios.post('/api/token/announceBridge', {
                chain: 'ETH',
                tokenName: this.tokenName,
                tokenSymbol: this.symbol,
                tokenAddress: this.tokenERC20Address,
                decimals: this.token.decimals,
                coingecko_id: this.coingecko_id,
                wrapperAddress: this.address,
                caller: this.account
            }).then(response => {
                if (response.data.address) {
                    this.step = 2
                    this.isAppliedB = true
                }
            }).catch(error => {
                if (error.response && error.response.data) {
                    this.$toasted.show(error.response.data
                        ? error.response.data.error.message : error, { type: 'error' })
                } else {
                    this.$toasted.show(error, { type: 'error' })
                }
            })
        },
        closeModal () {
            this.$refs.announceBridgeModal.hide()
        }
    }
}
</script>
