# Incident Report — MoozTau Orders Service DB Failure

## 1. Incident Summary

**Incident ID:** INC-2026-001  
**Service affected:** `orders` (orders_service, port 8001)  
**Start time:** 2026-04-28 14:05 UTC+5  
**End time:** 2026-04-28 14:23 UTC+5  
**Duration:** ~18 minutes  
**Detection method:** Prometheus alert `ServiceDown` fired; Grafana dashboard showed orders-service error rate spike to 100%  

The `orders` microservice became completely unavailable due to an intentionally corrupted `DATABASE_URL` environment variable simulating a misconfiguration during deployment. All requests to `/orders/` returned HTTP 500.

---

## 2. Impact Assessment

| Component | Impact |
|---|---|
| Orders API (port 8001) | Fully down — all requests failed with 500 |
| Auth service | Not affected |
| Finance service | Not affected |
| Frontend | Orders page showed errors; other pages (auth, finance) worked normally |
| End users | Unable to create, view, or update orders during the incident window |
| Database | PostgreSQL was healthy; only the connection credentials were wrong |

Estimated users affected: all active users of the orders module (managers, factory workers, dealers).

---

## 3. Severity

**Severity: P1 — Critical**

Justification:
- Core business function (order management) was completely unavailable
- No degraded mode — 100% of orders requests failed
- Duration exceeded 15 minutes before recovery
- Affected multiple user roles simultaneously

---

## 4. Timeline of Events

| Time (UTC+5) | Event |
|---|---|
| 14:00 | Stack restarted with updated docker-compose.yml |
| 14:02 | auth, finance, frontend containers start normally |
| 14:03 | orders container starts, attempts DB connection |
| 14:04 | orders container crashes on startup — wrong DB credentials |
| 14:05 | Prometheus `ServiceDown` alert fires for `orders-service` |
| 14:05 | Grafana dashboard shows orders-service target as DOWN |
| 14:07 | On-call engineer checks `docker logs orders` — sees auth error |
| 14:10 | Root cause identified: `DATABASE_URL` has wrong host/user/pass |
| 14:15 | docker-compose.yml corrected, `docker compose up -d orders` executed |
| 14:18 | orders container starts, DB migration runs successfully |
| 14:20 | `/health` returns 200, Prometheus target turns UP |
| 14:23 | Grafana shows full recovery, alert resolved |

---

## 5. Root Cause Analysis

The `orders` service docker-compose entry was configured with a corrupted `DATABASE_URL`:

```yaml
environment:
  DATABASE_URL: postgresql://wrong_user:wrong_pass@wrong_host:5432/wrong_db
```

This caused SQLAlchemy to raise `OperationalError` on every startup attempt, preventing the service from accepting any connections. The error was introduced deliberately to simulate an environment misconfiguration during deployment — a real-world scenario where a developer accidentally sets wrong DB credentials in the staging/production `.env` or docker-compose override file.

---

## 6. Mitigation Steps

1. Identified the failing container: `docker compose ps` showed `orders` as "Exit 1"
2. Checked logs: `docker logs mooztau_back-orders-1` revealed `FATAL: password authentication failed`
3. Corrected `DATABASE_URL` in `docker-compose.yml` to match actual PostgreSQL credentials
4. Restarted only the affected service: `docker compose up -d --build orders`
5. Verified `/health` endpoint: `curl http://localhost:8001/health` → `{"status":"ok"}`
6. Confirmed Prometheus target `orders-service` returned to UP state
7. Confirmed Grafana error rate graph returned to 0%

---

## 7. Resolution Confirmation

After applying the fix:

- `GET /health` on orders service returns `{"status": "ok", "service": "orders-service", "version": "2.0.0"}`
- Prometheus target `orders-service` status: **UP**
- Grafana dashboard: error rate 0%, latency p95 < 200ms
- `ServiceDown` alert resolved automatically within 1 minute of service recovery
- All order endpoints functional: `GET /orders/`, `POST /orders/`, `GET /orders/{id}`
