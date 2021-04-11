## Setup

`yarn install`  
See `hardhat.config.json`

## Compile Contracts for Ethereum

`yarn compile`

## Test

`yarn test`

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
npx hardhat run --network kovan scripts/deploy_BillingFactory.js
```
