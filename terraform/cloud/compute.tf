resource "yandex_compute_instance" "mooztau" {
  name        = "${var.project_name}-vm"
  hostname    = "${var.project_name}-vm"
  platform_id = "standard-v3"
  zone        = var.yc_zone

  resources {
    cores         = var.vm_cores
    memory        = var.vm_memory_gb
    core_fraction = 100
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.ubuntu.id
      size     = var.vm_disk_gb
      type     = "network-ssd"
    }
  }

  network_interface {
    subnet_id          = yandex_vpc_subnet.mooztau.id
    nat                = true
    security_group_ids = [yandex_vpc_security_group.mooztau.id]
  }

  metadata = {
    ssh-keys  = "${var.server_user}:${file(var.ssh_public_key_path)}"
    user-data = <<-EOF
      #cloud-config
      users:
        - name: ${var.server_user}
          sudo: ALL=(ALL) NOPASSWD:ALL
          shell: /bin/bash
          ssh_authorized_keys:
            - ${file(var.ssh_public_key_path)}
    EOF
  }

  scheduling_policy {
    preemptible = var.vm_preemptible
  }
}
