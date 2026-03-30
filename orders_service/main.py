from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from routers import products, prices, orders, factory, analytics

app = FastAPI(
    title="MoozTau Orders Service API",
    description="Сервис заказов, продуктов и производства MoozTau",
    version="2.0.0",
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

# Include routers
app.include_router(products.router)
app.include_router(prices.router)
app.include_router(orders.router)
app.include_router(factory.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "orders-service", "version": "2.0.0"}
