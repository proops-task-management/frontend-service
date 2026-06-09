data "aws_caller_identity" "current" {}

# Demo resource — the thing the IaC pipeline applies (on merge) and destroys
# (manual). Name follows Day 27 convention {prefix}-{project}-{env}-{type}-{region}-{purpose}
# with an account-id suffix for S3's global-namespace uniqueness.
resource "aws_s3_bucket" "demo" {
  bucket = "proops-taskmgmt-${var.environment}-s3-apse1-demo-${data.aws_caller_identity.current.account_id}"
  # Owner/Email/Project/Environment tags come from provider default_tags.
}

resource "aws_s3_bucket_public_access_block" "demo" {
  bucket                  = aws_s3_bucket.demo.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
