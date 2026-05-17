# MoozTau Platform

Платформа управления производством и дилерской сетью холодильного оборудования.

Реализует полный цикл SRE-практик: 6 микросервисов, multi-orchestration (Docker Swarm + Kubernetes), Infrastructure as Code (Terraform + Ansible), мониторинг (Prometheus + Grafana), incident response и capacity planning.

---

## Архитектура

6 микросервисов + PostgreSQL + React фронтенд:

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)  :3100                 │
│              Nginx проксирует все /api/ запросы          │
└──────┬──────────┬──────────┬───────┬──────┬─────────────┘
       │          │          │       │      │
  ┌────┴──┐ ┌────┴───┐ ┌────┴──┐ ┌──┴──┐ ┌┴────┐ ┌──────┐
  │ Auth  │ │Orders  │ │Finance│ │Prod.│ │User │ │ Chat │
  │ :8002 │ │ :8001  │ │ :8003 │ │:8004│ │:8005│ │:8006 │
  └────┬──┘ └────┬───┘ └────┬──┘ └──┬──┘ └┬────┘ └──┬───┘
       │         │          │       │     │          │
       └─────────┴──────────┴── PostgreSQL ──────────┘

Monitoring: Prometheus :9090 → Grafana :3000 ← Alertmanager :9093
```

| Сервис | Порт | Что делает |
|--------|------|-----------|
| **auth** | 8002 | Пользователи, организации, JWT токены, роли |
| **orders** | 8001 | Заказы, продукция, цены, производство, склад, аналитика |
| **finance** | 8003 | Приход/расход, категории расходов, банковские счета, отчёты |
| **product** | 8004 | Каталог продукции, модели, цены |
| **user** | 8005 | Профили пользователей, управление данными |
| **chat** | 8006 | Внутренний чат между пользователями |
| **frontend** | 3100 | React + TypeScript + Tailwind, мобильная адаптация (Capacitor) |

Общая БД PostgreSQL, единый JWT токен для всех сервисов.

---

## Функционал

### Авторизация и роли

5 ролей с разными уровнями доступа:

| Роль | Описание |
|------|----------|
| **SUPER_ADMIN** | Полный доступ: все заказы, все каналы, финансы, аналитика, управление пользователями |
| **DEALER_ADMIN** | Руководитель дилера/филиала: видит свой канал, создаёт заказы, управляет менеджерами |
| **DEALER_MANAGER** | Продавец: создаёт заказы, видит только свои, не видит дилерскую цену |
| **FACTORY_ADMIN** | Начальник цеха: заказы в производстве, склад, не видит цены |
| **FACTORY_WORKER** | Рабочий цеха: свои задачи, обновление статусов |

Авторизация по телефону + пароль → JWT access + refresh токены.

### Организации (каналы продаж)

10 каналов — головной офис, филиалы и дилеры:

| Тип | Каналы |
|-----|--------|
| **HQ** | MoozTau |
| **BRANCH** | MT Астана, MT Алматы, Каспи Магазин, B2B |
| **DEALER** | Ayza, Umag Шым, Umag Тараз, Диллер Болат, Айзберг |

Мультитенантность — каждый видит только свои данные.

### Каталог продукции

41 модель в 6 категориях:

| Категория | Моделей | Единица |
|-----------|---------|---------|
| OUTDOOR (выносной) | 19 | метр |
| BUILT_IN (встроенный) | 5 | метр |
| FREEZER (морозильник) | 11 | штука |
| UNIT (агрегат) | 3 | штука |
| DOOR (дверь) | 1 | штука |
| WITHOUT_UNIT (без агрегата) | 1 | штука |

### Ценообразование

Два уровня цен:
- **Дилерская цена** — по сколько MoozTau продаёт дилеру (видят SUPER_ADMIN + DEALER_ADMIN)
- **РРЦ** — рекомендуемая розничная цена (видят все кроме цеха)

Цех не видит цены — только что произвести.

### Заказы

Полный lifecycle заказа с обязательными полями клиента:

```
НОВЫЙ → ПОДТВЕРЖДЁН → В ПРОИЗВОДСТВЕ → ГОТОВ → ДОСТАВКА → ДОСТАВЛЕН → ПРИНЯТ → ЗАВЕРШЁН
```

- Автоматическая нумерация (MZ-000001)
- Обязательные поля: имя клиента, телефон, регион, адрес, позиции товара
- Контроль переходов статусов по ролям
- Гарантия 1 год автоматически при приёмке
- Завершение только после полной оплаты
- Аудит-лог всех изменений (кто, что, когда)

### Оплаты

- Несколько платежей на заказ
- Способы: Kaspi, Halyk, БЦК, Bereke, Forte, наличные
- Автоматический расчёт: оплачено / осталось
- **Авто-связь с финансами:** оплата заказа → автоматический приход в финансовом модуле

### Финансы (приход/расход)

- Транзакции: дата, сумма, тип, счёт, категория (4 уровня), инициатор, комментарий
- 6 банковских счетов с автоматическим балансом
- 8 корневых категорий расходов (дерево до 4 уровней)
- Отчёты: сводка, по категориям, по инициаторам
- Экспорт в Excel
- Привязка транзакций к заказам

### Производство (цех)

- Очередь заказов с дедлайнами
- Дашборд: в очереди / в работе / готово / отгружено
- Смена статусов производства
- **Без доступа к ценам и финансам**

### Склад (инвентарь)

- Учёт готовой продукции по цехам (Кулан, Тараз)
- Модель, цвет, количество, статус
- Если на складе есть — доставка быстрее

### Аналитика (SUPER_ADMIN)

- Общая сводка: заказы, выручка, средний чек, кол-во клиентов
- Выручка по месяцам/каналам/менеджерам
- Заказы по статусам/регионам/моделям
- Сравнение дилеров
- География продаж
- Популярность моделей
- Финансовый отчёт по способам оплаты

---

## Стек

| Компонент | Технология |
|-----------|-----------|
| Backend API | Python, FastAPI, SQLAlchemy, Pydantic |
| БД | PostgreSQL 16 |
| Auth | JWT (python-jose), bcrypt |
| Frontend | React 19, TypeScript, Tailwind CSS, Zustand, React Query |
| Мобильное | Capacitor (iOS/Android) |
| Контейнеры | Docker Compose |

---

## Запуск

### Требования
- Docker + Docker Compose

### Быстрый старт

```bash
git clone https://github.com/Erserik/Mooztau_back.git
cd Mooztau_back

