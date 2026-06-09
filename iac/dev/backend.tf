terraform {
  # Remote state in the CloudFormation-bootstrapped bucket. Backend config CANNOT
  # use variables, so the bucket name is hardcoded (created once via iac/bootstrap).
  backend "s3" {
    bucket         = "proops-taskmgmt-tfstate-apse1-905418181527"
    key            = "frontend-service/dev/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "proops-taskmgmt-tflock-apse1"
  }
}
