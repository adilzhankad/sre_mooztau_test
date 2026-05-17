# Terraform — две конфигурации

В этой папке две независимые конфигурации Terraform.

## 1. `existing-server/` — деплой на существующий сервер ⭐ основной путь

Используется когда у тебя уже есть VPS / dedicated сервер с SSH-доступом.

**Что делает:**
1. Подключается по SSH к серверу (`213.155.22.46`)
2. Устанавливает Docker, rsync, Nginx
3. `rsync` проекта с локальной машины
4. `docker compose up -d --build` для запуска всех 6 микросервисов + мониторинга
5. Конфигурирует Nginx как reverse proxy

**Запуск:**
```bash
cd terraform/existing-server
terraform init
terraform plan
terraform apply
```

Все параметры (IP, SSH-ключ, домен) — в `terraform.tfvars`.

---

## 2. `cloud/` — провижининг VM в Yandex Cloud

Используется когда нужно **создать виртуалку с нуля** через облачного провайдера.

**Что создаёт:**
- `yandex_vpc_network` — облачная сеть
- `yandex_vpc_subnet` — подсеть в зоне `ru-central1-a`
- `yandex_vpc_security_group` — правила firewall
- `yandex_compute_instance` — Ubuntu 22.04 VM (4 CPU, 8 GB RAM, 30 GB SSD)
- + null_resource для установки Docker + деплоя

**Запуск:**
```bash
cd terraform/cloud
# Заполнить yc_token, yc_cloud_id, yc_folder_id в terraform.tfvars
terraform init
terraform plan
terraform apply
```

Требуется аккаунт Yandex Cloud с активным платёжным аккаунтом.

---

## Какой использовать

| Сценарий | Папка |
|---|---|
| Деплой End Term для сдачи (есть свой VPS) | `existing-server/` |
| Демонстрация полноценного cloud provisioning | `cloud/` |
| Скриншоты `terraform plan` для отчёта | можно оба |

Оба варианта валидны как Infrastructure as Code — Terraform управляет конфигурацией удалённой инфраструктуры в обоих случаях.
