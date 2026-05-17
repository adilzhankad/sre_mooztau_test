variable "server_ip" {
  description = "Public IP of the existing server"
  type        = string
  default     = "213.155.22.46"
}

variable "server_user" {
  description = "SSH user on the server"
  type        = string
  default     = "ubuntu"
}

variable "ssh_private_key_path" {
  description = "Path to SSH private key authorized on the server"
  type        = string
  default     = "~/.ssh/github_actions"
}

variable "project_path" {
  description = "Local path to the project directory (for rsync source)"
  type        = string
  default     = "/Users/adilzhankadyrov/Desktop/Mooztau_back"
}

variable "deploy_path" {
  description = "Remote path where the project will be synced and built"
  type        = string
  default     = "/home/ubuntu/mooztau/Mooztau_back"
}

variable "domain" {
  description = "Domain name to configure in Nginx"
  type        = string
  default     = "medhome.kz"
}
