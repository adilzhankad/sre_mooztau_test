terraform {
  required_version = ">= 1.3.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

resource "null_resource" "install_docker" {
  triggers = {
    server_ip = var.server_ip
  }

  connection {
    type        = "ssh"
    host        = var.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | sudo sh",
      "sudo usermod -aG docker ${var.server_user} || true",
      "sudo apt-get install -y rsync nginx >/dev/null 2>&1 || true",
    ]
  }
}

resource "null_resource" "deploy" {
  depends_on = [null_resource.install_docker]

  triggers = {
    server_ip   = var.server_ip
    deploy_path = var.deploy_path
  }

  provisioner "local-exec" {
    command = <<-EOT
      rsync -avz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='.terraform' \
        --exclude='terraform/cloud/.terraform' \
        --exclude='terraform/existing-server/.terraform' \
        -e "ssh -i ${var.ssh_private_key_path} -o StrictHostKeyChecking=no" \
        ${var.project_path}/ \
        ${var.server_user}@${var.server_ip}:${var.deploy_path}/
    EOT
  }

  connection {
    type        = "ssh"
    host        = var.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "cd ${var.deploy_path}",
      "sudo docker compose down || true",
      "sudo docker compose up -d --build",
    ]
  }
}

resource "null_resource" "nginx" {
  depends_on = [null_resource.deploy]

  triggers = {
    domain    = var.domain
    server_ip = var.server_ip
  }

  connection {
    type        = "ssh"
    host        = var.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "sudo tee /etc/nginx/sites-available/${var.domain} > /dev/null <<'EOF'\nserver {\n    listen 80;\n    server_name ${var.domain} www.${var.domain};\n    location / {\n        proxy_pass http://localhost:3100;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}\nEOF",
      "sudo ln -sf /etc/nginx/sites-available/${var.domain} /etc/nginx/sites-enabled/",
      "sudo nginx -t",
      "sudo systemctl enable nginx",
      "sudo systemctl restart nginx",
    ]
  }
}
