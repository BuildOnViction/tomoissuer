'use strict'
const web3rpc = require('./models/blockchain/web3')
const Web3ws = require('./models/blockchain/web3ws')
// const Issuer = require('./models/blockchain/issuer')
// const config = require('config')
const db = require('./models/mongodb')
const logger = require('./helpers/logger')
const BigNumber = require('bignumber.js')

// const issuer = new Issuer(web3)

let web3 = new Web3ws()
let watchBlock = 0

/* eslint-disable max-len */
const invalidChars = /((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g // eslint-disable-line no-control-regex

const invalidChars2 = new RegExp(
    '([\\x7F-\\x84]|[\\x86-\\x9F]|[\\uFDD0-\\uFDEF]|(?:\\uD83F[\\uDFFE\\uDFFF])|(?:\\uD87F[\\uDF' +
    'FE\\uDFFF])|(?:\\uD8BF[\\uDFFE\\uDFFF])|(?:\\uD8FF[\\uDFFE\\uDFFF])|(?:\\uD93F[\\uDFFE\\uD' +
    'FFF])|(?:\\uD97F[\\uDFFE\\uDFFF])|(?:\\uD9BF[\\uDFFE\\uDFFF])|(?:\\uD9FF[\\uDFFE\\uDFFF])' +
    '|(?:\\uDA3F[\\uDFFE\\uDFFF])|(?:\\uDA7F[\\uDFFE\\uDFFF])|(?:\\uDABF[\\uDFFE\\uDFFF])|(?:\\' +
    'uDAFF[\\uDFFE\\uDFFF])|(?:\\uDB3F[\\uDFFE\\uDFFF])|(?:\\uDB7F[\\uDFFE\\uDFFF])|(?:\\uDBBF' +
    '[\\uDFFE\\uDFFF])|(?:\\uDBFF[\\uDFFE\\uDFFF])(?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\' +
    'uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|' +
    '(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))', 'g')

const tokenFuncs = {
    'decimals': '0x313ce567', // hex to decimal
    'symbol': '0x95d89b41', // hex to ascii
    'totalSupply': '0x18160ddd',
    'name': '0x06fdde03',
    'minFee': '0x24ec7590'
}

function checkIsToken (code) {
    for (let name in tokenFuncs) {
        let codeCheck = tokenFuncs[name]
        codeCheck = codeCheck.replace('0x', '')
        if (code.indexOf(codeCheck) >= 0) {
            return true
        }
    }

    return false
}

function removeXMLInvalidChars (string, removeDiscouragedChars = true) {
    // remove everything forbidden by XML 1.0 specifications, plus the unicode replacement character U+FFFD
    string = string.replace(invalidChars, '')

    if (removeDiscouragedChars) {
        // remove everything not suggested by XML 1.0 specifications

        string = string.replace(invalidChars2, '')
    }

    return string.trim()
}

async function watchIssuer () {
    let blockNumber = watchBlock || await web3.eth.getBlockNumber()
    try {
        logger.info('Issuer crawling tokens from block %s', blockNumber)

        const blk = await web3.eth.getBlock(blockNumber)
        if (blk) {
            const txes = blk.transactions
            if (txes && txes.length > 0) {
                const map = txes.map(async t => {
                    let receipt = await web3.eth.getTransactionReceipt(t)
                    let attempt = 0
                    while (!receipt && attempt < 3) {
                        receipt = await web3.eth.getTransactionReceipt(t)
                        attempt++
                    }
                    // check contract address
                    if (receipt && receipt.contractAddress) {
                        const contractAddress = receipt.contractAddress.toLowerCase()
                        // check contract
                        const code = await web3.eth.getCode(contractAddress)
                        if (code !== '0x') {
                            // check token
                            const isToken = checkIsToken(code)
                            if (isToken) {
                                logger.info('Crawling token %s', contractAddress)
                                const promises = await Promise.all([
                                    web3rpc.eth.call({ to: contractAddress, data: tokenFuncs['name'] }),
                                    web3rpc.eth.call({ to: contractAddress, data: tokenFuncs['symbol'] }),
                                    web3rpc.eth.call({ to: contractAddress, data: tokenFuncs['decimals'] }),
                                    web3rpc.eth.call({ to: contractAddress, data: tokenFuncs['totalSupply'] }),
                                    web3rpc.eth.call({ to: contractAddress, data: tokenFuncs['minFee'] })
                                ])
                                const name = promises[0]
                                const symbol = promises[1]
                                const decimals = promises[2]
                                const totalSupply = promises[3]
                                const minFee = promises[4]

                                const token = {}
                                token.address = contractAddress
                                token.name = removeXMLInvalidChars(web3.eth.utils.toUtf8(name))
                                token.symbol = removeXMLInvalidChars(web3.eth.utils.toUtf8(symbol))
                                token.decimals = parseInt(await web3.utils.hexToNumberString(decimals))
                                token.totalSupply = await web3.utils.hexToNumberString(totalSupply)
                                token.totalSupplyNumber = new BigNumber(token.totalSupply).div(10 ** parseInt(token.decimals)).toNumber()
                                // type of token
                                if (minFee && minFee !== '0x') {
                                    token.type = 'trc21'
                                } else { token.type = 'trc20' }
                                token.contractCreator = receipt.from

                                // store db
                                await db.Token.findOneAndUpdate({
                                    address: contractAddress
                                }, token, { upsert: true })
                            }
                        }
                    }
                })
                return Promise.all(map)
            }
        }
    } catch (error) {
        logger.error('watchIssuer error %s', error)
        watchBlock = blockNumber
        web3 = new Web3ws()
    }
}

async function watchNewBlock (n) {
    try {
        let blockNumber = await web3.eth.getBlockNumber()
        n = n || blockNumber
        if (blockNumber > n) {
            await watchIssuer()
            n++
            blockNumber = n
        }
    } catch (error) {
        console.log(error)
    }
    return watchNewBlock(n)
}

watchNewBlock()
