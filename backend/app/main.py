from fastapi import FastAPI
from app.db import prisma
from app.routers import auth

app = FastAPI()

@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Rupaya API running 🚀"}

