# kratos-react

Just playing around with [ORY Kratos](https://www.ory.sh/kratos) and react.

Requirements:

* [mkcert](https://github.com/FiloSottile/mkcert) after installation remember to run `mkcert -install`
* [Docker](https://docs.docker.com/engine/install/)
* [Node](https://nodejs.org/en/download/)

Setup:

`./setup.sh`

How to run:

1. start Kratos and friends with `docker-compose up`
2. start react app in `./web-app` directory with `npm start`
3. use `https://app.nipsuli.dev/`

Kratos setup is mainly based on the [quick start](https://www.ory.sh/kratos/docs/quickstart).


What works:
* sign up
* login
* logout
* settings
* fetching current user
* https locally
* bakend routed via [ory oathkeeper](https://www.ory.sh/oathkeeper/) (in dev also frontend to run with same certs easily)
* simple api testing auth / token stuff
* recovery flow
* email verification flow
* google login

