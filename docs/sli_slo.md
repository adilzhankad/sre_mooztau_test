# SLI / SLO — MoozTau Platform

## Service Level Indicators (SLIs)

SLI — измеримые метрики качества сервиса, которые напрямую отражают пользовательский опыт.

### 1. Availability (Доступность)

Доля времени, когда сервис отвечает на запросы с кодом < 500.

**PromQL:**
```promql
sum(rate(http_request_duration_seconds_count{status!~"5.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))
```

### 2. Latency (Задержка)

95-й перцентиль времени ответа на запросы.

**PromQL:**
```promql
histogram_quantile(0.95,
  sum by (le, job) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)
```

### 3. Error Rate (Частота ошибок)

Доля запросов, завершившихся ошибкой 5xx.

**PromQL:**
```promql
sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))
```

### 4. Request Success Rate (Успешность запросов)

Доля запросов с кодом 2xx от всех запросов.

**PromQL:**
```promql
sum(rate(http_request_duration_seconds_count{status=~"2.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))
```

---

## Service Level Objectives (SLOs)

SLO — целевые значения SLI, которые мы обязуемся выдерживать.

| SLI | SLO | Измерение | Alert |
|-----|-----|-----------|-------|
| Availability | ≥ 99% | 30-дневное скользящее окно | `up == 0` за 15 сек |
| Latency (P95) | ≤ 200 ms | 5-минутное окно | > 2s за 5 мин (warning) |
| Error rate | ≤ 1% | 5-минутное окно | > 5% за 5 мин (critical) |
| Request success rate | ≥ 99% | 5-минутное окно | < 95% за 5 мин |

---

## Error Budget

Error Budget — допустимый объём ошибок/простоев до нарушения SLO.

| SLO | Доступность | Error Budget (30 дней) |
|-----|-------------|------------------------|
| Availability ≥ 99% | 99% | 432 мин/месяц (~7.2 ч) |
| Error rate ≤ 1% | 99% | 1% запросов |

**Правило:** если error budget исчерпан на 50% — замораживаем новые релизы и фокусируемся на надёжности.

---

## Текущие Alert-правила (alerts.yml)

| Alert | Условие | Severity |
|-------|---------|----------|
| `ServiceDown` | `up == 0` в течение 15 сек | critical |
| `HighErrorRate` | error rate > 5% за 5 мин | critical |
| `HighLatency` | P95 > 2s за 5 мин | warning |
| `HighRequestRate` | RPS > 50 за 2 мин | warning |
| `ServiceSaturated` | P99 > 5s за 3 мин | critical |
| `NoMetrics` | нет метрик 5 мин | warning |

---

## SLO по сервисам

| Сервис | Availability | Latency P95 | Error Rate |
|--------|-------------|-------------|------------|
| auth (:8002) | ≥ 99% | ≤ 200ms | ≤ 1% |
| orders (:8001) | ≥ 99% | ≤ 300ms | ≤ 1% |
| finance (:8003) | ≥ 99% | ≤ 200ms | ≤ 1% |
| product (:8004) | ≥ 99% | ≤ 200ms | ≤ 1% |
| user (:8005) | ≥ 99% | ≤ 200ms | ≤ 1% |
| chat (:8006) | ≥ 99% | ≤ 150ms | ≤ 1% |

> orders имеет более мягкий latency SLO (300ms) из-за сложных SQL-запросов с JOIN по 5+ таблицам.
