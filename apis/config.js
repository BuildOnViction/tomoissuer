'use strict'
const express = require('express')
const config = require('config')
const router = express.Router()

router.get('/', async function (req, res, next) {
    let appConfig = {}
    appConfig.blockchain = config.get('blockchain')
    let tomoscanUrl = config.get('tomoscanUrl')
    if (tomoscanUrl[tomoscanUrl.length - 1] === '/') {
        tomoscanUrl = tomoscanUrl.substr(0, tomoscanUrl.length - 1)
    }
    appConfig.tomoscanUrl = tomoscanUrl
    let tomowallet = config.get('tomowalletUrl')
    if (tomowallet[tomowallet.length - 1] === '/') {
        tomowallet = tomowallet.substr(0, tomowallet.length - 1)
    }
    appConfig.tomowalletUrl = tomowallet

    let tomorelayerAPI = config.get('tomorelayerAPI')
    if (tomorelayerAPI[tomorelayerAPI.length - 1] === '/') {
        tomorelayerAPI = tomorelayerAPI.substr(0, tomorelayerAPI.length - 1)
    }
    appConfig.tomorelayerAPI = tomorelayerAPI

    let tokenListAPI = config.get('tokenListAPI')
    if (tokenListAPI[tokenListAPI.length - 1] === '/') {
        tokenListAPI = tokenListAPI.substr(0, tokenListAPI.length - 1)
    }
    appConfig.tokenListAPI = tokenListAPI
    return res.json(appConfig)
})

module.exports = router
