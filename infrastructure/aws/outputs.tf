output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.backend.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.backend.id
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for uploads"
  value       = aws_s3_bucket.uploads.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "security_group_ec2_id" {
  description = "Security group ID for EC2"
  value       = aws_security_group.ec2.id
}

output "security_group_rds_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.rds.id
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.backend.public_ip}:5000"
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    region      = var.aws_region
    environment = var.environment
    vpc_id      = aws_vpc.main.id
    ec2_ip      = aws_eip.backend.public_ip
  }
}
