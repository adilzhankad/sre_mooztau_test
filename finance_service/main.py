from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from models import Category, BankAccount, Transaction  # noqa: F401 — ensure models are registered
from routes import router

app = FastAPI(
    title="MoozTau Finance Service",
    description="Микросервис финансового учёта MoozTau: доходы, расходы, категории, счета, отчёты",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def on_startup():
    """Create only fin_* tables (finance service's own tables).
    Reference tables (users, organizations) are managed by auth_service.
    """
    fin_tables = [
        table for name, table in Base.metadata.tables.items()
        if name.startswith("fin_")
    ]
    Base.metadata.create_all(bind=engine, tables=fin_tables)


@app.get("/health")
def health():
    return {"status": "ok", "service": "mooztau-finance", "version": "1.0.0"}
