from fastapi import FastAPI

app = FastAPI(title="C216 Backend")


@app.get("/")
def home():
    return {"message": "C216 backend online"}