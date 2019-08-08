'use strict'
const express = require('express')
const config = require('config')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const fs = require('fs')
const path = require('path')
const solc = require('solc')
const axios = require('axios')
const web3 = require('../models/blockchain/web3')
const md5 = require('blueimp-md5')
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

// function createContract (name) {
//     try {
//         const p = path.resolve(__dirname, '../contracts', 'TRC21.sol')
//         const contractTemplate = fs.readFileSync(p, 'UTF-8')
//         // const newContract = contractTemplate.replace('MyTRC21', name)
//         // return newContract
//         return contractTemplate
//     } catch (error) {
//         throw error
//     }
// }

router.post('/createToken', [
    check('name').exists().withMessage("'name' is required"),
    check('symbol').exists().withMessage("'symbol' is required"),
    check('decimals').exists().withMessage("'decimal' is required"),
    check('totalSupply').exists().withMessage("'totalSupply' is required"),
    check('type').exists().withMessage("'type' is required")
        .isIn(['trc20', 'trc21']).withMessage("'type' should be 'trc20' or 'trc21'"),
    check('minFee').isFloat({ min: 0 }).exists().withMessage("'minFee' is required"),
    check('mintable').exists().isBoolean().withMessage("'mintable' must be true or false")
], async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }

    const name = req.body.name
    const symbol = req.body.symbol
    const decimals = req.body.decimals
    const totalSupply = req.body.totalSupply
    const type = req.body.type
    const minFee = req.body.minFee
    const mintable = req.body.mintable
    // create contract
    // const contractCode = createContract(name)
    let contractCode
    let p
    if (mintable) {
        p = path.resolve(__dirname, '../contracts', 'TRC21Mintable.sol')
        contractCode = fs.readFileSync(p, 'UTF-8')
    } else {
        p = path.resolve(__dirname, '../contracts', 'TRC21.sol')
        contractCode = fs.readFileSync(p, 'UTF-8')
    }
    return res.json({
        name,
        symbol,
        decimals,
        totalSupply,
        type,
        minFee,
        contractCode
    })
})

router.post('/compileContract', [
    check('sourceCode').exists().withMessage("'sourceCode' is required"),
    check('estimate').optional().isBoolean().withMessage("'estimate' mus be true of false"),
    check('mintable').optional().isBoolean().withMessage("'mintable' mus be true of false")
], async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }
    try {
        const estimate = req.body.estimate
        const mintable = req.body.mintable
        let sourceCode
        let bytecode
        let abi
        if (estimate) {
            const p = path.resolve(__dirname, '../contracts', 'TRC21.sol')
            sourceCode = fs.readFileSync(p, 'UTF-8')
        } else {
            sourceCode = req.body.sourceCode
        }
        let contract
        const compiledContract = solc.compile(sourceCode, 1)
        if (mintable) {
            contract = compiledContract.contracts['MyTRC21Mintable'] ||
                compiledContract.contracts[':' + 'MyTRC21Mintable']
        } else {
            contract = compiledContract.contracts['MyTRC21'] || compiledContract.contracts[':' + 'MyTRC21']
        }
        bytecode = contract.bytecode
        abi = JSON.parse(contract.interface)

        return res.json({
            bytecode,
            abi
        })
    } catch (error) {
        return next(error)
    }
})

router.get('/getABI', [], async (req, res, next) => {
    try {
        let p
        const type = req.query.type || ''
        if (type === 'mintable') {
            p = path.resolve(__dirname, '../build/contracts', 'MyTRC21Mintable.json')
            const data = fs.readFileSync(p, 'UTF-8')
            if (data) {
                return res.json({
                    abi: JSON.parse(data).abi
                })
            }
        } else {
            p = path.resolve(__dirname, '../build/contracts', 'MyTRC21.json')
            const data = fs.readFileSync(p, 'UTF-8')
            if (data) {
                return res.json({
                    abi: JSON.parse(data).abi
                })
            }
        }
    } catch (error) {
        console.log(error)
        return next(error)
    }
})