# Создать .env
cp .env.example .env
# Отредактировать .env — установить DB_PASSWORD и JWT_SECRET

# Клонировать фронтенд
git clone https://github.com/Hinc2Iovem/MoozTau.git frontend

# Запустить
docker compose up -d --build
```

После запуска:

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:3100 |
| Auth API | http://localhost:8002/docs |
| Orders API | http://localhost:8001/docs |
| Finance API | http://localhost:8003/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin / из .env) |
| Alertmanager | http://localhost:9093 |

Начальные данные создаются автоматически:
- 10 организаций
- 41 модель продукции
- 6 банковских счетов
- 8 корневых категорий расходов
- Админ: `+77000000001` / `admin123`

---

## Структура проекта

```
Mooztau_back/
├── docker-compose.yml
├── auth_service/          # Микросервис авторизации
│   ├── main.py
│   ├── models.py          # User, Organization
│   ├── routes.py          # Auth, Users, Organizations API
│   ├── security.py        # JWT, bcrypt
│   └── seed.py
├── orders_service/        # Микросервис заказов
│   ├── main.py
│   ├── models/            # Order, Product, Price, Inventory, Payment
│   ├── routers/           # Orders, Products, Prices, Factory, Analytics
│   ├── services/          # Permissions, Finance client
│   ├── middleware/         # JWT auth
│   └── scripts/           # Seed, legacy migration
├── finance_service/       # Микросервис финансов
│   ├── main.py
│   ├── models.py          # Transaction, Category, BankAccount
│   ├── routes.py          # Transactions, Categories, Accounts, Reports
│   └── seed.py
└── data/                  # Excel с историческими данными
```

## Terraform (IaC)

Инфраструктура описана в `terraform/` под Yandex Cloud.

```bash
cd terraform

# Указать folder_id и cloud_id в terraform.tfvars
terraform init
terraform plan
terraform apply
terraform destroy
```

Terraform создаёт: VM (Ubuntu 22.04), VPC сеть и подсеть, security group с открытыми портами 22, 80, 3100, 8001-8003, 9090, 3000, 9093.

---

## Симуляция инцидента

Симулирует отказ orders_service из-за неверных DB-credentials:

```bash
# 1. Испортить credentials в docker-compose.yml:
#    environment:
#      DATABASE_URL: postgresql://wrong_user:wrong_pass@wrong_host:5432/wrong_db

# 2. Перезапустить только orders:
docker compose up -d orders

# 3. Наблюдать сбой в Grafana / Prometheus (http://localhost:9090/targets)

# 4. Проверить логи:
docker logs mooztau_back-orders-1

# 5. Восстановить: убрать DATABASE_URL из environment (или исправить)
docker compose up -d orders

