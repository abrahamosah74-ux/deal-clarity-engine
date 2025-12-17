# AWS Deployment Guide

## Prerequisites

1. **AWS Account** - [Create one here](https://aws.amazon.com/free)
2. **Terraform** - [Download](https://www.terraform.io/downloads.html)
3. **AWS CLI** - [Install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
4. **AWS Credentials** - Configure with `aws configure`
5. **SSH Key Pair** - Create in AWS EC2 Dashboard

## Quick Start

### 1. Create terraform.tfvars file

```bash
cd infrastructure/aws

cat > terraform.tfvars << 'EOF'
aws_region     = "us-east-1"
environment    = "prod"
instance_type  = "t3.micro"
db_instance_class = "db.t3.micro"

# Database (change these!)
db_username    = "dealclaritydb"
db_password    = "YourSecurePassword123!"  # Change this!

# Secrets (from your .env file)
jwt_secret     = "your_jwt_secret_from_.env"
paystack_secret = "sk_live_your_paystack_key"

# Frontend URL
frontend_url   = "https://dealclarity-engine.vercel.app"

# SSH Access (change to your IP!)
ssh_allowed_cidr = "0.0.0.0/0"  # DANGEROUS! Use your IP: 203.0.113.0/32

# Your SSH key pair name (created in AWS)
key_pair_name  = "deal-clarity-key"

# Optional
db_allocated_storage = 20
EOF
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Review planned changes

```bash
terraform plan
```

### 4. Deploy to AWS

```bash
terraform apply
```

When prompted, type **yes** to confirm.

### 5. Get your backend URL

After deployment completes, Terraform will output:

```
backend_url = "http://your-eip-address:5000"
```

Update your Vercel environment variable:
- Name: `REACT_APP_API_URL`
- Value: `http://your-eip-address:5000/api` (or get static IP)

---

## Managing Your Infrastructure

### View current state
```bash
terraform state list
terraform state show aws_instance.backend
```

### Update configuration
Edit `terraform.tfvars` and run:
```bash
terraform apply
```

### Destroy everything (WARNING!)
```bash
terraform destroy
```

---

## Cost Estimates

**Free Tier (12 months):**
- EC2: t3.micro (750 hours/month) - **FREE**
- RDS: db.t3.micro (750 hours/month) - **FREE**
- Data transfer < 1GB - **FREE**
- **Total: ~$0/month**

**After Free Tier:**
- EC2: t3.micro - **~$10/month**
- RDS: db.t3.micro - **~$20/month**
- Storage (20GB) - **~$2/month**
- Data transfer - **~$1-5/month**
- **Total: ~$33-37/month**

---

## Important Notes

⚠️ **Security:**
- Change `ssh_allowed_cidr` from `0.0.0.0/0` to your IP
- Store `terraform.tfvars` in `.gitignore` (don't commit secrets!)
- RDS password must be > 8 characters
- Enable 2FA on AWS account

⚠️ **Backups:**
- RDS has 30-day backup retention
- Enable CloudWatch monitoring
- Test disaster recovery plans

⚠️ **Monitoring:**
- Check CloudWatch logs: `CloudWatch > Logs > /aws/ec2/deal-clarity`
- Monitor EC2 metrics: `EC2 > Instances > Monitoring tab`

---

## Troubleshooting

### EC2 instance won't start
```bash
# Check logs
aws ec2 describe-instances --instance-ids <instance-id> --query 'Reservations[0].Instances[0].StatusReason'

# Check user-data logs
ssh -i your-key.pem ubuntu@your-ip
sudo tail -f /var/log/cloud-init-output.log
```

### Can't connect to RDS
```bash
# Test connectivity from EC2
psql -h <rds-endpoint> -U dealclaritydb -d dealclarity
```

### Need to update backend code
```bash
ssh -i your-key.pem ubuntu@your-ip
cd deal-clarity-engine/backend
git pull origin main
npm install
sudo systemctl restart deal-clarity.service
```

---

## Next Steps

1. ✅ Deploy to AWS
2. 📧 Deploy to Google Cloud (similar process)
3. 🔵 Deploy to Azure
4. 🌍 Set up Cloudflare CDN
5. 🔄 Configure load balancing

See `../MULTI_CLOUD_GUIDE.md` for the complete multi-cloud strategy.