router.get('/soljsons', async (req, res, next) => {
    try {
        let versions
        // get compiler versions
        const { data } = await axios.get(
            'https://ethereum.github.io/solc-bin/bin/list.json'
        )

        versions = Object.values(data.releases)

        return res.json(versions)
    } catch (e) {
        return next(e)
    }
})

router.post('/verifyContract', [
    check('contractAddress').exists().withMessage("'contractAddress' is required"),
    check('contractName').exists().withMessage("'contractName' is required"),
    check('sourceCode').exists().withMessage("'sourceCode' is required"),
    check('isOptimize').isIn(['0', '1']).exists().withMessage("'isOptimize' is required"),
    check('version').exists().withMessage("'version' is required")
], async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }
    try {
        const address = req.body.contractAddress
        const name = req.body.contractName
        const code = req.body.sourceCode
        const isOptimize = req.body.isOptimize
        const version = req.body.version

        const bytecode = await web3.eth.getCode(address)
        solc.loadRemoteVersion(version, (error, snapshot) => {
            if (error) {
                return next(Error('Cannot load remote version'))
            }
            const compiledContract = snapshot.compile(code, isOptimize)

            const contract = compiledContract.contracts[name] || compiledContract.contracts[':' + name]
            if (!contract) {
                return next(Error('Contract Name is invalid'))
            }
            let runtimeBytecode = '0x' + contract.runtimeBytecode

            if (md5(runtimeBytecode.slice(0, -100)) !== md5(bytecode.slice(0, -100))) {
                return next(Error(`Bytecode invalid
                    Try to turn ${isOptimize === '0' ? 'On' : 'Off'} Optimization`))
            }
            return res.send('Verified!')
        })
    } catch (error) {
        return next(error)
    }
})

router.get('/search', [], async (req, res, next) => {
    try {
        const query = req.query.query || ''
        const callQuery = {
            query,
            type: 'trc21',
            limit: 20,
            page: 1
        }

        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/tokens/search?${serializeQuery(callQuery)}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.post('/announceRelayer', [
    check('tokenName').exists().withMessage("'tokenName' is required"),
    check('tokenSymbol').exists().withMessage("'tokenSymbol' is required"),
    check('totalSupply').isInt().exists().withMessage("'totalSupply' is required"),
    check('address').exists().isLength({ min: 42, max: 42 }).withMessage("'address' is required")
], async (req, res, next) => {
    try {
        const name = req.body.tokenName || ''
        const symbol = req.body.tokenSymbol || ''
        const totalSupply = req.body.totalSupply || ''
        const address = req.body.address || ''
        const body = [
            {
                name,
                symbol,
                total_supply: totalSupply,
                address
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
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.get('/:token', [], async (req, res, next) => {
    try {
        const token = req.params.token || ''
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/tokens/${token}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.get('/holders/trc21/:token', [], async (req, res, next) => {
    try {
        const token = req.params.token || ''
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/token-holders/trc21/?address=${token}&page=${page}&limit=${limit}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})
router.get('/holders/:token', [], async (req, res, next) => {
    try {
        const token = req.params.token || ''
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/token-holders/?address=${token}&page=${page}&limit=${limit}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})
router.get('/txes/trc20/:token', [], async (req, res, next) => {
    try {
        const token = req.params.token || ''
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/token-txs/trc20?token=${token}&page=${page}&limit=${limit}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.get('/txes/trc21/:token', [], async (req, res, next) => {
    try {
        const token = req.params.token || ''
        const page = req.query.page || 1
        const limit = req.query.limit || 20
        const { data } = await axios.get(
            urljoin(config.get('tomoscanAPI'), `/api/token-txs/trc21?token=${token}&page=${page}&limit=${limit}`)
        )
        return res.json(data)
    } catch (error) {
        return next(error)
    }
})

router.get('/getLogo/:token', [], async (req, res, next) => {
    try {
        const token = req.params.token || ''
        const response = await axios.get(
            urljoin(config.get('tokenListAPI'), `${token}.png`)
        )

        if (response.data) {
            return res.json({
                image: urljoin(config.get('tokenListAPI'), `${token}.png`)
            })
        }
    } catch (error) {
        return res.json({
            image: false
        })
    }
})

module.exports = router
