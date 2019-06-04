'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Token = new Schema({
    address: {
        type: String,
        index: true,
        unique: true
    },
    name: { type: String, index: true },
    symbol: { type: String, index: true },
    totalSupply: { type: String },
    totalSupplyNumber: Number,
    decimals: Number,
    type: String,
    contractCreator: { type: String, index: true }
}, { timestamps: true })

module.exports = mongoose.model('Token', Token)
