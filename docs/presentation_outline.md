# Презентация End Term — MoozTau / SRE

**Длительность:** 12-15 минут • **Слайдов:** 16
**Соотношение:** 2 слайда о бизнесе + 14 про SRE

---

## Slide 1 — Title (15 сек)

**Заголовок:**
> MoozTau Platform
> End Term Project — Comprehensive SRE Implementation

**Подзаголовок:**
- Student: Adilzhan Kadyrov
- Date: 19.05.2026
- Production server: 213.155.22.46
- Domain: medhome.kz
- Repository: github.com/adilzhankad/sre_mooztau_test

**Что говорить (15 сек):**
*«MoozTau — это микросервисная платформа в продакшене. В End Term я довёл её до полного SRE lifecycle: 12 контейнеров, 2 БД, multi-orchestration, IaC, monitoring, alerting и CI/CD.»*

**Что показывать:** логотип MoozTau

---

## Slide 2 — Что такое MoozTau (45 сек) 🏢 Business

**Заголовок:** MoozTau — что это за платформа

**Контент (2 колонки):**

| Бизнес | Технология |
|--------|-----------|
| Производство и продажа холодильного оборудования | 6 микросервисов на FastAPI |
| Управление сетью дилеров (10 каналов) | React + TypeScript frontend |
| 41 модель продукции, 6 категорий | PostgreSQL 16 + MongoDB 7 |
| Полный lifecycle заказа: новый → производство → доставка → оплата | Docker, Kubernetes, Terraform |
| Мультитенантность по ролям (5 ролей) | Prometheus + Grafana + Telegram alerts |

**Что говорить:**
*«MoozTau — это реальная платформа для управления производством холодильников и дилерской сетью. На фронте админка для менеджеров, цеха и руководства. Сейчас на проде работают 10 организаций и 41 модель продукции. Я её строил весь курс, и в End Term превратил из «работает» в «production-grade SRE».»*

**Скриншоты:** Frontend medhome.kz (главная страница / Orders), ER-схема

---

## Slide 3 — Архитектура системы 🏗️ (60 сек) — это переходный слайд от бизнеса к SRE

**Заголовок:** System Architecture

**Диаграмма (ASCII или draw.io):**

```
┌────────────────────────────────────────────────────┐
│         Frontend (React) :3100                      │
│         Nginx proxies /api/ to backends             │
└─────┬────────┬─────────┬─────────┬───────┬─────────┘
      │        │         │         │       │
   ┌──┴──┐ ┌──┴───┐ ┌───┴───┐ ┌──┴──┐ ┌──┴──┐ ┌────┐
   │auth │ │orders│ │finance│ │prod │ │user │ │chat│
   │8002 │ │ 8001 │ │ 8003  │ │8004 │ │8005 │ │8006│
   └──┬──┘ └──┬───┘ └───┬───┘ └──┬──┘ └──┬──┘ └─┬──┘
      └───────┴─────────┼────────┴───────┘      │
            PostgreSQL  │              MongoDB ─┘
                        │
   Prometheus :9090 → Grafana :3000 ← Alertmanager :9093 → Telegram
```

**Что говорить:**
*«6 бекенд сервисов, у каждого свой порт и зона ответственности. Postgres основной, Mongo для chat-архива и full-text search. Сверху мониторинг — Prometheus собирает метрики, Grafana показывает дашборды, Alertmanager шлёт алерты в Telegram.»*

---

## Slide 4 — Что покрыто в End Term ✅ (45 сек)

**Заголовок:** End Term Spec Coverage

**Контент — чек-лист с галочками:**

| # | Требование End Term | ✓ |
|---|---------------------|---|
| 1 | 6+ микросервисов | ✅ |
| 2 | Docker Compose + Swarm + Kubernetes (multi-orchestration) | ✅ |
| 3 | Terraform (cloud + existing-server) | ✅ |
| 4 | Ansible (4 роли) | ✅ |
| 5 | SLI/SLO design | ✅ |
| 6 | Prometheus + Grafana + Alertmanager | ✅ |
| 7 | Incident simulation + postmortem | ✅ |
| 8 | Automation + capacity planning | ✅ |
| 9 | CI/CD pipeline (GitHub Actions) | ✅ |
| **10** | **Two databases (Postgres + Mongo)** | ✅ |
| **11** | **Health checks in Kubernetes (3 levels)** | ✅ |
| **12** | **Auto-scaling (HPA)** | ✅ |

