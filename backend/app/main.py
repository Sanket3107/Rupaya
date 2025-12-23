from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    RupayaException,
    UnauthorizedError,
    ValidationError,
)
from app.db import prisma
from app.routers import auth, bills, groups, users

app = FastAPI(title="Rupaya API", openapi_url=f"{settings.api_base_path}/openapi.json")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await prisma.connect()


@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()


@app.exception_handler(RupayaException)
async def rupaya_exception_handler(request: Request, exc: RupayaException):
    status_code = 500
    if isinstance(exc, NotFoundError):
        status_code = 404
    elif isinstance(exc, UnauthorizedError):
        status_code = 401
    elif isinstance(exc, ForbiddenError):
        status_code = 403
    elif isinstance(exc, ConflictError):
        status_code = 409
    elif isinstance(exc, ValidationError):
        status_code = 400

    return JSONResponse(
        status_code=status_code,
        content={"detail": exc.message},
    )


app.include_router(auth.router, prefix=settings.api_base_path)
app.include_router(users.router, prefix=settings.api_base_path)
app.include_router(groups.router, prefix=settings.api_base_path)
app.include_router(bills.router, prefix=settings.api_base_path)


@app.get("/")
async def root():
    return {"message": "Rupaya API running 🚀", "docs": "/docs", "version": "v1"}

