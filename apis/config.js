'use strict'
const express = require('express')
const router = express.Router()

router.get('/', async function (req, res, next) {
    let appConfig = {}
    return res.json(appConfig)
})

module.exports = router
