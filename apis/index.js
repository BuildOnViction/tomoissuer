'use strict'
const express = require('express')
const router = express.Router()

router.use('/api/config', require('./config'))

module.exports = router
