terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudrun.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "postgres" {
  depends_on = [
    google_project_service.required_apis["sqladmin.googleapis.com"],
    google_sql_database_instance.private_ip_address
  ]

  name             = "deal-clarity-postgres"
  database_version = "POSTGRES_15"
  region           = var.region

  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    database_flags {
      name  = "cloudsql_iam_authentication"
      value = "on"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
    }

    ip_configuration {
      ipv4_enabled    = true
      require_ssl     = true
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }
  }
}

resource "google_sql_database_instance" "private_ip_address" {
  depends_on = [
    google_project_service.required_apis["servicenetworking.googleapis.com"]
  ]

  name             = "deal-clarity-postgres-private"
  database_version = "POSTGRES_15"
  region           = var.region

  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled    = false
      require_ssl     = true
      private_network = google_compute_network.vpc.id
    }
  }
}

# PostgreSQL Database
resource "google_sql_database" "database" {
  name     = "deal_clarity_db"
  instance = google_sql_database_instance.postgres.name
}

# Database User
resource "google_sql_user" "db_user" {
  name     = var.db_username
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# VPC Network for private IP
resource "google_compute_network" "vpc" {
  name                    = "deal-clarity-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "subnet" {
  name          = "deal-clarity-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "deal-clarity-cloudrun"
  display_name = "Deal Clarity Cloud Run Service Account"
}

# Grant Cloud Run service account permission to access Cloud SQL
resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Cloud Run Service
resource "google_cloud_run_service" "backend" {
  depends_on = [
    google_project_service.required_apis["cloudrun.googleapis.com"],
    google_sql_database.database,
    google_sql_user.db_user,
  ]

  name     = "deal-clarity-backend"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.cloud_run.email

      containers {
        image = var.docker_image

        ports {
          container_port = 5000
        }

        env {
          name  = "PORT"
          value = "5000"
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "DB_HOST"
          value = google_sql_database_instance.postgres.public_ip_address.0.ip_address
        }

        env {
          name  = "DB_PORT"
          value = "5432"
        }

        env {
          name  = "DB_NAME"
          value = google_sql_database.database.name
        }

        env {
          name  = "DB_USER"
          value = google_sql_user.db_user.name
        }

        env {
          name  = "DB_PASSWORD"
          value = var.db_password
        }

        env {
          name  = "MONGODB_URI"
          value = var.mongodb_uri
        }

        env {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        }

        env {
          name  = "PAYSTACK_SECRET_KEY"
          value = var.paystack_secret
        }

        env {
          name  = "FRONTEND_URL"
          value = var.frontend_url
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }

      timeout_seconds = 300
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "100"
        "autoscaling.knative.dev/minScale" = "1"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true
}

# Allow unauthenticated invocation
resource "google_cloud_run_service_iam_member" "noauth" {
  service       = google_cloud_run_service.backend.name
  location      = google_cloud_run_service.backend.location
  role          = "roles/run.invoker"
  member        = "allUsers"
  condition {
    title       = "allow-public-access"
    description = "Allow public access to Cloud Run service"
    expression  = "true"
  }
}

# Cloud Storage for file uploads
resource "google_storage_bucket" "uploads" {
  name          = "${var.project_id}-deal-clarity-uploads"
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  cors {
    origin          = [var.frontend_url]
    method          = ["GET", "HEAD", "PUT", "POST"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Storage bucket public read access
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Cloud Monitoring Alert for backend
resource "google_monitoring_alert_policy" "backend_error_rate" {
  display_name = "Deal Clarity Backend Error Rate"
  combiner     = "OR"

  conditions {
    display_name = "Error rate > 5%"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" resource.labels.service_name=\"${google_cloud_run_service.backend.name}\" metric.type=\"run.googleapis.com/request_count\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = []

  documentation {
    content   = "Backend error rate exceeded 5%. Check Cloud Run service logs."
    mime_type = "text/markdown"
  }
}

output "cloud_run_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "cloud_sql_public_ip" {
  description = "Cloud SQL public IP address"
  value       = google_sql_database_instance.postgres.public_ip_address[0].ip_address
}

output "storage_bucket_name" {
  description = "Cloud Storage bucket name"
  value       = google_storage_bucket.uploads.name
}

output "backend_service_url" {
  description = "Full backend service URL"
  value       = "${google_cloud_run_service.backend.status[0].url}/api"
}
