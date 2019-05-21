'use strict'
const express = require('express')
// const config = require('config')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const fs = require('fs')
const path = require('path')

function createContract (name) {
    try {
        const p = path.resolve(__dirname, '../contracts', 'TRC21.sol')
        const contractTemplate = fs.readFileSync(p, 'UTF-8')
        const newContract = contractTemplate.replace('MyTRC21', name)
        return newContract
    } catch (error) {
        throw error
    }
}

router.post('/createToken', [
    check('name').exists().withMessage("'name' is required"),
    check('symbol').exists().withMessage("'symbol' is required"),
    check('decimal').exists().withMessage("'decimal' is required"),
    check('totalSupply').exists().withMessage("'totalSupply' is required"),
    check('type').exists().withMessage("'type' is required")
        .isIn(['trc20', 'trc21']).withMessage("'type' should be 'trc20' or 'trc21'"),
    check('minFee').isInt({ min: 0 }).exists().withMessage("'minFee' is required")
], async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }

    const name = req.body.name
    const symbol = req.body.symbol
    const decimal = req.body.decimal
    const totalSupply = req.body.totalSupply
    const type = req.body.type
    const minFee = req.body.minFee
    // create contract
    const contractCode = createContract(name)
    return res.send({
        name,
        symbol,
        decimal,
        totalSupply,
        type,
        minFee,
        contractCode
    })
})

module.exports = router
