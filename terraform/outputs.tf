output "frontend_url" {
  description = "URL to access the frontend"
  value       = "http://${var.domain}"
}

output "frontend_ip_url" {
  description = "URL via IP"
  value       = "http://${var.server_ip}:3100"
}

output "grafana_url" {
  description = "URL to access Grafana"
  value       = "http://${var.server_ip}:3000"
}

output "prometheus_url" {
  description = "URL to access Prometheus"
  value       = "http://${var.server_ip}:9090"
}

output "server_ip" {
  description = "Server IP address"
  value       = var.server_ip
}
