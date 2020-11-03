const TRC21Issuer = artifacts.require('./TRC21Issuer')
const TOMOXListing = artifacts.require('./TOMOXListing')
const MyTRC21 = artifacts.require('./MyTRC21')
const MyTRC21Mintable = artifacts.require('./MyTRC21Mintable')
const TomoBridgeWrapToken = artifacts.require('./TomoBridgeWrapToken')
const BigNumber = require('bignumber.js')

const config = require('config');

module.exports = function(deployer) {
    return deployer.deploy(TOMOXListing).then(() => {
        return deployer.deploy(TRC21Issuer, (new BigNumber(config.get('truffle.minCapacity')).multipliedBy(1e+18)).toString(10)).then(() => {
            return deployer.deploy(MyTRC21, 'MyTRC21',
                'MyTRC21', 18, (new BigNumber(10000000).multipliedBy(1e+18)).toString(10),
                (new BigNumber(1).multipliedBy(1e+18)).toString(10)).then(() => {
                    return deployer.deploy(MyTRC21Mintable, 'MyTRC21Mintable',
                        'MyTRC21Mintable', 18, (new BigNumber(10000000).multipliedBy(1e+18)).toString(10),
                        (new BigNumber(1).multipliedBy(1e+18)).toString(10)).then(() => {
                            return deployer.deploy(
                                TomoBridgeWrapToken, ["0x33c2E732ae7dce8B05F37B2ba0CFe14c980c4Dbe"],
                                1, "BridgeToken", "BTK", 18, 0, 0, 0,
                                (new BigNumber(5).multipliedBy(10 ** 18).toString(10))).then(() => {
                                    return true
                                })
                        })
                })
        })
    })
};
