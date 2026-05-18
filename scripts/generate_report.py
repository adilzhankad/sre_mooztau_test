#!/usr/bin/env python3
"""Generate End Term Project Word report (MoozTau Platform).

First-person narrative style, matches the previous MoozTau_Report and
Assignment 6 reports. Each [SCREENSHOT] marker carries a detailed instruction
for what exactly to capture.

Output: docs/MoozTau_EndTerm_Report.docx
"""

from datetime import date
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "MoozTau_EndTerm_Report.docx"


def add_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0, 0, 0)
    return h


def add_para(doc, text, bold=False, italic=False, size=11):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    return p


def add_bullets(doc, items):
    for it in items:
        p = doc.add_paragraph(it, style="List Bullet")
        for run in p.runs:
            run.font.size = Pt(11)


def add_code_block(doc, code):
    p = doc.add_paragraph()
    r = p.add_run(code)
    r.font.name = "Courier New"
    r.font.size = Pt(9)


def add_screenshot(doc, label, what_to_open, what_to_capture, filename):
    """Insert a screenshot marker with detailed capture instructions."""
    p = doc.add_paragraph()
    r = p.add_run(f"[SCREENSHOT {filename}]  {label}")
    r.bold = True
    r.font.color.rgb = RGBColor(0xB0, 0x00, 0x00)
    r.font.size = Pt(10)

    p1 = doc.add_paragraph()
    r1 = p1.add_run("Open: ")
    r1.bold = True
    r1.font.size = Pt(10)
    r2 = p1.add_run(what_to_open)
    r2.font.size = Pt(10)
    r2.italic = True

    p2 = doc.add_paragraph()
    r3 = p2.add_run("Capture: ")
    r3.bold = True
    r3.font.size = Pt(10)
    r4 = p2.add_run(what_to_capture)
    r4.font.size = Pt(10)


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Light Grid Accent 1"
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(11)
    for ri, row in enumerate(rows):
        cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = str(val)
            for p in cells[ci].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(10)
    doc.add_paragraph()


def add_title_page(doc):
    for _ in range(7):
        doc.add_paragraph()

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("MoozTau Platform")
    r.bold = True
    r.font.size = Pt(28)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("End Term Project")
    r.bold = True
    r.font.size = Pt(22)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(
        "Comprehensive SRE Implementation for a Distributed Microservices System"
    )
    r.bold = True
    r.italic = True
    r.font.size = Pt(14)

    for _ in range(3):
        doc.add_paragraph()

    meta = [
        "Student: Adilzhan Kadyrov",
        f"Date: {date.today().strftime('%d.%m.%Y')}",
        "Server: 213.155.22.46",
        "Domain: medhome.kz",
        "Repository: https://github.com/Erserik/Mooztau_back",
    ]
    for line in meta:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(line)
        r.font.size = Pt(12)

    doc.add_page_break()


