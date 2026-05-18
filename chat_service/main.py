from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from database import Base, engine
from mongo import ensure_indexes, archive_stats
from routes import router

Base.metadata.create_all(bind=engine)
ensure_indexes()

app = FastAPI(
    title="MoozTau Chat Service",
    description="Сервис обмена сообщениями между пользователями MoozTau",
    version="1.0.0",
)

Instrumentator(
    excluded_handlers=["/health", "/health/full", "/metrics"],
).instrument(app).expose(app, endpoint="/metrics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "chat-service", "version": "1.0.0"}


@app.get("/health/full")
def health_full():
    """Deep health check — verifies both Postgres and MongoDB are reachable."""
    pg_ok = True
    try:
        from database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    except Exception:
        pg_ok = False

    mongo_stats = archive_stats()
    mongo_ok = mongo_stats.get("mongo_status") == "connected"

    return {
        "status": "ok" if (pg_ok and mongo_ok) else "degraded",
        "postgres": "ok" if pg_ok else "down",
        "mongo": "ok" if mongo_ok else "down",
        "archive": mongo_stats,
    }
