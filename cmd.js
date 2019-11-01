const commander = require('commander')
const { deployToken } = require('./commands/deployToken')

commander
    .version('0.1.0')
    .description('TomoIssuer Management Commands')

commander
    .command('deploy-token')
    .description('Deploy a token, apply tomoz, x')
    .option('-n, --name <name>', 'Token name')
    .option('-s, --symbol <symbol>', 'Token symbol')
    .option('-t, --totalSupply <totalSupply>', 'Total supply')
    .option('-d, --decimals <decimals>', 'Decimals')
    .action(async (input) => {
        const name = input.name || null
        const symbol = input.symbol || null
        const totalSupply = input.totalSupply || null
        const decimals = input.decimals || null
        await deployToken(name, symbol, totalSupply, decimals)
        process.exit()
    })

commander.parse(process.argv)
