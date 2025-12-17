variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
  validation {
    condition     = length(var.project_id) > 0
    error_message = "Project ID cannot be empty."
  }
}

variable "region" {
  description = "Google Cloud region (e.g., us-central1, europe-west1)"
  type        = string
  default     = "us-central1"
  validation {
    condition     = can(regex("^[a-z]+-[a-z]+[0-9]$", var.region))
    error_message = "Region must be a valid GCP region format."
  }
}

variable "db_username" {
  description = "PostgreSQL database username"
  type        = string
  default     = "deal_clarity_user"
  validation {
    condition     = length(var.db_username) >= 3
    error_message = "Database username must be at least 3 characters."
  }
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters."
  }
}

variable "jwt_secret" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT secret must be at least 32 characters."
  }
}

variable "paystack_secret" {
  description = "Paystack secret key for payment processing"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.paystack_secret) > 0
    error_message = "Paystack secret key cannot be empty."
  }
}

variable "mongodb_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.mongodb_uri) > 0
    error_message = "MongoDB URI cannot be empty."
  }
}

variable "frontend_url" {
  description = "Frontend application URL (for CORS)"
  type        = string
  default     = "https://dealclarity-engine.vercel.app"
  validation {
    condition     = can(regex("^https://", var.frontend_url))
    error_message = "Frontend URL must start with https://"
  }
}

variable "docker_image" {
  description = "Docker image for the backend application"
  type        = string
  default     = "gcr.io/cloud-builders/docker"
  validation {
    condition     = length(var.docker_image) > 0
    error_message = "Docker image URI cannot be empty."
  }
}
