resource "yandex_vpc_network" "mooztau" {
  name = "${var.project_name}-network"
}

resource "yandex_vpc_subnet" "mooztau" {
  name           = "${var.project_name}-subnet"
  zone           = var.yc_zone
  network_id     = yandex_vpc_network.mooztau.id
  v4_cidr_blocks = ["10.10.0.0/24"]
}

resource "yandex_vpc_security_group" "mooztau" {
  name        = "${var.project_name}-sg"
  description = "MoozTau security group: SSH + HTTP + microservices + monitoring"
  network_id  = yandex_vpc_network.mooztau.id

  ingress {
    description    = "SSH"
    protocol       = "TCP"
    port           = 22
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "HTTP"
    protocol       = "TCP"
    port           = 80
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "HTTPS"
    protocol       = "TCP"
    port           = 443
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "Frontend (Nginx)"
    protocol       = "TCP"
    port           = 3100
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "Grafana"
    protocol       = "TCP"
    port           = 3000
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "Prometheus"
    protocol       = "TCP"
    port           = 9090
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "Alertmanager"
    protocol       = "TCP"
    port           = 9093
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description    = "Microservices (auth, orders, finance, product, user, chat)"
    protocol       = "TCP"
    from_port      = 8001
    to_port        = 8006
    v4_cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description    = "All outbound"
    protocol       = "ANY"
    from_port      = 0
    to_port        = 65535
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
