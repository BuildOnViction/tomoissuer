'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var User = new Schema({
    address: {
        type: String,
        index: true,
        unique: true
    }
}, { timestamps: true })

module.exports = mongoose.model('User', User)
