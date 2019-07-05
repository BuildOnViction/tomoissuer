<template>
    <div class="autocomplete">
        <input
            id="search-input"
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Token name or address"
            @keydown.enter="onEnter"
            @keydown.esc="onEsc"
            @keydown.down="onArrowDown"
            @keydown.up="onArrowUp" >
        <ul
            v-if="results.length > 0"
            v-show="isOpen"
            id="autocomplete-results"
            class="autocomplete-results">
            <li
                v-for="(result, i) in results"
                :key="i"
                :class="{ 'is-active': i === arrowCounter }"
                class="autocomplete-result"
                @click="setResult(result)">
                <span>{{ result.name }}</span>
                <small>{{ result.hash }}</small>
            </li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'AutoComplete',

    props: {
        items: {
            type: Array,
            required: false,
            default: () => []
        },
        isAsync: {
            type: Boolean,
            required: false,
            default: false
        },
        page: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },

    data () {
        return {
            isOpen: false,
            results: [],
            search: '',
            arrowCounter: 0
        }
    },
    watch: {
        search: async function (newValue) {
            if (newValue !== '' && newValue.length < 40) {
                this.doSearch()
            } else {
                this.results = []
            }
        }
    },
    mounted () {
        document.addEventListener('click', this.handleClickOutside)
        // document.addEventListener('keyup', this.focusSearchInput)
    },
    destroyed () {
        document.removeEventListener('click', this.handleClickOutside)
        // document.removeEventListener('click', this.focusSearchInput)
    },
    methods: {
        filterResults () {
            // first uncapitalize all the things
            if (this.search) {
                this.results = this.items.filter((item) => {
                    // search by name
                    let found = item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1

                    // search by address
                    if (!found) {
                        found = item.address.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    }

                    return found
                })
                this.results = this.results.slice(0, 5)
            }
        },
        onChange () {
            // Let's warn the parent that a change was made
            this.$emit('input', this.search)

            // Is the data given by an outside ajax request?
            if (this.isAsync) {
                this.isLoading = true
            } else {
                // Let's  our flat array
                this.filterResults()
                if (this.results.length > 0) {
                    this.isOpen = true
                    this.arrowCounter = 0
                }
            }
        },
        setResult (result) {
            this.search = ''
            this.isOpen = false
            this.search = result.name + ' ' + result.hash
            this.page.tokenAddress = result.hash
        },
        onArrowDown () {
            if (this.arrowCounter < this.results.length - 1) {
                this.arrowCounter++
            }
        },
        onArrowUp () {
            if (this.arrowCounter > 0) {
                this.arrowCounter--
            }
        },
        onEnter () {
            let result = this.results[this.arrowCounter]

            if (result) {
                this.search = ''
                this.isOpen = false
                this.arrowCounter = -1
                this.$router.push({
                    path: `/candidate/${result.address}`
                })
                document.getElementById('search-input').blur()
            }
        },
        onEsc () {
            this.isOpen = false
            this.arrowCounter = -1
            document.getElementById('search-input').blur()
        },
        handleClickOutside (evt) {
            if (!this.$el.contains(evt.target)) {
                this.isOpen = false
                this.arrowCounter = -1
            }
        },
        async doSearch () {
            const { data } = await axios.get('/api/token/search?q=' + this.search || '')
            this.results = data.items
            this.page.tokenAddress = ''
            this.isOpen = true
        }
    }
}
</script>
