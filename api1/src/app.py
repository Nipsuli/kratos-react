from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/")
def index():
    return {"Hello": "World"}


@app.get("/echo")
def echo(request: Request):
    return {
        "headers": request.headers
    }
