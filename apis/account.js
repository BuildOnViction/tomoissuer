'use strict'
const express = require('express')
const config = require('config')
const router = express.Router()
const { check, validationResult, query } = require('express-validator/check')
const axios = require('axios')
// const web3 = require('../models/blockchain/web3')
const urljoin = require('url-join')

function serializeQuery (params, prefix) {
    const query = Object.keys(params).map((key) => {
        const value = params[key]

        if (params.constructor === Array) {
            key = `${prefix}[]`
        } else {
            if (params.constructor === Object) {
                key = (prefix ? `${prefix}[${key}]` : key)
            }
        }

        return value === 'object' ? this.serializeQuery(value, key) : `${key}=${encodeURIComponent(value)}`
    })

    return [].concat.apply([], query).join('&')
}

router.get('/:account', [
    check('account').exists().isLength({ min: 42, max: 42 }).withMessage('Account address is incorrect.')
], async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }
    try {
        const account = req.params.account.toLowerCase()
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/accounts/${account}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.get('/:account/listTokens', [
    query('limit')
        .isInt({ min: 0, max: 200 }).optional().withMessage('limit should greater than 0 and less than 200'),
    query('page').isNumeric({ no_symbols: true }).optional().withMessage('page must be number'),
    check('account').exists().isLength({ min: 42, max: 42 }).withMessage('Account address is incorrect.')
], async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }
    try {
        const account = (req.params.account || '').toLowerCase()
        const params = {
            limit: req.query.limit || 1,
            page: req.query.page || 1
        }
        const query = serializeQuery(params)
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/accounts/${account}/listTokens?${query}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

module.exports = router
