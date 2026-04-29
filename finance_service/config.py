from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_NAME: str = "mooztau_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    JWT_SECRET: str = "mooztau-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"


settings = Settings()
