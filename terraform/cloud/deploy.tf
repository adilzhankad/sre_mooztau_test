locals {
  server_ip = yandex_compute_instance.mooztau.network_interface.0.nat_ip_address
}

resource "null_resource" "wait_for_ssh" {
  depends_on = [yandex_compute_instance.mooztau]

  connection {
    type        = "ssh"
    host        = local.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = ["echo 'SSH is up'"]
  }
}

resource "null_resource" "install_docker" {
  depends_on = [null_resource.wait_for_ssh]

  connection {
    type        = "ssh"
    host        = local.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "curl -fsSL https://get.docker.com | sudo sh",
      "sudo usermod -aG docker ${var.server_user}",
      "sudo apt-get install -y rsync nginx",
    ]
  }
}

resource "null_resource" "deploy" {
  depends_on = [null_resource.install_docker]

  triggers = {
    server_ip = local.server_ip
  }

  provisioner "local-exec" {
    command = <<-EOT
      rsync -avz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='.terraform' \
        -e "ssh -i ${var.ssh_private_key_path} -o StrictHostKeyChecking=no" \
        ${var.project_path}/ \
        ${var.server_user}@${local.server_ip}:${var.deploy_path}/
    EOT
  }

  connection {
    type        = "ssh"
    host        = local.server_ip
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

  connection {
    type        = "ssh"
    host        = local.server_ip
    user        = var.server_user
    private_key = file(var.ssh_private_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "sudo tee /etc/nginx/sites-available/${var.domain} > /dev/null <<'EOF'\nserver {\n    listen 80;\n    server_name ${var.domain} www.${var.domain};\n    location / {\n        proxy_pass http://localhost:3100;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}\nEOF",
      "sudo ln -sf /etc/nginx/sites-available/${var.domain} /etc/nginx/sites-enabled/",
      "sudo nginx -t && sudo systemctl reload nginx",
    ]
  }
}
