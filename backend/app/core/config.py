from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # === Environment-based values ===
    SECRET_KEY: str = Field("super_secret_key", env="SECRET_KEY")
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL:str=Field(...,env="REDIS_URL")

    # === App constants ===
    api_base_path: str = "/api/v1"
    access_token_expire_minutes: int = 60 * 24  # 1 day
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        from_attributes = True


settings = Settings()
