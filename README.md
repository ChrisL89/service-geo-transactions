Service Geo Transactions
========================

The geo transactions service in Digital Commission Project. Provides the interfaces for UBET transactions to publish in, then formatted the messages and produce to kakfa.

## Dependencies
- docker
- nvm
- nodejs v8.10.0

## Before started
Before you kick off install/run this project, please execute this command to ensure your node js is in same version.

```shell
nvm install
nvm use
```

## Install
```shell
npm install
```

### Docker Build - Development
To build the local development containers, run the following command:
```shell
make build
```

## Run
```shell
npm start
```

### Running With Docker
After completing the [docker build](#docker-build---development), run the following command:
```shell
make run-docker
```

## Test
```shell
npm run test
```

## Documentation

You can follow the steps to generate the documents in [documentation readme](jsdoc/README.md). This project follows the JSDOC format in documenting.

JSDOC getting-started
http://usejsdoc.org/about-getting-started.html

**swagger.json** can be sourced by sending a GET request to
`/swagger.json` once the server is running.

**discovery links** can be retrieved by sending a GET request to
`/v1/geo-transactions`.
