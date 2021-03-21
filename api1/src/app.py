import os
import json

import httpx
import jwt
from fastapi import FastAPI, Request


def get_env_or_raise(key):
    val = os.getenv(key)
    if val is None:
        raise ValueError(f'No env variable: {key}')
    return val


OATHKEEPER_HOST = get_env_or_raise('OATHKEEPER_HOST')

keys = httpx.get(f'{OATHKEEPER_HOST}/.well-known/jwks.json').json()['keys']
public_keys = {k['kid']: jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(k)) for k in keys}

app = FastAPI()

@app.get("/")
def index():
    return {"Hello": "World"}


@app.get("/echo")
def echo(request: Request):
    return {
        "headers": request.headers
    }

@app.get("/echo/token")
def echo_token(request: Request):
    bearer, token = request.headers['authorization'].split()
    assert bearer == 'Bearer'
    kid = jwt.get_unverified_header(token)['kid']
    key = public_keys[kid]

    return {
        'payload': jwt.decode(token, key=key, algorithms=['RS512'])
    }