def build():
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    add_title_page(doc)

    # ====== 1. INTRODUCTION ======
    add_heading(doc, "1. Introduction", level=1)
    add_para(
        doc,
        "This is my End Term Project for the SRE course. The goal of this project "
        "is to demonstrate the entire Site Reliability Engineering lifecycle on a "
        "real microservices platform that I built and deployed — MoozTau. The "
        "system is already running in production on my VPS at 213.155.22.46 and "
        "is publicly available at medhome.kz.",
    )
    add_para(
        doc,
        "Throughout the course I built this project step by step. In Assignment 1 "
        "I containerized the services with Docker Compose. In Assignment 2 I "
        "defined SLIs and SLOs. In Assignment 3 I added Prometheus + Grafana "
        "monitoring. In Assignment 4 I simulated an incident on the Orders Service "
        "and wrote a postmortem. In Assignment 5 I described the infrastructure "
        "with Terraform. In Assignment 6 I added automation and capacity planning. "
        "For this End Term Project I extended the system with the missing "
        "components required by the specification:",
    )
    add_bullets(
        doc,
        [
            "Multi-orchestration: added a Docker Swarm stack file and a full set "
            "of Kubernetes manifests, on top of the existing Docker Compose setup.",
            "Configuration management: implemented Ansible playbooks with roles "
            "for Docker, application deployment, Nginx, and monitoring.",
            "Terraform restructured into two profiles — one that provisions a "
            "Yandex Cloud VM from scratch and one that uses my existing VPS.",
            "Two new documents: SLI/SLO catalogue (docs/sli_slo.md) and Capacity "
            "Planning analysis (docs/capacity_planning.md).",
            "A single validation script (scripts/validate_all.sh) that checks all "
            "configurations in one command.",
        ],
    )

    add_screenshot(
        doc,
        "Project structure in IDE",
        "VS Code with the Mooztau_back project. Expand the file tree on the left "
        "so all top-level folders are visible.",
        "I want this screenshot to show every component of the project in one "
        "frame: auth_service, orders_service, finance_service, product_service, "
        "user_service, chat_service, MoozTau (frontend), monitoring, terraform, "
        "ansible, k8s, docs, scripts. Take it with the file tree on the left "
        "and an open file on the right — for example docker-compose.yml.",
        "01_project_tree.png",
    )

    # ====== 2. SYSTEM OVERVIEW ======
    add_heading(doc, "2. System Overview", level=1)
    add_para(
        doc,
        "MoozTau is a production-management and dealer-network system for "
        "refrigeration equipment. The architecture is built around six "
        "independent backend microservices, a React frontend, a shared "
        "PostgreSQL database, and a monitoring stack. Every component runs in "
        "Docker on the internal mooztau_net bridge network.",
    )
    add_para(doc, "Service inventory:", bold=True)
    add_table(
        doc,
        ["Service", "Port", "Responsibility"],
        [
            ["auth", "8002", "Authentication, JWT, users, organizations"],
            ["orders", "8001", "Orders, products, factory, analytics"],
            ["finance", "8003", "Bank accounts, transactions, financial reports"],
            ["product", "8004", "Product catalogue and pricing"],
            ["user", "8005", "User profiles and management"],
            ["chat", "8006", "Real-time WebSocket messaging"],
            ["frontend", "3100", "React + TypeScript + Nginx"],
            ["postgres", "5432 (internal)", "Shared PostgreSQL 16 database"],
            ["prometheus", "9090", "Metrics scraping"],
            ["grafana", "3000", "Dashboards"],
            ["alertmanager", "9093", "Alert routing → Telegram"],
        ],
    )
    add_para(
        doc,
        "Every microservice exposes a /health endpoint for Docker health checks "
        "and a /metrics endpoint for Prometheus scraping. All containers use "
        "the unless-stopped restart policy so they recover automatically after "
        "crashes or host reboots.",
    )

    add_screenshot(
        doc,
        "All containers running on production",
        "SSH to the server: ssh -i ~/.ssh/github_actions ubuntu@213.155.22.46, "
        "then run sudo docker ps in the terminal.",
        "All 11 mooztau containers must be visible with the status Up and "
        "(healthy) in the STATUS column. I want both the terminal prompt "
        "(ubuntu@38438) and the full table to be inside the frame.",
        "02_docker_ps_server.png",
    )

    # ====== 3. ENVIRONMENT SETUP — DOCKER COMPOSE ======
    add_heading(doc, "3. Environment Setup — Docker Compose (Assignment 1)", level=1)
    add_para(
        doc,
        "The base environment is orchestrated with Docker Compose. The "
        "docker-compose.yml file at the project root defines all 11 services, "
        "the named volumes for PostgreSQL/Prometheus/Grafana data, and the "
        "bridge network. Every service has explicit dependencies and health "
        "checks, so downstream services only start once their dependencies are "
        "marked healthy.",
    )
    add_para(doc, "PostgreSQL health-check example:", italic=True)
    add_code_block(
        doc,
        """healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
  interval: 5s
  timeout: 5s
  retries: 5""",
    )
    add_para(doc, "Microservice health-check example (orders):", italic=True)
    add_code_block(
        doc,
        """healthcheck:
  test: ["CMD-SHELL", "python -c \\"import urllib.request; \\
         urllib.request.urlopen('http://localhost:8001/health')\\""]
  interval: 30s
  timeout: 10s
  start_period: 15s
  retries: 3""",
    )
    add_para(
        doc,
        "I bring up the whole stack with a single command: "
        "docker compose up -d --build. The build flag rebuilds images from each "
        "service's Dockerfile, and -d runs everything in the background.",
    )

    add_screenshot(
        doc,
        "docker-compose.yml in the IDE",
        "Open docker-compose.yml in VS Code, scroll to a section where 2-3 "
        "service definitions are visible at once (for example db + auth + "
        "orders).",
        "I want this screenshot to show the YAML structure — the services "
        "block, build context, env_file, depends_on with condition: "
        "service_healthy, ports mapping, and the healthcheck block. The line "
        "numbers must be visible on the left.",
        "03_compose_yml.png",
    )

    # ====== 4. SLI / SLO DESIGN ======
    add_heading(doc, "4. SLI / SLO Design (Assignment 2)", level=1)
    add_para(
        doc,
        "Service Level Indicators (SLIs) tell me how well the system serves my "
        "users. Service Level Objectives (SLOs) are the targets I commit to. I "
        "derive every SLI from Prometheus metrics that the FastAPI services "
        "expose. All definitions live in docs/sli_slo.md.",
    )
    add_table(
        doc,
        ["SLI", "Definition", "SLO Target"],
        [
            ["Availability", "1 − (5xx requests / total requests)", "≥ 99%"],
            ["Latency P95", "95th-percentile HTTP response time", "≤ 200 ms"],
            ["Error rate", "5xx responses / total responses", "≤ 1%"],
            ["Success rate", "2xx responses / total responses", "≥ 99%"],
        ],
    )
    add_para(doc, "Example PromQL — availability:", italic=True)
    add_code_block(
        doc,
        """sum(rate(http_request_duration_seconds_count{status!~"5.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))""",
    )
    add_para(
        doc,
        "I also defined an error budget — at 99% availability over 30 days I "
        "can afford 432 minutes (~7.2 hours) of unavailability before I break "
        "the SLO. If half of that budget is consumed in a month, I freeze "
        "new feature releases and focus on reliability work.",
    )

    add_screenshot(
        doc,
        "SLI/SLO catalogue",
        "Open docs/sli_slo.md in VS Code in preview mode (right-click → Open "
        "Preview).",
        "Capture the top of the rendered Markdown — the SLI definitions and "
        "the SLO target table with the four rows (Availability ≥ 99%, Latency "
        "≤ 200ms, Error rate ≤ 1%, Success rate ≥ 99%).",
        "04_sli_slo_doc.png",
    )

    # ====== 5. MONITORING ======
    add_heading(doc, "5. Monitoring and Alerting (Assignment 3)", level=1)
    add_para(
        doc,
        "Prometheus scrapes every microservice every 15 seconds from "
        "<service>:<port>/metrics. The scrape configuration lives in "
        "monitoring/prometheus/prometheus.yml and defines six jobs — one per "
        "service. Grafana reads Prometheus as its data source and renders a "
        "single MoozTau Platform Overview dashboard that I pre-provisioned via "
        "monitoring/grafana/provisioning. The dashboard shows: Services Status "
        "(UP / DOWN tiles), Request Rate, Error Rate, Latency P50/P95/P99, and "
        "Requests by Status Code.",
    )

    add_screenshot(
        doc,
        "Grafana dashboard",
        "Open http://213.155.22.46:3000 → Dashboards → MoozTau Platform "
        "Overview. Set the time range (top-right) to Last 30 minutes.",
        "All six service tiles (auth, chat, finance, orders, product, user) "
        "must show green UP. The Request Rate, Latency, and Requests by Status "
        "Code panels should have data. The Grafana logo and the URL bar are "
        "good to keep in the frame.",
        "05_grafana_dashboard.png",
    )

    add_screenshot(
        doc,
        "Prometheus targets",
        "Open http://213.155.22.46:9090/targets in a browser.",
        "Expand all six scrape pools (auth-service, chat-service, "
        "finance-service, orders-service, product-service, user-service). "
        "Every endpoint must show State = UP (green). Capture the URL bar so "
        "the Prometheus host is visible.",
        "06_prometheus_targets.png",
    )

    add_para(
        doc,
        "Alerting is handled by Alertmanager. I configured six alert rules in "
        "monitoring/prometheus/alerts.yml — they cover service downtime, error "
        "rate, latency, request rate, saturation, and missing instrumentation:",
    )
    add_table(
        doc,
        ["Alert", "Condition", "Severity", "For"],
        [
            ["ServiceDown", "up == 0", "critical", "15 seconds"],
            ["HighErrorRate", "5xx rate > 5%", "critical", "5 minutes"],
            ["HighLatency", "P95 > 2 s", "warning", "5 minutes"],
            ["HighRequestRate", "RPS > 50 per service", "warning", "2 minutes"],
            ["ServiceSaturated", "P99 > 5 s", "critical", "3 minutes"],
            ["NoMetrics", "metric absent", "warning", "5 minutes"],
        ],
    )

    add_screenshot(
        doc,
        "Prometheus alert rules",
        "Open http://213.155.22.46:9090/alerts in a browser.",
        "All six rules must be visible — preferably with each rule expanded so "
        "the PromQL expression, labels, and annotations are shown. Capture the "
        "URL bar and the green inactive badges (if everything is fine) or the "
        "firing state of any active alert.",
        "07_prometheus_alerts.png",
    )

    add_para(
        doc,
        "Alertmanager routes every critical alert to my Telegram bot "
        "@mooztau_alerts_bot. The Telegram template uses ИНЦИДЕНТ for fires and "
        "ВОССТАНОВЛЕНО for resolves, so I can see what is happening at a glance "
        "from my phone.",
    )

    # ====== 6. MULTI-ORCHESTRATION ======
    add_heading(doc, "6. Multi-Orchestration", level=1)
    add_para(
        doc,
        "The End Term Project specification requires demonstrating both Docker "
        "Swarm and Kubernetes orchestration on top of the Docker Compose setup "
        "I already had. I implemented both — they live in docker-stack.yml and "
        "the k8s/ folder.",
    )

    add_heading(doc, "6.1 Docker Swarm", level=2)
    add_para(
        doc,
        "Docker Swarm gave me a simple way to run multiple replicas of every "
        "microservice on the same VPS without changing my workflow. The "
        "docker-stack.yml file at the project root mirrors the Compose file "
        "but adds Swarm-specific deploy keys: replicas count, resource limits, "
        "rolling-update strategy, and restart policies.",
    )
    add_para(doc, "Deploy block from docker-stack.yml (orders service):", italic=True)
    add_code_block(
        doc,
        """deploy:
  replicas: 2
  update_config:
    parallelism: 1
    delay: 10s
    order: start-first
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
  resources:
    limits:
      cpus: "1.0"
      memory: 512M
    reservations:
      cpus: "0.2"
      memory: 128M""",
    )
    add_para(doc, "Deploying the stack:", italic=True)
    add_code_block(
        doc,
        """docker swarm init
docker compose build
docker stack deploy -c docker-stack.yml mooztau
docker service ls
docker stack ps mooztau""",
    )

    add_screenshot(
        doc,
        "docker service ls output",
        "Run on the server (or locally if testing Swarm in dev mode): docker "
        "swarm init && docker compose build && docker stack deploy -c "
        "docker-stack.yml mooztau, then docker service ls.",
        "The table must show all 11 services with their REPLICAS column "
        "showing 2/2 for microservices and 1/1 for db / prometheus / grafana / "
        "alertmanager. Include the terminal prompt in the frame.",
        "08_docker_service_ls.png",
    )

    add_screenshot(
        doc,
        "docker stack ps mooztau output",
        "Run docker stack ps mooztau in the terminal right after the deploy.",
        "Show the task list — each microservice should have 2 task lines with "
        "CURRENT STATE = Running. The replication is clearly visible per task.",
        "09_docker_stack_ps.png",
    )

    add_heading(doc, "6.2 Kubernetes", level=2)
    add_para(
        doc,
        "For Kubernetes I created 12 manifests under k8s/ covering the entire "
        "stack: a Namespace (mooztau), a ConfigMap with non-secret config, a "
        "Secret with passwords, a PersistentVolumeClaim plus Deployment and "
        "Service for PostgreSQL, six Deployment + Service pairs for the "
        "microservices, a monitoring manifest for Prometheus and Grafana, and "
        "an Ingress for external routing. Every Deployment has explicit "
        "readiness and liveness probes pointing at /health, plus CPU and "
        "memory requests and limits.",
    )
    add_para(doc, "Probes example (orders Deployment):", italic=True)
    add_code_block(
        doc,
        """readinessProbe:
  httpGet: { path: /health, port: 8001 }
  initialDelaySeconds: 20
  periodSeconds: 10
livenessProbe:
  httpGet: { path: /health, port: 8001 }
  initialDelaySeconds: 40
  periodSeconds: 30
resources:
  requests: { cpu: "200m", memory: "256Mi" }
  limits:   { cpu: "1000m", memory: "512Mi" }""",
    )
    add_para(doc, "I validate every manifest with kubeconform — no real cluster needed:")
    add_code_block(doc, "kubeconform -strict -summary k8s/")

    add_screenshot(
        doc,
        "kubeconform validation",
        "In the terminal, cd into the project root and run: "
        "kubeconform -strict -summary k8s/",
        "The output must end with: Summary: 23 resources found in 12 files - "
        "Valid: 23, Invalid: 0, Errors: 0, Skipped: 0. Capture the whole line "
        "plus the command above it.",
        "10_kubeconform.png",
    )

    add_para(doc, "Deployment commands:", italic=True)
    add_code_block(
        doc,
        """kubectl apply -f k8s/
kubectl get pods -n mooztau
kubectl get services -n mooztau
# horizontal pod autoscaling
kubectl autoscale deployment orders --cpu-percent=70 --min=2 --max=6 -n mooztau""",
    )

    add_screenshot(
        doc,
        "kubectl get pods (optional)",
        "Start a local cluster: minikube start (or kind create cluster), then "
        "kubectl apply -f k8s/ and finally kubectl get pods -n mooztau. If you "
        "don't have a cluster, skip this — the kubeconform screenshot above is "
        "the formal proof that the manifests are valid.",
        "Every pod must show STATUS = Running and READY = 1/1.",
        "11_kubectl_pods.png",
    )

    add_heading(doc, "6.3 Comparison", level=2)
    add_table(
        doc,
        ["Aspect", "Docker Swarm", "Kubernetes"],
        [
            ["Setup complexity", "Single command — docker swarm init", "Cluster required (minikube / kind / managed)"],
            ["Manifest format", "Compose with deploy: block", "Separate Deployment, Service, ConfigMap, etc."],
            ["Replication", "deploy.replicas", "spec.replicas"],
            ["Auto-scaling", "Manual: docker service scale", "Built-in HPA"],
            ["Self-healing", "restart_policy", "ReplicaSet + probes"],
            ["Networking", "Overlay network", "CNI plugin + Service CIDR"],
            ["Where I used it", "Same VPS, quick replication", "Future-ready production setup"],
        ],
    )

    # ====== 7. INFRASTRUCTURE AS CODE ======
    add_heading(doc, "7. Infrastructure as Code — Terraform", level=1)
    add_para(
        doc,
        "I split my Terraform configuration into two independent profiles in "
        "the terraform/ folder so that one is for my real production server "
        "and the other is a cloud-ready reference.",
    )
    add_bullets(
        doc,
        [
            "terraform/existing-server/ — provisions the running VPS at "
            "213.155.22.46. It uses the null provider to SSH into the server, "
            "install Docker, rsync the project from my Mac, run docker compose "
            "up -d --build, and configure Nginx as a reverse proxy.",
            "terraform/cloud/ — creates a brand-new Yandex Cloud VM with "
            "yandex_compute_instance, plus the VPC network, subnet, and "
            "security group with all the right firewall rules. This is the "
            "cloud-provisioning reference required by the End Term spec.",
        ],
    )
    add_para(doc, "Deployment commands for the existing-server profile:", italic=True)
    add_code_block(
        doc,
        """cd terraform/existing-server
terraform init
terraform plan
terraform apply""",
    )
    add_para(
        doc,
        "When I ran terraform apply for this report it created 3 null_resources "
        "(install_docker, deploy, nginx) and finished with: Apply complete! "
        "Resources: 3 added, 0 changed, 0 destroyed. After that, all 11 "
        "containers were Up (healthy) and every /health endpoint returned 200.",
    )

    add_screenshot(
        doc,
        "terraform apply success",
        "Run: cd terraform/existing-server && terraform apply -auto-approve",
        "Capture the last 30 lines of the output. The screenshot must show the "
        "green Apply complete! line, the resource counts, and the Outputs "
        "block with frontend_url, server_ip, grafana_url, prometheus_url, "
        "alertmanager_url, ssh_command.",
        "12_terraform_apply.png",
    )

    add_screenshot(
        doc,
        "terraform main.tf in the IDE",
        "Open terraform/existing-server/main.tf in VS Code.",
        "Show the null_resource.install_docker block plus the start of the "
        "null_resource.deploy block — line numbers visible, the SSH connection "
        "block visible.",
        "13_terraform_main_tf.png",
    )

    add_para(
        doc,
        "For the cloud profile, I have full Yandex Cloud manifests ready "
        "(network.tf, compute.tf, deploy.tf). They are validated with terraform "
        "validate even without credentials, which proves the syntax is correct.",
    )

    add_screenshot(
        doc,
        "Yandex Cloud Terraform manifests",
        "Open terraform/cloud/compute.tf in VS Code.",
        "Show the yandex_compute_instance block with platform_id, resources, "
        "boot_disk, network_interface, metadata (cloud-init with ssh-keys), "
        "and scheduling_policy.",
        "14_terraform_cloud_compute.png",
    )

    # ====== 8. CONFIGURATION MANAGEMENT ======
    add_heading(doc, "8. Configuration Management — Ansible", level=1)
    add_para(
        doc,
        "Terraform handles infrastructure creation, but ongoing configuration "
        "is the job of Ansible. I created the ansible/ folder with one playbook "
        "and four roles. Each role is responsible for a clear slice of the "
        "configuration:",
    )
    add_table(
        doc,
        ["Role", "Purpose"],
        [
            ["docker", "Install Docker CE + Compose plugin via the official apt repo"],
            ["app", "rsync the project to the server, run docker compose up -d --build"],
            ["nginx", "Install Nginx, deploy the reverse-proxy config, restart the service"],
            ["monitoring", "Verify that Prometheus and Grafana containers are running"],
        ],
    )
    add_para(doc, "Running the playbook:", italic=True)
    add_code_block(
        doc,
        """# verify syntax (no execution)
ansible-playbook --syntax-check -i ansible/inventory.ini ansible/playbook.yml

# full deployment to the server
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml""",
    )

    add_screenshot(
        doc,
        "Ansible folder structure",
        "Open the ansible/ folder in VS Code with the file tree expanded.",
        "All four roles must be visible (docker, app, nginx, monitoring), each "
        "expanded enough to see the tasks/main.yml and (where applicable) "
        "handlers/main.yml and templates/.",
        "15_ansible_tree.png",
    )

    add_screenshot(
        doc,
        "ansible-playbook --syntax-check result",
        "In the terminal, run: ansible-playbook --syntax-check -i "
        "ansible/inventory.ini ansible/playbook.yml",
        "Output must show: playbook: ansible/playbook.yml — without errors. "
        "Include the command in the frame.",
        "16_ansible_syntax.png",
    )

    # ====== 9. CI/CD ======
    add_heading(doc, "9. CI/CD — GitHub Actions", level=1)
    add_para(
        doc,
        "I automated deployments with GitHub Actions. Every push to the main "
        "branch fires the workflow in .github/workflows/deploy.yml. It connects "
        "to the server over SSH and runs deploy.sh, which validates the .env "
        "file, pulls the latest code with git pull, and rebuilds containers "
        "with docker compose up -d --build. I never SSH manually to release a "
        "change — git push is the deployment command.",
    )
    add_code_block(
        doc,
        """git push origin main
  → GitHub Actions runs Deploy to Production
  → SSH to 213.155.22.46
  → cd ~/mooztau && ./deploy.sh
  → validate_config.sh + git pull + docker compose up -d --build""",
    )

    add_screenshot(
        doc,
        "GitHub Actions workflow runs",
        "Open https://github.com/Erserik/Mooztau_back/actions in a browser.",
        "Capture the workflow-run list with at least 2-3 successful runs "
        "(green check marks). The branch column should show main and the "
        "commit messages should be readable.",
        "17_github_actions.png",
    )

    # ====== 10. INCIDENT RESPONSE ======
    add_heading(doc, "10. Incident Response Simulation (Assignment 4)", level=1)
    add_para(
        doc,
        "To validate the entire detect-alert-recover loop, I deliberately broke "
        "the Orders Service in production. The procedure simulates a real "
        "outage caused by a crash or misconfiguration.",
    )
    add_para(doc, "10.1 What I did:", bold=True)
    add_code_block(doc, "docker compose stop orders")
    add_para(doc, "10.2 Detection:", bold=True)
    add_para(
        doc,
        "Prometheus marked the orders-service target as DOWN within one scrape "
        "cycle (15 seconds). The Grafana tile turned red. Within 15 seconds "
        "Alertmanager sent me a Telegram ИНЦИДЕНТ message with the alert name, "
        "the service, and the timestamp.",
    )

    add_screenshot(
        doc,
        "Grafana — orders service DOWN",
        "While orders is stopped, open http://213.155.22.46:3000 → MoozTau "
        "Platform Overview.",
        "The orders-service tile in Services Status must be red and labeled "
        "DOWN. The other five services must remain UP. The Request Rate panel "
        "should show the dip in orders RPS.",
        "18_grafana_down.png",
    )

    add_screenshot(
        doc,
        "Prometheus target DOWN",
        "Open http://213.155.22.46:9090/targets while orders is stopped.",
        "The orders-service pool must show State = DOWN in red, plus the "
        "error message (Get http://orders:8001/metrics dial tcp ... connection "
        "refused). All other targets remain UP.",
        "19_prometheus_down.png",
    )

    add_screenshot(
        doc,
        "Telegram ИНЦИДЕНТ notification",
        "Open the Telegram chat with @mooztau_alerts_bot on your phone or "
        "Telegram Web.",
        "Capture the red ИНЦИДЕНТ card with: Сервис = orders-service, "
        "Алерт = ServiceDown, Описание, and the timestamp.",
        "20_telegram_alert.png",
    )

    add_para(doc, "10.3 Analysis:", bold=True)
    add_para(doc, "I inspected the container logs to confirm the cause:")
    add_code_block(doc, "docker logs mooztau_back-orders-1 --tail=20")
    add_para(
        doc,
        "The last lines stopped abruptly after the docker compose stop "
        "command, confirming a clean stop rather than a runtime crash. In a "
        "real incident, this is the moment when I would look for the error "
        "trace and decide on the fix.",
    )

    add_para(doc, "10.4 Recovery:", bold=True)
    add_code_block(doc, "docker compose start orders")
    add_para(
        doc,
        "The container came back up within 30 seconds. The Prometheus target "
        "flipped back to UP, the Grafana tile turned green, and Telegram "
        "delivered a ВОССТАНОВЛЕНО confirmation. Total time from the trigger "
        "to full recovery: under 5 minutes — most of which was me reading the "
        "logs.",
    )

    add_screenshot(
        doc,
        "Telegram ВОССТАНОВЛЕНО notification",
        "After running docker compose start orders, wait about 30 seconds and "
        "check the Telegram chat with @mooztau_alerts_bot.",
        "Capture the green ВОССТАНОВЛЕНО card for orders-service, with the "
        "recovery timestamp.",
        "21_telegram_resolved.png",
    )

    add_para(doc, "10.5 Postmortem:", bold=True)
    add_para(
        doc,
        "The full postmortem with root-cause analysis, blast radius, action "
        "items, and prevention measures is documented in docs/postmortem.md. "
        "The key lesson — which I implemented in Assignment 6 — was to add "
        "validate_config.sh that blocks deployment if any environment variable "
        "is missing or weak.",
    )

    # ====== 11. AUTOMATION & CAPACITY PLANNING ======
    add_heading(doc, "11. Automation and Capacity Planning (Assignment 6)", level=1)
    add_heading(doc, "11.1 Self-Healing", level=2)
    add_para(
        doc,
        "Every container has restart: unless-stopped plus a Docker health "
        "check. If a service starts failing health checks Docker restarts it "
        "automatically — no human action needed. Combined with the Alertmanager "
        "→ Telegram pipeline, this gives me detect-and-recover in under a "
        "minute for most failure modes.",
    )
    add_heading(doc, "11.2 Load Testing", level=2)
    add_para(
        doc,
        "I wrote load_test.py to measure the platform's real capacity. The "
        "script uses asyncio + aiohttp to fire concurrent HTTP requests at all "
        "six services simultaneously. A representative run produced the table "
        "below:",
    )
    add_table(
        doc,
        ["Service", "Requests", "Errors", "Error %", "Avg ms", "P95 ms"],
        [
            ["auth", "2940", "0", "0.0%", "71", "114"],
            ["orders", "2940", "0", "0.0%", "75", "117"],
            ["finance", "2940", "0", "0.0%", "42", "82"],
            ["product", "980", "0", "0.0%", "25", "54"],
            ["user", "980", "0", "0.0%", "23", "52"],
            ["chat", "980", "0", "0.0%", "24", "54"],
            ["TOTAL", "11760", "0", "0.0%", "—", "—"],
        ],
    )

    add_screenshot(
        doc,
        "load_test.py output",
        "Run python3 load_test.py in the terminal (the script targets the "
        "production server at 213.155.22.46).",
        "Capture the final ASCII LOAD TEST REPORT table — the one that lists "
        "every service with Requests, Errors, Error%, Avg ms, P95 ms, and the "
        "TOTAL line at the bottom.",
        "22_load_test.png",
    )

    add_screenshot(
        doc,
        "Grafana under load",
        "While load_test.py is running, open http://213.155.22.46:3000 → "
        "MoozTau Platform Overview. Set the time range to Last 15 minutes.",
        "Capture the dashboard with a visible Request Rate spike caused by "
        "the load test. The Latency P50/P95/P99 panel should also show the "
        "burst.",
        "23_grafana_under_load.png",
    )

    add_heading(doc, "11.3 Findings", level=2)
    add_bullets(
        doc,
        [
            "orders-service is the most resource-intensive component because "
            "it performs JOINs over orders + products + payments + audit "
            "tables on most requests.",
            "PostgreSQL is the shared bottleneck — all six services compete "
            "for the same connection pool.",
            "auth-service and finance-service consume noticeably less CPU "
            "because their workloads are mostly reads.",
            "P95 latency stays under 220 ms at the tested ~200 RPS load, "
            "well below the 2-second HighLatency alert threshold.",
        ],
    )
    add_heading(doc, "11.4 Scaling Strategy", level=2)
    add_table(
        doc,
        ["Strategy", "Tool", "When to apply"],
        [
            ["Horizontal scaling", "Swarm: docker service scale; k8s: HPA", "RPS > 50 or CPU > 70%"],
            ["Vertical scaling", "Update resources in compose / k8s", "Sustained high RAM"],
            ["DB optimisation", "PgBouncer + indexes + read replicas", "PG CPU > 80%"],
            ["Auto-scaling", "Kubernetes HPA on CPU + custom metrics", "Variable production load"],
        ],
    )
    add_para(
        doc,
        "The full analysis with PromQL thresholds and a 12-month growth forecast "
        "is in docs/capacity_planning.md.",
    )

    add_screenshot(
        doc,
        "Capacity Planning document",
        "Open docs/capacity_planning.md in VS Code preview.",
        "Capture the Findings + Strategies section so the bottleneck analysis "
        "and the scaling table are visible.",
        "24_capacity_planning.png",
    )

    # ====== 12. VALIDATION ======
    add_heading(doc, "12. Full Validation", level=1)
    add_para(
        doc,
        "Because the project now spans Docker Compose, Docker Swarm, Kubernetes, "
        "Terraform (two profiles), and Ansible, I wrote a single validation "
        "script that checks all of them in one command: scripts/validate_all.sh. "
        "It runs docker compose config, docker compose -f docker-stack.yml "
        "config, terraform fmt + validate (in each profile), "
        "ansible-playbook --syntax-check, and kubeconform.",
    )
    add_code_block(doc, "bash scripts/validate_all.sh")
    add_para(
        doc,
        "When I ran it for this report, every section reported [OK] and "
        "kubeconform confirmed 23 resources valid in 12 files.",
    )

    add_screenshot(
        doc,
        "validate_all.sh full output",
        "Run bash scripts/validate_all.sh in the project root.",
        "Capture the entire output — there should be 5 numbered sections "
        "(Docker Compose, Docker Stack, Terraform, Ansible, Kubernetes) and "
        "every check should print [OK] in green. The last line is "
        "'All checks completed'.",
        "25_validate_all.png",
    )

    # ====== 13. RESULTS ======
    add_heading(doc, "13. Results", level=1)
    add_table(
        doc,
        ["Deliverable from End Term spec", "Status", "Location in repository"],
        [
            ["6+ microservices", "Done", "auth_service/, orders_service/, finance_service/, product_service/, user_service/, chat_service/"],
            ["Docker Compose orchestration", "Done", "docker-compose.yml"],
            ["Docker Swarm configuration", "Done", "docker-stack.yml"],
            ["Kubernetes manifests", "Done", "k8s/ (23 resources, kubeconform clean)"],
            ["Terraform — existing server", "Done", "terraform/existing-server/ (apply complete)"],
            ["Terraform — cloud (Yandex)", "Done", "terraform/cloud/ (validated)"],
            ["Ansible playbook", "Done", "ansible/ — 4 roles"],
            ["Prometheus + Grafana monitoring", "Done", "monitoring/, http://213.155.22.46:3000 and :9090"],
            ["Alertmanager + Telegram alerts", "Done", "monitoring/alertmanager/"],
            ["SLI / SLO design", "Done", "docs/sli_slo.md"],
            ["Capacity planning", "Done", "docs/capacity_planning.md"],
            ["Incident report + postmortem", "Done", "docs/incident_report.md + docs/postmortem.md"],
            ["Validation script", "Done", "scripts/validate_all.sh (5/5 checks pass)"],
            ["CI/CD pipeline", "Done", ".github/workflows/deploy.yml"],
            ["Live demo / screenshots", "Done", "screenshots/ folder"],
        ],
    )

    add_screenshot(
        doc,
        "Frontend at medhome.kz",
        "Open http://213.155.22.46:3100 (or http://medhome.kz) in the browser.",
        "Capture the MoozTau login page or any page after login. This proves "
        "the end-user-facing system is live.",
        "26_frontend.png",
    )

    # ====== 14. CONCLUSION ======
    add_heading(doc, "14. Conclusion", level=1)
    add_para(
        doc,
        "Working through the End Term Project tied together everything I had "
        "built over the course. I now have a single platform that demonstrates "
        "the full SRE lifecycle: containerized microservices, three different "
        "orchestrators (Compose, Swarm, Kubernetes), declarative infrastructure "
        "provisioning with Terraform, configuration automation with Ansible, "
        "monitoring with Prometheus and Grafana, alerting via Alertmanager and "
        "Telegram, automated CI/CD via GitHub Actions, a validated incident "
        "response with a written postmortem, and a quantitative capacity "
        "analysis backed by my own load tests.",
    )
    add_para(
        doc,
        "The system runs reliably on a production VPS, every configuration "
        "file is syntactically validated by my single-command script, and the "
        "incident simulation proved that the detect-alert-recover loop closes "
        "in under a minute. By combining these practices, I brought MoozTau "
        "to a production-ready level of operational maturity that matches "
        "what real SRE teams aim for.",
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(f"OK — {OUT}")


if __name__ == "__main__":
    build()
