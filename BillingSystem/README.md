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

## Deploy to Localhost

```shell
#  example
npx hardhat run --network localhost scripts/deploy_BillingFactory.js
```

## Deploy to Kovan

```shell
#  example
npx hardhat run --network kovan scripts/deploy_BillingFactory.js
```

## Before Using

**Billing Form -> Deploy must be pressed to call BillingFactory.createBilling() where
Treasury and Billing child contracts are created.**