# 6. Убедиться в восстановлении:
curl http://localhost:8001/health
```

Подробный разбор инцидента: [`docs/incident_report.md`](docs/incident_report.md)  
Postmortem: [`docs/postmortem.md`](docs/postmortem.md)

---

## Структура проекта

```
Mooztau_back/
├── docker-compose.yml
├── auth_service/          # Микросервис авторизации (port 8002)
│   ├── main.py
│   ├── models.py          # User, Organization
│   ├── routes.py          # Auth, Users, Organizations API
│   ├── security.py        # JWT, bcrypt
│   └── seed.py
├── orders_service/        # Микросервис заказов (port 8001)
│   ├── main.py
│   ├── models/            # Order, Product, Price, Inventory, Payment
│   ├── routers/           # Orders, Products, Prices, Factory, Analytics
│   ├── services/          # Permissions
│   ├── middleware/        # JWT auth
│   └── scripts/           # Seed, legacy migration
├── finance_service/       # Микросервис финансов (port 8003)
│   ├── main.py
│   ├── models.py          # Transaction, ExpenseCategory, BankAccount
│   ├── routes.py          # Transactions, Categories, Accounts, Reports
│   └── seed.py
├── MoozTau/               # React фронтенд (Nginx, port 3100)
├── monitoring/
│   ├── prometheus/        # prometheus.yml + alerts.yml
│   ├── grafana/           # Provisioning + dashboard JSON
│   └── alertmanager/      # alertmanager.yml
├── terraform/             # IaC — две конфигурации
│   ├── README.md          # Описание двух вариантов
│   ├── existing-server/   # Деплой на готовый VPS (213.155.22.46)
│   │   ├── main.tf        # null_resource: Docker + rsync + compose + Nginx
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   └── cloud/             # Полноценное провижининг Yandex Cloud VM
│       ├── main.tf        # Yandex provider + Ubuntu image
│       ├── network.tf     # VPC + subnet + security group
│       ├── compute.tf     # yandex_compute_instance (4 CPU, 8GB, 30GB)
│       ├── deploy.tf      # Install Docker + rsync + compose
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars.example
├── ansible/               # Configuration management
│   ├── playbook.yml       # Главный playbook
│   ├── inventory.ini      # Хосты
│   └── roles/
│       ├── docker/        # Установка Docker
│       ├── app/           # Деплой приложения
│       ├── nginx/         # Настройка Nginx
│       └── monitoring/    # Проверка мониторинга
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yml
│   ├── configmap.yml
│   ├── secret.yml
│   ├── postgres.yml
│   ├── auth.yml / orders.yml / finance.yml / product.yml / user.yml / chat.yml
│   ├── monitoring.yml     # Prometheus + Grafana
│   └── ingress.yml
├── docker-stack.yml       # Docker Swarm stack (replicas + resources + overlay network)
├── docs/
│   ├── sli_slo.md         # SLI/SLO определения + PromQL + Error Budget
│   ├── capacity_planning.md # Нагрузочное тестирование + стратегии
│   ├── incident_report.md
│   └── postmortem.md
└── data/                  # Excel с историческими данными
```

---

## Docker Swarm

Multi-node кластер с репликацией сервисов:

```bash
# Инициализация Swarm
docker swarm init

# Сборка образов (нужно до deploy)
docker compose build

# Деплой всего стека
docker stack deploy -c docker-stack.yml mooztau

# Проверить сервисы
docker service ls

# Масштабировать orders до 4 реплик
docker service scale mooztau_orders=4

# Удалить стек
docker stack rm mooztau
```

**Особенности `docker-stack.yml`:**
- Каждый микросервис: 2 реплики по умолчанию
- Rolling update: `parallelism: 1, order: start-first`
- Resource limits: CPU и Memory на каждый сервис
- Overlay network для коммуникации между нодами
- БД и мониторинг — только на manager-ноде

---

## Kubernetes

```bash
# Применить все манифесты
kubectl apply -f k8s/

# Проверить поды
kubectl get pods -n mooztau

# Проверить сервисы
kubectl get services -n mooztau

# Логи orders
kubectl logs -l app=orders -n mooztau

# Масштабировать
kubectl scale deployment orders --replicas=4 -n mooztau

# Автоскейлинг по CPU
kubectl autoscale deployment orders --cpu-percent=70 --min=2 --max=6 -n mooztau
```

---

## Ansible

Автоматизированный деплой на удалённый сервер:

```bash
# Установить Ansible
pip install ansible

# Проверить доступность хоста
ansible mooztau -i ansible/inventory.ini -m ping

# Полный деплой (Docker + App + Nginx + Monitoring)
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

# Только деплой приложения (без Docker-install)
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --tags app
```

**Роли:**
- `docker` — установка Docker CE + Compose plugin
- `app` — rsync проекта + docker compose up
- `nginx` — конфигурация reverse proxy
- `monitoring` — проверка Prometheus/Grafana

---

## Валидация всех конфигов

Прогнать единый скрипт для проверки Docker Compose, Swarm, Terraform, Ansible, Kubernetes:

```bash
bash scripts/validate_all.sh
```

Требования:
- `terraform` (brew install terraform)
- `ansible` (brew install ansible)
- `kubeconform` (brew install kubeconform)
- `docker`

---

## SRE документация

| Документ | Что внутри |
|----------|-----------|
| [docs/sli_slo.md](docs/sli_slo.md) | SLI определения (PromQL), SLO (≥99% / ≤200ms / ≤1%), Error Budget |
| [docs/capacity_planning.md](docs/capacity_planning.md) | Нагрузочное тестирование, bottlenecks, стратегии масштабирования |
| [docs/incident_report.md](docs/incident_report.md) | Симуляция отказа orders service |
| [docs/postmortem.md](docs/postmortem.md) | Postmortem analysis |
| [screenshots/README.md](screenshots/README.md) | Чек-лист скриншотов для сдачи |

---

## Репозитории

- **Backend:** https://github.com/Erserik/Mooztau_back
- **Frontend:** https://github.com/Hinc2Iovem/MoozTau
