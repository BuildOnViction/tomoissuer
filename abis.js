'use strict'

const fs = require('fs')

// copy & save TRC21Issuer
let TRC21IssuerAbi = require('./build/contracts/TRC21Issuer.json')
let data = JSON.stringify(TRC21IssuerAbi, null, 2)
fs.writeFileSync('./abis/TRC21Issuer.json', data)

// copy & save TOMOXListing
let TOMOXListingAbi = require('./build/contracts/TOMOXListing.json')
data = JSON.stringify(TOMOXListingAbi, null, 2)
fs.writeFileSync('./abis/TOMOXListingAbi.json', data)

// copy & save Migrations
let MigrationsAbi = require('./build/contracts/Migrations.json')
data = JSON.stringify(MigrationsAbi, null, 2)
fs.writeFileSync('./abis/Migrations.json', data)

// copy & save SafeMath
let SafeMathAbi = require('./build/contracts/SafeMath.json')
data = JSON.stringify(SafeMathAbi, null, 2)
fs.writeFileSync('./abis/SafeMath.json', data)
