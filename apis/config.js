'use strict'
const express = require('express')
const config = require('config')
const router = express.Router()

router.get('/', async function (req, res, next) {
    let appConfig = {}
    appConfig.blockchain = config.get('blockchain')
    return res.json(appConfig)
})

module.exports = router
