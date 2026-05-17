variable "yc_token" {
  description = "Yandex Cloud OAuth token (https://oauth.yandex.com/authorize?response_type=token&client_id=1a6990aa636648e9b2ef855fa7bec2fb)"
  type        = string
  sensitive   = true
}

variable "yc_cloud_id" {
  description = "Yandex Cloud ID (from `yc config list` or web console)"
  type        = string
}

variable "yc_folder_id" {
  description = "Yandex Cloud folder ID"
  type        = string
}

variable "yc_zone" {
  description = "Yandex Cloud availability zone"
  type        = string
  default     = "ru-central1-a"
}

variable "vm_cores" {
  description = "Number of vCPU cores for the VM"
  type        = number
  default     = 4
}

variable "vm_memory_gb" {
  description = "VM memory in GB"
  type        = number
  default     = 8
}

variable "vm_disk_gb" {
  description = "VM boot disk size in GB"
  type        = number
  default     = 30
}

variable "vm_preemptible" {
  description = "Use preemptible (cheaper, can be stopped after 24h) VM"
  type        = bool
  default     = true
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

variable "ssh_public_key_path" {
  description = "Path to SSH public key (uploaded into VM via cloud-init)"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
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
