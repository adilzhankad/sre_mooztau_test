output "server_ip" {
  description = "Server IP address"
  value       = var.server_ip
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh -i ${var.ssh_private_key_path} ${var.server_user}@${var.server_ip}"
}

output "frontend_url" {
  description = "Frontend URL via domain"
  value       = "http://${var.domain}"
}

output "frontend_ip_url" {
  description = "Frontend URL via IP"
  value       = "http://${var.server_ip}:3100"
}

output "grafana_url" {
  value = "http://${var.server_ip}:3000"
}

output "prometheus_url" {
  value = "http://${var.server_ip}:9090"
}

output "alertmanager_url" {
  value = "http://${var.server_ip}:9093"
}
