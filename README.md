## TomoIssuer

## Requirements
- NodeJS (If you get EACCES permission issue, please see: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- MongoDB
- Truffle Framework

## Config

```
cp config/default.json config/local.json
```
- Update `local.json` file to support your environment
  - Update privateKey
  - Update mongodb configuration:
      - For docker:
      `  "db": {
      "uri": "mongodb://mongodb:27017/tomoissuer"
      },
    `
      - For localhost: 
      `
      "db": {
      "uri": "mongodb://localhost:27017/tomoissuer"
    },
    `

## Install
```
npm install
truffle deploy --reset --network tomo # only use this command if you want to connect to a private network
cp abis/*json build/contracts/
```
Note: before deploying to tomochain testnet, make sure you have TOMO in the wallet. If not, get free at [https://faucet.testnet.tomochain.com](https://faucet.testnet.tomochain.com)

## Run
- Start mongodb
- Start TomoIssuer
```
npm run dev
```
For https:
```
npm run dev-https
```
The site will run at [`http://localhost:3000`](http://localhost:3000)

## Test
```
npm run test
```
Or run command
```
truffle test
```