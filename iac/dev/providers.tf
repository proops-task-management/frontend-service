terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source = "hashicorp/aws"
      # ~> 6.0 ON PURPOSE: this account denies creating S3 without Owner+Email tags
      # at create time, and provider 5.x does not propagate default_tags onto the S3
      # create. Provider 6.x does. (Per-root-config pin — Day 27 EC2 root stays ~> 5.0.)
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # Mandatory tags applied to every resource AT create (policy requirement).
  default_tags {
    tags = {
      Owner       = var.owner
      Email       = var.email
      Project     = "proops-taskmgmt"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
