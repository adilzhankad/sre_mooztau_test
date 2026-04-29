# Postmortem — MoozTau Orders Service Outage (INC-2026-001)

**Date:** 2026-04-28  
**Authors:** MoozTau Platform Team  
**Status:** Resolved  

---

## 1. Incident Overview

On 2026-04-28, the MoozTau orders microservice experienced a complete outage lasting approximately 18 minutes (14:05–14:23 UTC+5). The root cause was a misconfigured `DATABASE_URL` environment variable containing wrong credentials, which prevented the service from connecting to PostgreSQL. The issue was detected via Prometheus alerting and resolved by correcting the environment variable and restarting the container.

---

## 2. Customer Impact

| User Group | Impact |
|---|---|
| Dealers (DEALER_ADMIN, DEALER_MANAGER) | Could not create or view orders |
| Factory workers (FACTORY_ADMIN, FACTORY_WORKER) | Could not access production queue |
| Administrators (SUPER_ADMIN) | Orders module unavailable; auth and finance modules worked |
| End customers | No direct user-facing frontend shown orders, showing errors |

Auth (login) and finance features remained operational throughout the incident.

---

## 3. Root Cause Analysis — 5 Whys

| # | Why? | Answer |
|---|---|---|
| 1 | Why was the orders service unavailable? | It crashed on startup due to DB connection failure |
| 2 | Why did the DB connection fail? | `DATABASE_URL` had wrong credentials (wrong_user / wrong_pass / wrong_host) |
| 3 | Why were wrong credentials in the environment? | docker-compose.yml was manually edited and incorrect values were applied |
| 4 | Why wasn't this caught before deployment? | No pre-deployment validation of environment variable correctness |
| 5 | Why is there no validation? | The deployment process had no automated config health checks before `docker compose up` |

**Root cause:** Absence of pre-deployment environment validation allowed a misconfigured `DATABASE_URL` to reach the production container, causing immediate startup failure.

---

## 4. Detection & Response Evaluation

**Was monitoring effective?**  
Yes. Prometheus detected the service going down within 1 minute via the `ServiceDown` alert rule (`up == 0` for 1 minute). Grafana's dashboard clearly showed the transition from UP to DOWN.

**Was response time acceptable?**  
Response was within SLA. Identification of root cause took ~5 minutes after alert fired; total resolution time was 18 minutes.

**What could have been faster?**  
- A runbook for "orders service won't start" would have eliminated the 3-minute investigation phase
- An automated pre-flight check (validate DB connection before starting the service) would have caught this at deploy time, preventing the outage entirely

---

## 5. Resolution Summary

1. Identified the container failure state via `docker compose ps`
2. Read container logs revealing the PostgreSQL authentication error
3. Corrected `DATABASE_URL` in `docker-compose.yml` to use proper credentials from `.env`
4. Restarted the orders service: `docker compose up -d orders`
5. Verified full recovery via health endpoint and Grafana metrics

---

## 6. Lessons Learned

1. **Environment variable misconfiguration is a high-risk deployment failure mode** — a single wrong value can bring down an entire service with no graceful degradation. Services should validate critical config at startup and emit clear, structured error messages.

2. **Per-service deployment readiness checks are necessary** — simply running `docker compose up -d` gives no guarantee that services started correctly. A post-deploy health check script that polls `/health` endpoints for each service would catch failures immediately.

3. **Monitoring alone is not enough — runbooks matter** — the Prometheus alert fired correctly, but the team had to investigate from scratch. A documented runbook (what to check, what commands to run) for common failure scenarios would cut MTTR significantly.

---

## 7. Action Items

| Action | Owner | Priority | Deadline |
|---|---|---|---|
| Add startup DB connectivity pre-check (`pg_isready` in entrypoint before uvicorn starts) | Backend Team | P1 | 2026-05-05 |
| Write post-deploy health check script (`scripts/healthcheck.sh`) that polls all `/health` endpoints | DevOps | P1 | 2026-05-05 |
| Create runbook: "orders service won't start" in `docs/runbooks/` | Platform Team | P2 | 2026-05-12 |
| Add `.env` validation script that checks all required variables are set before `docker compose up` | DevOps | P2 | 2026-05-12 |
| Configure Grafana alert notifications to Slack/email | Platform Team | P3 | 2026-05-19 |
