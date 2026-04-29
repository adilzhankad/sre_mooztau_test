variable "server_ip" {
  description = "IP address of the target server"
  type        = string
  default     = "213.155.22.46"
}

variable "server_user" {
  description = "SSH user on the server"
  type        = string
  default     = "ubuntu"
}

variable "ssh_private_key_path" {
  description = "Path to SSH private key"
  type        = string
  default     = "~/.ssh/id_ed25519"
}

variable "project_path" {
  description = "Local path to the project directory"
  type        = string
  default     = "/Users/adilzhankadyrov/Desktop/Mooztau_back"
}

variable "deploy_path" {
  description = "Remote path where project will be deployed"
  type        = string
  default     = "/home/ubuntu/mooztau/Mooztau_back"
}

variable "domain" {
  description = "Domain name for Nginx config"
  type        = string
  default     = "medhome.kz"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "mooztau"
}
