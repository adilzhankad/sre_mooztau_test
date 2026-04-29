terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.3.0"
}

# Копирует проект на сервер и запускает docker compose
resource "null_resource" "deploy" {
  connection {
    type        = "ssh"
    host        = var.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  # Установка Docker
  provisioner "remote-exec" {
    inline = [
      "curl -fsSL https://get.docker.com | sudo sh",
      "sudo usermod -aG docker ${var.server_user}",
    ]
  }

  # Копирование проекта
  provisioner "local-exec" {
    command = <<-EOT
      rsync -avz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='venv' \
        --exclude='__pycache__' \
        -e "ssh -i ${var.ssh_private_key_path} -o StrictHostKeyChecking=no" \
        ${var.project_path}/ \
        ${var.server_user}@${var.server_ip}:${var.deploy_path}/
    EOT
  }

  # Запуск docker compose
  provisioner "remote-exec" {
    inline = [
      "cd ${var.deploy_path}",
      "sudo docker compose down || true",
      "sudo docker compose up -d --build",
    ]
  }
}

# Установка Nginx и настройка домена
resource "null_resource" "nginx" {
  depends_on = [null_resource.deploy]

  connection {
    type        = "ssh"
    host        = var.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get install -y nginx",
      "sudo tee /etc/nginx/sites-available/${var.domain} > /dev/null <<'EOF'\nserver {\n    listen 80;\n    server_name ${var.domain} www.${var.domain};\n    location / {\n        proxy_pass http://localhost:3100;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}\nEOF",
      "sudo ln -sf /etc/nginx/sites-available/${var.domain} /etc/nginx/sites-enabled/",
      "sudo nginx -t && sudo systemctl reload nginx",
    ]
  }
}
