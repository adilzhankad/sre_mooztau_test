output "server_ip" {
  description = "Public IP of the provisioned VM"
  value       = local.server_ip
}

output "ssh_command" {
  description = "Ready-to-use SSH command"
  value       = "ssh -i ${var.ssh_private_key_path} ${var.server_user}@${local.server_ip}"
}

output "frontend_url" {
  description = "Frontend URL via domain"
  value       = "http://${var.domain}"
}

output "frontend_ip_url" {
  description = "Frontend URL via IP"
  value       = "http://${local.server_ip}:3100"
}

output "grafana_url" {
  description = "Grafana URL"
  value       = "http://${local.server_ip}:3000"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "http://${local.server_ip}:9090"
}

output "alertmanager_url" {
  description = "Alertmanager URL"
  value       = "http://${local.server_ip}:9093"
}
