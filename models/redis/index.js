const redis = require('redis')
const config = require('config')

const options = {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    prefix: config.get('redis.prefix')
}
if (config.get('redis.password')) {
    options.password = config.get('redis.password')
}
const cache = redis.createClient(options)

cache.getAsync = (key) => {
    return new Promise((resolve, reject) => {
        cache.get(key, (err, value) => {
            if (err) return reject(err)
            return resolve(value)
        })
    })
}

module.exports = cache
