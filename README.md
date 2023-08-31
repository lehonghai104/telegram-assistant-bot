## Description

Telegram assistant bot using [Nest](https://github.com/nestjs/nest) framework.

## Setup database

```bash
# run mongo in docker container
$ yarn mongo:init
```

## Get a telegram bot token

https://core.telegram.org/bots/api#authorizing-your-bot

## Environment

Create `.local.env` file to overwrite default environment variables that you do not wish to share with others.

```bash
cp .env .local.env
``````

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Author

- Author - [@lehonghai104](https://github.com/lehonghai104)
- Linkedin - [@lehonghai104](https://www.linkedin.com/in/lehonghai104/)

## License

[MIT licensed](LICENSE).
