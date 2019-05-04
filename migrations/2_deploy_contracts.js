const Issuer = artifacts.require('./Issuer');
const BigNumber = require('bignumber.js');

const config = require('config');

module.exports = function(deployer) {
    return deployer.deploy(Issuer, 900, (new BigNumber(1).multipliedBy(1e+18)).toString(10));
};
