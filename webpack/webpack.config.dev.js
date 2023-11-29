var path = require('path')
var appName = '[name].js'
const commonConfig = require('./webpack.config.common')
const merge = require('webpack-merge')
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})
const webpack = require('webpack')
const webpackConfig = merge(commonConfig, {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, '../build'),
        publicPath: '/build/',
        filename: appName
        // chunkFilename: 'chunks/[chunkhash].js',
        // jsonpFunction: 'pluginWebpack'
    },
    devServer: {
        compress: true,
        historyApiFallback: true,
        noInfo: true,
        overlay: true,
        proxy: {
            '/api/*': 'http://localhost:3001',
            secure: false
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"development"',
                RPC_ENDPOINT: `${JSON.stringify(process.env.VUE_APP_RPC_ENDPOINT)}`,
                CHAIN_ID: `${JSON.stringify(process.env.VUE_APP_CHAIN_ID)}`
            }
        })
    ]
})

module.exports = webpackConfig
