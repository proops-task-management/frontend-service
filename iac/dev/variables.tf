variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "owner" {
  description = "Owner tag (mandatory by account policy)"
  type        = string
  default     = "minh_dt"
}

variable "email" {
  description = "Email tag (mandatory by account policy)"
  type        = string
  default     = "dtminh1611@gmail.com"
}

# Path-routing demo marker — safe to delete.
