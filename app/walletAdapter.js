
import Web3 from 'web3'
const supportedWalletOption = [{
    chainId: '0x' + parseInt(process.env.CHAIN_ID).toString(16),
    chainName: 'Viction',
    nativeCurrency: {
        name: 'VIC',
        symbol: 'VIC',
        decimals: 18
    },
    rpcUrls: [process.env.RPC_ENDPOINT]
}]

// override order: coin98 > viction > ramper > metamask
export default {

    WALLET_TYPE: Object.freeze({
        COIN98: 'coin98',
        VICTION: 'viction',
        RAMPER: 'ramper',
        METAMASK: 'metamask',
        LEDGER: 'ledger',
        TREZOR: 'trezor'
    }),
    connectCoin98: async () => {
        let provider = null
        if (window.coin98) {
            provider = window.coin98.provider
        }
        if (provider) {
            const chainId = await provider.request({
                method: 'net_version'
            })
            try {
                if (parseInt(supportedWalletOption[0].chainId) !== parseInt(chainId)) {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: supportedWalletOption
                    })
                }
                const accounts = await provider.request({
                    method: 'eth_requestAccounts'
                })
                return accounts[0]
            } catch (error) {
                console.log(error)
                return { error: `Unable to connect Coin98: ${error.message}` }
            }
        } else {
            return { error: 'Please install Coin98 wallet' }
        }
    },

    connectViction: async () => {
        let provider = null
        if (window.coin98) {
            provider = window.coin98.provider
        } else if (window.viction) {
            provider = window.viction
        }
        if (provider) {
            try {
                const accounts = await provider.request({
                    method: 'eth_requestAccounts'
                })
                return accounts[0]
            } catch (error) {
                console.log(error)
                return { error: `Unable to connect Viction: ${error.message}` }
            }
        } else {
            return { error: 'Please install Viction' }
        }
    },

    connectRamper: async () => {
        let provider = null
        if (window.coin98) {
            provider = window.coin98.provider
        } else if (window.viction) {
            provider = window.viction
        } else if (window.ramper2) {
            provider = window.ramper2.provider
        }
        if (provider) {
            const chainId = await provider.request({
                method: 'net_version'
            })
            try {
                if (parseInt(supportedWalletOption[0].chainId) !== parseInt(chainId)) {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: supportedWalletOption
                    })
                }
                const accounts = await provider.request({
                    method: 'eth_requestAccounts'
                })
                return accounts[0]
            } catch (error) {
                console.log(error)
                return { error: `Unable to connect Ramper: ${error.message}` }
            }
        } else {
            return { error: 'Please install Ramper' }
        }
    },

    connectMetamask: async () => {
        let provider = null
        if (window.coin98) {
            provider = window.coin98.provider
        } else if (window.viction) {
            provider = window.viction
        } else if (window.ramper2) {
            provider = window.ramper2.provider
        } else if (window.ethereum) {
            provider = window.ethereum
        }
        if (provider) {
            const chainId = await provider.request({
                method: 'net_version'
            })
            try {
                if (parseInt(supportedWalletOption[0].chainId) !== parseInt(chainId)) {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: supportedWalletOption
                    })
                }
                const accounts = await provider.request({
                    method: 'eth_requestAccounts'
                })
                return accounts[0]
            } catch (error) {
                console.log(error)
                return { error: `Unable to connect Metamask: ${error.message}` }
            }
        } else {
            return { error: 'Please install Metamask' }
        }
    },
    loadCoin98Provider: async () => {
        let wjs = null
        if (window.coin98) {
            wjs = new Web3(window.coin98.provider)
        }
        return wjs
    },
    loadVictionProvider: async () => {
        let wjs = null
        if (window.coin98) {
            wjs = new Web3(window.coin98.provider)
        } else if (window.viction) {
            wjs = new Web3(window.viction)
        }
        return wjs
    },
    loadRamperProvider: async () => {
        let wjs = null
        if (window.coin98) {
            wjs = new Web3(window.coin98.provider)
        } else if (window.viction) {
            wjs = new Web3(window.viction)
        } else if (window.ramper2) {
            wjs = new Web3(window.ramper2.provider)
        }
        return wjs
    },
    loadMetamaskProvider: async () => {
        let wjs = null
        if (window.coin98) {
            wjs = new Web3(window.coin98.provider)
        } else if (window.viction) {
            wjs = new Web3(window.viction)
        } else if (window.ramper2) {
            wjs = new Web3(window.ramper2.provider)
        } else if (window.ethereum) {
            wjs = new Web3(window.ethereum)
        }
        return wjs
    }

}