**Что говорить:**
*«12 пунктов из end-term checklist — закрыты. Последние три — две БД, k8s health checks, HPA — это бонус сверх минимальных требований.»*

---

## Slide 5 — Containerization + Health Checks 📦 (45 сек)

**Заголовок:** Docker Compose — base environment

**Контент:**
- **12 сервисов** в одной сети `mooztau_net`
- Каждый имеет **healthcheck** + **restart: unless-stopped**
- Зависимости через `depends_on: condition: service_healthy`
- 4 named volumes: pgdata, mongodata, prometheus_data, grafana_data

**Код-пример:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  retries: 5
```

**Что говорить:**
*«Docker Compose — основа. 12 сервисов с health checks, чтобы пока Postgres не healthy — другие не стартуют. Один docker compose up — и всё работает.»*

**Скриншот:** `docker compose ps` со всеми Up (healthy)

---

## Slide 6 — SLI/SLO Design 📏 (60 сек)

**Заголовок:** Service Level Indicators & Objectives

**Контент — таблица:**

| SLI | Definition | SLO Target |
|-----|-----------|------------|
| Availability | 1 − (5xx / total) | ≥ 99% |
| Latency P95 | 95-percentile response time | ≤ 200 ms |
| Error rate | 5xx responses | ≤ 1% |
| Success rate | 2xx responses | ≥ 99% |

**Error budget:** 432 минуты/месяц при 99% availability

**PromQL пример (Availability):**
```promql
sum(rate(http_request_duration_seconds_count{status!~"5.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))
```

**Что говорить:**
*«Без SLO нет SRE. Я зафиксировал 4 SLI и 4 SLO с конкретными цифрами. Если выкарабкивается из бюджета 432 мин/месяц — фриз релизов до восстановления.»*

---

## Slide 7 — Monitoring & Alerting 📊 (75 сек)

**Заголовок:** Prometheus + Grafana + Alertmanager

**Контент:**
- **Prometheus** скрейпит 6 сервисов каждые 15 секунд
- **Grafana** дашборд: UP/DOWN, Request Rate, Latency P50/P95/P99, Error rate
- **Alertmanager** → Telegram bot `@mooztau_alerts_bot`

**6 alert rules:**

| Alert | Condition | Severity |
|-------|-----------|----------|
| ServiceDown | up == 0 | critical |
| HighErrorRate | 5xx > 5% | critical |
| HighLatency | P95 > 2s | warning |
| HighRequestRate | RPS > 50 | warning |
| ServiceSaturated | P99 > 5s | critical |
| NoMetrics | metric absent | warning |

**Что говорить:**
*«Prometheus в реальном времени собирает метрики, Grafana визуализирует, Alertmanager шлёт критичные алерты в Telegram — я узнаю о падении за 15 секунд.»*

**Скриншот:** Grafana dashboard

---

## Slide 8 — Multi-Orchestration: Swarm + K8s 🚀 (75 сек)

**Заголовок:** Three Orchestrators — Compose, Swarm, Kubernetes

**Контент — сравнение:**

| Aspect | Compose | Swarm | Kubernetes |
|--------|---------|-------|------------|
| Replicas | 1 each | **2/2 per microservice** | spec.replicas + HPA |
| Self-healing | restart_policy | restart_policy | ReplicaSet + probes |
| Auto-scale | ❌ | manual | **HPA built-in** |
| Networking | bridge | overlay | CNI Service CIDR |
| Use case | dev / prod-single-node | quick clustering | future-ready |

**Команды:**
```bash
docker swarm init
docker stack deploy -c docker-stack.yml mooztau
kubectl apply -f k8s/   # 32 ресурса в 14 файлах
```

**Что говорить:**
*«Развернул один проект тремя способами. Compose для разработки, Swarm для быстрого clustering на VPS, Kubernetes как future-ready production setup.»*

**Скриншот:** `docker service ls` (2/2 replicas) + `kubeconform -strict -summary k8s/`

---

## Slide 9 — Kubernetes Deep-Dive: 3-Level Health Checks + HPA ⚙️ (90 сек)

**Заголовок:** Kubernetes — Probes + Autoscaling

**Контент — три пробы (новое):**

```yaml
startupProbe:    # до 120 секунд на стартап (alembic migrations)
  failureThreshold: 24, periodSeconds: 5
readinessProbe:  # отключает трафик пока не готов
  failureThreshold: 3
livenessProbe:   # рестартит зависший pod
  failureThreshold: 3
```

**Контент — HPA (Horizontal Pod Autoscaler):**

| Service | min | max | CPU target |
|---------|-----|-----|------------|
| auth | 2 | 5 | 70% |
| **orders** | 2 | **8** | 65% |
| finance | 2 | 4 | 70% |
| product | 2 | 4 | 70% |
| user | 2 | 4 | 70% |
| chat | 2 | 6 | 70% |

**Что говорить:**
*«Три пробы решают разные проблемы — startup для медленного запуска orders с миграциями, readiness отключает трафик пока не готов, liveness рестартит зависший pod. HPA автоматически масштабирует — orders может расти до 8 реплик если RPS вырастет.»*

**Скриншот:** Часть hpa.yml + кусок auth.yml с пробами

---

## Slide 10 — Two-Database Architecture 🗄️ (75 сек) ⭐ Highlight

**Заголовок:** Polyglot Persistence — Postgres + MongoDB

**Контент:**

```
   ┌─────────────────────────────────┐
   │   chat_service                  │
   │                                 │
   │   1. write_message()            │
   │      ├──► Postgres (canonical)  │  ← FK to chat_rooms, ACID
   │      └──► Mongo (archive copy)  │  ← TEXT index for search
   │                                 │
   │   2. search_archive(q)          │
   │      └──► Mongo $text search    │
   └─────────────────────────────────┘
```

**Зачем две:**
- **Postgres** — транзакции, foreign keys, joins
- **MongoDB** — schemaless архив + full-text search (русский язык)

**Новые endpoints:**
- `GET /chats/archive/search?q=заказ` — поиск по текстам
- `GET /health/full` — проверяет обе БД

**Что говорить:**
*«Не просто две БД ради галочки. Postgres хранит транзакционные данные, Mongo — оптимизирован для full-text поиска по сообщениям с русским языковым индексом. Это паттерн polyglot persistence.»*

**Скриншот:** JSON ответа `/health/full` со статусом обеих БД

---

## Slide 11 — Infrastructure as Code 🏗️ (60 сек)

**Заголовок:** Terraform — two profiles

**Контент:**

| Profile | What it does |
|---------|-------------|
| **terraform/existing-server/** | SSH-провижининг работающего VPS (213.155.22.46) |
| **terraform/cloud/** | Создаёт VM в Yandex Cloud с нуля + VPC + Security Group |

```bash
terraform apply
# Apply complete! Resources: 3 added, 0 changed, 0 destroyed.
```

**Что говорить:**
*«Terraform умеет и так и так — может задеплоить на мой существующий VPS, может создать новую VM в Yandex Cloud. Декларативно — нажал apply, инфраструктура совпадает с кодом.»*

**Скриншот:** `terraform apply` с зелёным Apply complete

---

## Slide 12 — Configuration Management + CI/CD 🤖 (75 сек)

**Заголовок:** Ansible + GitHub Actions

**Ansible:**
- 4 роли: `docker`, `app`, `nginx`, `monitoring`
- Один playbook ставит всё с нуля на новую машину

**CI/CD:**
```
git push origin main
  ↓
GitHub Actions → SSH to server
  ↓
./deploy.sh: validate_config + git pull + docker compose up -d --build
```

**Что говорить:**
*«Никогда не SSH-юсь руками на прод — только git push. GitHub Actions подключается по SSH и запускает deploy.sh. Ansible держит конфигурацию сервера в коде — могу пересоздать всё с нуля.»*

**Скриншот:** GitHub Actions с зелёными чеками деплоев

---

## Slide 13 — Incident Response Simulation 🚨 (75 сек)

**Заголовок:** Incident Drill — Orders Service Failure

**Timeline:**

```
T+0     docker compose stop orders        ← deliberately broke
T+15s   Prometheus: orders DOWN
T+15s   Telegram ⛔️ ИНЦИДЕНТ              ← caught by alertmanager
T+30s   docker logs orders --tail=20      ← analysis
T+60s   docker compose start orders       ← recovery
T+90s   Telegram ✅ ВОССТАНОВЛЕНО         ← auto-resolved
```

**Postmortem:** docs/postmortem.md (root cause, blast radius, action items)

**Что говорить:**
*«Симулировал реальный инцидент — остановил orders. Через 15 секунд Telegram пришёл, через 90 секунд я восстановил. Это полный SRE loop: detect → alert → analyze → recover → postmortem.»*

**Скриншот:** Telegram чат с ИНЦИДЕНТ и ВОССТАНОВЛЕНО карточками

---

## Slide 14 — Capacity Planning 📈 (60 сек)

**Заголовок:** Load Test Results

**Сценарий:** 20 concurrent users × 10 RPS × 90 секунд = **77 028 запросов**

| Service | Requests | Errors | P95 ms |
|---------|----------|--------|--------|
| auth | 19 257 | **0** | 223 |
| orders | 19 257 | **0** | 225 |
| finance | 19 257 | **0** | 160 |
| product | 6 419 | **0** | 95 |
| user | 6 419 | **0** | 88 |
| chat | 6 419 | **0** | 102 |
| **TOTAL** | **77 028** | **0** | — |

**Findings:**
- orders + Postgres — потенциальный bottleneck при дальнейшем росте
- P95 < 225 ms при 200 RPS — далеко от SLO порога 2 сек

**Что говорить:**
*«Загрузил систему 77 тысячами запросов — ноль ошибок. P95 латенси 225 мс — система готова к большему. Документ capacity_planning.md описывает стратегии когда орудия закончатся.»*

**Скриншот:** load_test.py output

---

## Slide 15 — Single-Command Validation ⚡ (45 сек)

**Заголовок:** All Configs Validated by One Script

**Команда:**
```bash
bash scripts/validate_all.sh
```

**Что проверяет:**
1. ✅ `docker compose config` — Compose
2. ✅ `docker compose -f docker-stack.yml config` — Swarm
3. ✅ `terraform fmt + validate` × 2 профиля
4. ✅ `ansible-playbook --syntax-check`
5. ✅ `kubeconform -strict -summary k8s/` → **32 resources / 14 files / 0 errors**

**Что говорить:**
*«Один скрипт валидирует ВЕСЬ проект — Compose, Swarm, Terraform×2, Ansible, Kubernetes. Если что-то сломаю — узнаю до push.»*

**Скриншот:** terminal с зелёными [OK] всех 5 секций

---

## Slide 16 — Conclusion & Q&A 🎯 (60 сек)

**Заголовок:** What I Built

**Big numbers:**
- **6** микросервисов
- **2** базы данных (Postgres + Mongo)
- **3** orchestrator (Compose + Swarm + K8s)
- **32** Kubernetes-ресурса
- **6** alert rules → Telegram
- **77 028** запросов без ошибок в load test
- **1** команда валидирует всё

**Что говорить:**
*«В End Term я взял работающую систему и сделал из неё SRE-эталон. Прометей, алерты, autoscaling, multi-orchestration, IaC, CI/CD — всё работает на проде. Один git push — и через минуту обновлено.»*

**Финальный слайд:**
- Repository: github.com/adilzhankad/sre_mooztau_test
- Live: http://medhome.kz
- Docs: README.md, docs/sli_slo.md, docs/capacity_planning.md, docs/postmortem.md

**Q&A**

---

## Timing summary (12-15 минут)

| Slide | Topic | Сек |
|-------|-------|-----|
| 1 | Title | 15 |
| 2 | MoozTau что это | 45 |
| 3 | Архитектура | 60 |
| 4 | End Term coverage | 45 |
| 5 | Docker Compose | 45 |
| 6 | SLI/SLO | 60 |
| 7 | Monitoring + Alerts | 75 |
| 8 | Multi-Orchestration | 75 |
| 9 | K8s probes + HPA | 90 |
| 10 | Two-DB ⭐ | 75 |
| 11 | Terraform | 60 |
| 12 | Ansible + CI/CD | 75 |
| 13 | Incident Drill | 75 |
| 14 | Capacity Planning | 60 |
| 15 | Validation script | 45 |
| 16 | Conclusion | 60 |
|  | **Total** | **~960 сек = 16 мин** |

---

## Visual style рекомендации

- **Тёмная тема** (как у тебя в IDE) — выглядит технологично
- **Моноширинный шрифт** для кода (Fira Code, JetBrains Mono)
- **Иконки** для категорий: 🏗️ IaC, 📊 Monitoring, 🚨 Incident, ⚙️ K8s, 🗄️ DB, 🤖 CI/CD
- **Скриншоты** из `screenshots/` — встрой как было в Word отчёте
- **Один график на слайд** максимум

## Что показывать live (опционально)

Если есть 1-2 мин экстра в конце — можно сделать **live demo**:
- Открыть **http://213.155.22.46:3000** → Grafana dashboard
- Остановить orders: `ssh ... docker compose stop orders`
- Прямо во время презентации придёт Telegram уведомление
- Запустить обратно — придёт ВОССТАНОВЛЕНО

Это самый сильный момент презентации — incident response в реальном времени.
