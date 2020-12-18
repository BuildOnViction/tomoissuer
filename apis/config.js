'use strict'
const express = require('express')
const config = require('config')
const router = express.Router()

router.get('/', async function (req, res, next) {
    let appConfig = {}
    appConfig.blockchain = config.get('blockchain')
    appConfig.etherChain = config.get('etherChain')
    let tomoscanUrl = config.get('tomoscanUrl')
    if (tomoscanUrl[tomoscanUrl.length - 1] === '/') {
        tomoscanUrl = tomoscanUrl.substr(0, tomoscanUrl.length - 1)
    }
    appConfig.tomoscanUrl = tomoscanUrl
    appConfig.tomowalletUrl = config.get('tomowalletUrl')
    appConfig.etherscanAPI = config.get('etherscanAPI')
    appConfig.coingeckoAPI = config.get('coingeckoAPI')
    appConfig.tomobridgeAPI = config.get('tomobridgeAPI')
    return res.json(appConfig)
})

module.exports = router
