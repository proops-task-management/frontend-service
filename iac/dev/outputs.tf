output "demo_bucket" {
  description = "Name of the demo S3 bucket created by the IaC pipeline"
  value       = aws_s3_bucket.demo.id
}
