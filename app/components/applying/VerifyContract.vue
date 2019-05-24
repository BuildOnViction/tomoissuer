<template>
    <div class="container">
        <b-row>
            <b-form-group
                class="mr-5"
                label="Contract Address"
                label-for="contractAddress">
                <b-form-input
                    v-model="contractAddress"
                    type="text" />
            </b-form-group>
            <b-form-group
                class="mr-5"
                label="Contract Name"
                label-for="contractName">
                <b-form-input
                    v-model="contractName"
                    type="text" />
            </b-form-group>
            <b-form-group
                class="mr-5"
                label="Compiler"
                label-for="conpiler">
                <b-form-select
                    v-model="compiler"
                    :options="compilers"
                    class="form-control"/>
            </b-form-group>
            <b-form-group
                label="Optimization"
                label-for="contractName">
                <b-form-select
                    id="type"
                    v-model="optimize"
                    class="form-control">
                    <option
                        value="1">Yes</option>
                    <option
                        value="0">No</option>
                </b-form-select>
            </b-form-group>
        </b-row>
        <b-row>
            <b-form-group
                style="width: 100%"
                label="Smart Contract Source Code"
                label-for="sourceCode">
                <b-form-textarea
                    id="textarea"
                    v-model="sourceCode"
                    placeholder="Enter smart contract source code"
                    rows="10"
                    max-rows="6" />
            </b-form-group>
            <div class="buttons text-right">
                <b-button
                    @click="verifyContract">Submit</b-button>
            </div>
        </b-row>
        <div v-if="result">{{ result }}</div>
        <div v-if="loading">Loading...</div>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'App',
    components: {},
    mixins: [],
    data () {
        return {
            account: '',
            optimize: '0',
            compilers: [],
            compiler: '',
            contractName: '',
            contractAddress: '',
            sourceCode: '',
            result: '',
            loading: false
        }
    },
    validations: {},
    computed: {},
    watch: {},
    updated () {},
    beforeDestroy () {},
    created: async function () {
        await this.getVersions()
    },
    mounted () {},
    methods: {
        async getVersions () {
            let self = this
            let { data } = await axios.get('/api/token/soljsons')
            self.versions = data

            self.compilers = data.map((version, i) => ({
                value: i,
                text: version.replace('soljson-', '').replace('.js', '')
            }))
            self.compilers.unshift({ value: '', text: '[Please select]' })
        },
        async verifyContract () {
            const self = this
            self.loading = true
            try {
                let version = self.versions[self.compiler]
                version = version.replace('soljson-', '').replace('.js', '')
                const { data } = await axios.post(
                    '/api/token/verifyContract',
                    {
                        contractAddress: self.contractAddress,
                        contractName: self.contractName,
                        version,
                        isOptimize: self.optimize,
                        sourceCode: self.sourceCode
                    }
                )
                self.result = data || data.error.message
                self.loading = false
            } catch (error) {
                console.log(error)
                self.result = error
                self.loading = false
                self.$toasted.show(error, { type: 'error' })
            }
        }
    }
}
</script>
