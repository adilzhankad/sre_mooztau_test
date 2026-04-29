from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from database import Base, engine
from routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MoozTau Chat Service",
    description="Сервис обмена сообщениями между пользователями MoozTau",
    version="1.0.0",
)

Instrumentator(
    excluded_handlers=["/health", "/metrics"],
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
