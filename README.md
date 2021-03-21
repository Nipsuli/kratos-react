# kratos-react

Just playing around with [ORY Kratos](https://www.ory.sh/kratos) and react.

Setup:

Generate local dev certs generated with [mkcert](https://github.com/FiloSottile/mkcert) like:

```
host=*.nipsuli.dev
mkcert -cert-file certs/$host.crt -key-file certs/$host.key $host
```
gitignoring these.

Adding stuff to `/etc/hosts` (idempotently)
```
grep -qF -- "127.0.0.1 gateway.nipsuli.dev" "/etc/hosts" || echo "127.0.0.1 gateway.nipsuli.dev" | sudo tee -a "/etc/hosts"
grep -qF -- "127.0.0.1 app.nipsuli.dev" "/etc/hosts" || echo "127.0.0.1 app.nipsuli.dev" | sudo tee -a "/etc/hosts"
grep -qF -- "127.0.0.1 auth.nipsuli.dev" "/etc/hosts" || echo "127.0.0.1 auth.nipsuli.dev" | sudo tee -a "/etc/hosts"
```

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

Todo:
* recovery flow
* email verification flow
* some social login
* add some api

## Random notes

Genereted JWK with:
```
docker-compose run oathkeeper credentials generate --alg RS512 > oathkeeper-config/dev/jwks.json
```

