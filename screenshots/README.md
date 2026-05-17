# Screenshots — что прикладывать к сдаче

Согласно требованию PDF (раздел 16, п.8): *"Screenshots and demo evidence"*.

## Какие скриншоты нужны

### 1. Docker Compose работает локально
**Снимок:** вывод команды `docker compose ps` со всеми контейнерами в статусе `running (healthy)`.

```bash
docker compose ps
```
→ Сохрани как `screenshots/01_docker_compose_ps.png`

---

### 2. Grafana дашборд
**Открой:** http://localhost:3000 (admin / admin)
- Зайди в Dashboards → MoozTau
- Сними экран с графиками RPS / Latency / Error rate

→ `screenshots/02_grafana_dashboard.png`

---

### 3. Prometheus targets
**Открой:** http://localhost:9090/targets
- Все 6 targets должны быть UP (auth-service, orders-service, ..., chat-service)

→ `screenshots/03_prometheus_targets.png`

---

### 4. Alertmanager
**Открой:** http://localhost:9093
- Сними экран с активными правилами или без алертов (если всё в норме)

→ `screenshots/04_alertmanager.png`

---

### 5. Incident simulation (Order Service failure)
**Шаги:**
```bash
# Сломать orders (например, остановить контейнер)
docker compose stop orders

# Через 30 сек открыть http://localhost:9090/alerts — увидеть ServiceDown alert
```
- Снимок Prometheus → Alerts с активным `ServiceDown`
- Снимок Grafana с пиком ошибок
- Снимок логов: `docker logs mooztau_back-orders-1`

→ `screenshots/05_incident_alert.png`
→ `screenshots/06_incident_recovery.png` (после `docker compose start orders`)

---

### 6. Docker Swarm
```bash
docker swarm init
docker compose build
docker stack deploy -c docker-stack.yml mooztau

# Эту команду снять
docker service ls
docker stack ps mooztau
```
→ `screenshots/07_swarm_services.png`
→ `screenshots/08_swarm_stack_ps.png`

---

### 7. Kubernetes
Требуется кластер (minikube/kind/Docker Desktop k8s):
```bash
minikube start
# или
kind create cluster

# Собрать образы внутрь minikube
eval $(minikube docker-env)
docker compose build

kubectl apply -f k8s/
kubectl get pods -n mooztau
kubectl get services -n mooztau
```
→ `screenshots/09_kubectl_get_pods.png`
→ `screenshots/10_kubectl_get_services.png`

---

### 8. Terraform (после создания Yandex Cloud аккаунта)
```bash
cd terraform
terraform init
terraform plan
terraform apply  # снять последние строки вывода
```
→ `screenshots/11_terraform_plan.png`
→ `screenshots/12_terraform_apply.png`
→ Скриншот созданной VM в Yandex Cloud Console → `screenshots/13_yc_vm.png`

---

### 9. Ansible
```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```
→ `screenshots/14_ansible_run.png` (с зелёным "PLAY RECAP" внизу)

---

### 10. Load testing
```bash
python load_test.py
```
→ `screenshots/15_load_test.png`

И снимок Grafana во время нагрузки:
→ `screenshots/16_grafana_under_load.png`

---

## Чек-лист перед сдачей

- [ ] 01-04: Локальный compose + monitoring работает
- [ ] 05-06: Incident simulation
- [ ] 07-08: Docker Swarm
- [ ] 09-10: Kubernetes
- [ ] 11-13: Terraform + Yandex Cloud
- [ ] 14: Ansible
- [ ] 15-16: Load test

Если на какой-то пункт не хватает доступа (например, Yandex Cloud нет платёжного аккаунта), сделай скриншот `terraform plan` — он работает без apply.
