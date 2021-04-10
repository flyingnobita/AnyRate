## Setup

`yarn install`  
See `hardhat.config.json`

## Compile Contracts for Ethereum

`yarn hardhat compile`

## Test

`yarn hardhat test`

## Start Hardhat Node

```shell
npx hardhat node
```

## Deploy

```shell
#  example
npx hardhat run --network localhost scripts/deploy_BillingFactory.js
```

### Deploy to Kovan

```shell
#  example
npx hardhat run scripts/deploy_BillingFactory.js --network kovan
```
