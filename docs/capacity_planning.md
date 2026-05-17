# Capacity Planning — MoozTau Platform

## Методология

Capacity planning основан на результатах нагрузочного тестирования (`load_test.py`) и анализе метрик Prometheus.

---

## Нагрузочное тестирование

Инструмент: `load_test.py` (кастомный скрипт на Python)

**Сценарий:**
- 50 одновременных пользователей
- Длительность: 5 минут
- Запросы: GET /health, POST /auth/login, GET /orders, GET /products

**Результаты:**

| Сервис | Avg RPS | P95 Latency | Error Rate | CPU Peak | Memory Peak |
|--------|---------|-------------|------------|----------|-------------|
| auth | 45 rps | 180ms | 0.2% | 35% | 120MB |
| orders | 38 rps | 290ms | 0.5% | 65% | 380MB |
| finance | 20 rps | 150ms | 0.1% | 25% | 95MB |
| product | 30 rps | 120ms | 0.1% | 20% | 80MB |
| user | 15 rps | 110ms | 0.0% | 15% | 70MB |
| chat | 10 rps | 90ms | 0.0% | 10% | 65MB |
| postgres | — | — | — | 75% | 480MB |

---

## Findings (Выводы)

### 1. Orders Service — основной bottleneck
- Наивысшее CPU-потребление (65% при 38 RPS)
- P95 latency 290ms — близко к SLO ≤ 300ms
- Причина: сложные JOIN-запросы (заказы + позиции + оплаты + аудит)

### 2. PostgreSQL — критический bottleneck
- CPU 75% при пиковой нагрузке
- Единая БД для всех 6 сервисов создаёт конкуренцию за соединения
- При 2x нагрузке ожидается деградация до нарушения SLO

### 3. Finance Service — стабильный
- Низкая нагрузка, хорошие показатели
- Запас по масштабированию: 4x текущей нагрузки

---

## Strategies (Стратегии масштабирования)

### Горизонтальное масштабирование (Horizontal Scaling)

**Docker Swarm:**
```bash
# Увеличить replicas orders до 4
docker service scale mooztau_orders=4

# Увеличить replicas auth до 3
docker service scale mooztau_auth=3
```

**Kubernetes:**
```bash
# Автоматическое масштабирование по CPU
kubectl autoscale deployment orders \
  --cpu-percent=70 \
  --min=2 \
  --max=6 \
  -n mooztau
```

**Когда применять:** при CPU > 70% или P95 latency > 70% от SLO.

---

### Вертикальное масштабирование (Vertical Scaling)

| Сервис | Текущие лимиты | Рекомендованные |
|--------|---------------|-----------------|
| orders | 1 CPU, 512MB | 2 CPU, 1GB |
| postgres | 0.5 CPU, 512MB | 2 CPU, 2GB |
| auth | 0.5 CPU, 256MB | 1 CPU, 512MB |

**Когда применять:** при стабильно высоком потреблении без пиков.

---

### Оптимизация базы данных

1. **Индексы** — добавить индексы на часто используемые поля:
   ```sql
   CREATE INDEX idx_orders_status ON orders(status);
   CREATE INDEX idx_orders_org ON orders(organization_id);
   CREATE INDEX idx_payments_order ON payments(order_id);
   ```

2. **Connection pooling** — добавить PgBouncer между сервисами и PostgreSQL:
   - Режим: transaction pooling
   - pool_size: 20 на сервис

3. **Read replicas** — при нагрузке > 500 RPS — вынести аналитические запросы (orders analytics) на read replica.

---

## Capacity Thresholds (Пороги для действий)

| Метрика | Monitor | Warning | Action Required |
|---------|---------|---------|----------------|
| CPU (сервис) | > 50% | > 70% | Scale out (+ реплика) |
| Memory (сервис) | > 60% | > 80% | Scale up (больше RAM) |
| CPU (Postgres) | > 60% | > 80% | PgBouncer + индексы |
| P95 Latency | > 150ms | > 250ms | Профилирование + оптимизация |
| Error rate | > 0.1% | > 0.5% | Немедленное расследование |
| RPS (orders) | > 30 | > 50 | Добавить реплику |

---

## Прогноз роста

При текущей бизнес-динамике MoozTau (10 каналов, 41 модель продукции):

| Период | Ожидаемый RPS | Требуемые реплики orders | Требуемая RAM Postgres |
|--------|--------------|--------------------------|------------------------|
| Сейчас | 38 | 2 | 512MB |
| +6 мес | 80 | 4 | 1GB |
| +12 мес | 150 | 6 | 2GB + read replica |

**Рекомендация:** при достижении 80 RPS на orders — переходить на отдельную БД для аналитики (CQRS-паттерн).
