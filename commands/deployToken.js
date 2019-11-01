const axios = require('axios')
const BigNumber = require('bignumber.js')
const config = require('config')
const fs = require('fs')
const Web3 = require('web3')
const PrivateKeyProvider = require('truffle-privatekey-provider')
const solc = require('solc')
const path = require('path')
const TomoXListingAritfacts = require('../build/contracts/TOMOXListing.json')
const TRC21IssuerAritfacts = require('../build/contracts/TRC21Issuer.json')
const urljoin = require('url-join')

function createContract () {
    try {
        const p = path.resolve(__dirname, '../contracts', 'TRC21Mintable.sol')
        const contractCode = fs.readFileSync(p, 'UTF-8')
        return contractCode
    } catch (error) {
        throw error
    }
}

function compileContract (contractCode) {
    try {
        const compiledContract = solc.compile(contractCode, 1)
        const contract = compiledContract.contracts['MyTRC21Mintable'] ||
            compiledContract.contracts[':' + 'MyTRC21Mintable']
        return contract
    } catch (error) {
        throw error
    }
}

async function deployContract (
    trcContract,
    web3,
    token
) {
    return new Promise(async (resolve, reject) => {
        try {
            const chainConfig = config.get('blockchain')
            const account = (await web3.eth.getAccounts())[0]

            const TRC21Contract = new web3.eth.Contract(
                trcContract.abi, null, { data: '0x' + trcContract.bytecode })
            await TRC21Contract.deploy({
                arguments: [
                    token.name,
                    token.symbol,
                    token.decimals,
                    (new BigNumber(token.totalSupply).multipliedBy(10 ** token.decimals)).toString(10),
                    (new BigNumber(0).multipliedBy(10 ** token.decimals)).toString(10) // minFee
                ]
            }).send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(chainConfig.gas),
                gasPrice: web3.utils.toHex(10000000000000)
            })
                .on('error', (error) => {
                    return reject(error)
                })
                .on('transactionHash', async (txHash) => {
                    let check = true
                    while (check) {
                        const receipt = await web3.eth.getTransactionReceipt(txHash)
                        if (receipt) {
                            check = false
                            const contractAddress = receipt.contractAddress
                            return resolve(contractAddress)
                        }
                    }
                })
        } catch (error) {
            return reject(error)
        }
    })
}

async function applyTomoZ (tokenAddress, web3, token) {
    return new Promise(async (resolve, reject) => {
        const account = (await web3.eth.getAccounts())[0]
        const chainConfig = config.get('blockchain')
        // apply tomoz
        const tomoZContract = new web3.eth.Contract(
            TRC21IssuerAritfacts.abi,
            chainConfig.issuerAddress
        )

        const txParams = {
            from: account.toLowerCase(),
            value: web3.utils.toHex(new BigNumber(10)
                .multipliedBy(10 ** 18).toString(10)),
            gasPrice: web3.utils.toHex(10000000000000),
            gas: web3.utils.toHex(chainConfig.gas),
            gasLimit: web3.utils.toHex(chainConfig.gas)
        }
        await tomoZContract.methods.apply(tokenAddress).send(txParams)
            .on('error', (error) => {
                console.log(error)
                return reject(error)
            })
            .on('transactionHash', async (txHash) => {
                let check = true
                while (check) {
                    const receipt = await web3.eth.getTransactionReceipt(txHash)
                    if (receipt) {
                        check = false
                        return resolve(txHash)
                    }
                }
            })
            .catch(error => {
                throw error
            })
    })
}

async function applyTomoX (tokenAddress, web3) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = (await web3.eth.getAccounts())[0]
            const chainConfig = config.get('blockchain')
            // apply tomox
            const tomoXContract = new web3.eth.Contract(
                TomoXListingAritfacts.abi,
                chainConfig.tomoXAddress
            )
            const txParams = {
                from: account,
                value: web3.utils.toHex(
                    (new BigNumber(100).multipliedBy(1e+18)).toString(10)
                ),
                gasPrice: web3.utils.toHex(10000000000000),
                gas: web3.utils.toHex(chainConfig.gas),
                gasLimit: web3.utils.toHex(chainConfig.gas)
            }

            await tomoXContract.methods.apply(tokenAddress).send(txParams)
                .on('error', (error) => {
                    return reject(error)
                })
                .on('transactionHash', async (txHash) => {
                    let check = true
                    while (check) {
                        const receipt = await web3.eth.getTransactionReceipt(txHash)
                        if (receipt) {
                            check = false
                            return resolve(txHash)
                        }
                    }
                })
        } catch (error) {
            if (error.data) {
                return reject(JSON.stringify(error.data))
            } else { return reject(error) }
        }
    })
}

async function announceRelayer (tokenAddress, token) {
    try {
        const body = [
            {
                name: token.name,
                symbol: token.symbol,
                total_supply: token.totalSupply,
                address: tokenAddress
            }
        ]
        const requestConfig = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + config.get('relayerAuthorityKey')
            }
        }
        const { data } = await axios.post(
            urljoin(config.get('tomorelayerAPI'), '/api/token'),
            body,
            requestConfig
        )
        if (data) {
            return 'Done'
        }
    } catch (error) {
        throw error
    }
}

async function deployToken (tokenName, tokenSymbol, totalSupply, decimals) {
    try {
        if (!tokenName || !tokenSymbol || !totalSupply || !decimals) {
            throw new Error('tokenName, tokenSymbol, totalSupply and decimals are required')
        }
        const chainConfig = config.get('blockchain')

        const walletProvider = new PrivateKeyProvider(config.get('truffle.privateKey'), chainConfig.rpc)
        const web3 = new Web3(walletProvider)
        // const web3 = new Web3(new Web3.providers.HttpProvider(chainConfig.ws))
        // const account = (await web3.eth.getAccounts())[0]

        console.log('Creating contract')
        const contractCode = createContract()
        console.log('Compiling contract')
        const contract = compileContract(contractCode)

        const bytecode = contract.bytecode
        const abi = JSON.parse(contract.interface)

        const trcContract = {
            abi, bytecode
        }

        const token = {
            name: tokenName,
            symbol: tokenSymbol,
            totalSupply: totalSupply,
            decimals: decimals
        }
        console.log('Deploying contract')

        const contractAddress = await deployContract(
            trcContract,
            web3,
            token
        )
        console.log('contract address', contractAddress)
        // apply tomo z
        console.log('Applying tomo z')
        const res = await applyTomoZ(contractAddress, web3, token)
        console.log('hash: ', res)
        console.log('Applying tomo x')
        // apply tomox
        const result = await applyTomoX(contractAddress.toLowerCase(), web3)
        // announce relayer
        if (result) {
            console.log('hash: ', result)
            console.log('Announce relayer')
            const result2 = await announceRelayer(contractAddress, token)
            console.log(result2)
            return result2
        }
    } catch (error) {
        throw error
    }
}

module.exports = { deployToken }
