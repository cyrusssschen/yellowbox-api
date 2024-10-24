# yellowbox-api

**yellowbox-api is a monorepo built on top of [NestJS](https://nestjs.com/) by using [NX](https://nx.dev/) in [microservices](https://microservices.io/) pattern.**

# Prerequisites

Recommend the following installation:

- Install the latest version of Node/NPM ([NVM recommended](https://github.com/nvm-sh/nvm))
- Install [YARN](https://classic.yarnpkg.com/lang/en/)

## Env Variables

1. Simply copy `.env.example` file located in each folder and rename it as `.env` file.
2. Grab the appropriate private key and key ID from your firebase admin page and replace it in each `.env` file

## Build

build all 3 microservices from root folder using the follow commands

```bash
yarn install
yarn build:all
```

# Run

To `run` all 3 microservices, run this nx command in root folder:

```bash
yarn start:all
```

To run the specific service, run this command:

```bash
yarn start:booking
```

# Test

## Unit Tests

To test all microservices, run this command in root folder:

```bash
yarn test:all
```

## E2E Tests

T.B.D.

# Nx Graph

To show Nx Graph

```bash
yarn build:graph
```
