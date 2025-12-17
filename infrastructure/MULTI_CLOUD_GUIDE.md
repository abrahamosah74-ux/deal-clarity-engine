# Multi-Cloud Deployment Guide

## Overview

Deal Clarity Engine is deployed across **3 major cloud providers**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN (Global)                  │
│              (Caches static content, routes traffic)        │
└────────────────┬──────────┬──────────┬───────────────────────┘
                 │          │          │
        ┌────────▼──┐ ┌─────▼──────┐ ┌─▼───────────────┐
        │    AWS    │ │   Google   │ │      Azure      │
        │  (Primary)│ │   (Backup) │ │  (Disaster)     │
        │           │ │            │ │                 │
        │  EC2 +    │ │ Compute    │ │ App Service +   │
        │  RDS +    │ │ Engine +   │ │ Azure SQL +     │
        │  S3       │ │ Cloud SQL  │ │ Blob Storage    │
        └──────┬────┘ └─────┬──────┘ └─┬───────────────┘
               │            │          │
               └────────────┴──────────┘
                      │
               ┌──────▼──────────┐
               │  Load Balancer  │
               │  (Route53/GCP)  │
               └─────────────────┘
```

---

## Deployment Strategy

### Phase 1: AWS (Primary) - IN PROGRESS
- ✅ Terraform configuration ready
- ⏳ Deploy EC2 + RDS + S3
- ⏳ Set up monitoring
- ⏳ Configure backups

### Phase 2: Google Cloud (Backup)
- ☐ Terraform configuration
- ☐ Deploy Compute Engine + Cloud SQL
- ☐ Database replication from AWS
- ☐ Failover scripts

### Phase 3: Azure (Disaster Recovery)
- ☐ Terraform configuration
- ☐ Deploy App Service + Azure SQL
- ☐ Periodic sync from AWS
- ☐ Disaster recovery testing

### Phase 4: Global Infrastructure
- ☐ Cloudflare CDN setup
- ☐ Route53 load balancing
- ☐ Health checks
- ☐ Auto-failover configuration

### Phase 5: Automation
- ☐ CI/CD pipeline
- ☐ Automated deployments
- ☐ Backup automation
- ☐ Monitoring/alerts

---

## Cost Analysis

| Service | Free Tier | Monthly (1 cloud) | Monthly (3 clouds) |
|---------|-----------|-------------------|--------------------|
| Compute | 12mo      | $10-20            | $30-60             |
| Database| 12mo      | $20               | $60                |
| Storage | Always    | $2-5              | $10-15             |
| CDN     | Always    | $0-10             | $0-10              |
| **Total**| **$0**   | **$32-55**        | **$100-145**       |

---

## Getting Started

### AWS Setup (Primary) - START HERE
```bash
cd infrastructure/aws
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

### Google Cloud Setup (When ready)
```bash
cd infrastructure/gcp
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

### Azure Setup (When ready)
```bash
cd infrastructure/azure
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

---

## Environment Variables Needed

Each cloud deployment needs these secrets:

```
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=sk_live_your_key
FRONTEND_URL=https://dealclarity-engine.vercel.app
MONGO_URI=database_connection_string
```

Store these in:
- AWS: Secrets Manager + EC2 User Data
- GCP: Cloud Secrets Manager
- Azure: Key Vault

---

## Database Synchronization

After deploying to multiple clouds, set up replication:

```bash
# AWS → GCP
AWS_DB_HOST=aws-db.example.com
GCP_DB_HOST=gcp-db.example.com

# Use pg_dump for PostgreSQL
pg_dump -h $AWS_DB_HOST -U dealclaritydb dealclarity | \
  psql -h $GCP_DB_HOST -U dealclaritydb -d dealclarity
```

---

## Health Checks & Failover

Configure Cloudflare to monitor all 3 backends:

1. **Health Check URLs:**
   - AWS: `http://aws.example.com/api/health`
   - GCP: `http://gcp.example.com/api/health`
   - Azure: `http://azure.example.com/api/health`

2. **Failover Logic:**
   - Primary: AWS (active)
   - Secondary: GCP (if AWS down)
   - Tertiary: Azure (if AWS+GCP down)

3. **Switch Time:** < 30 seconds

---

## Monitoring & Alerts

Set up monitoring in each cloud:

```
AWS CloudWatch → SNS → Email/Slack
GCP Cloud Monitoring → Pub/Sub → Email/Slack
Azure Monitor → Action Groups → Email/Slack
```

Monitor these metrics:
- CPU usage (> 80%)
- Memory usage (> 85%)
- Database connections (> 90)
- API response time (> 1s)
- Error rate (> 1%)

---

## Backup Strategy

**Automatic Backups:**
- AWS RDS: 30-day retention
- GCP Cloud SQL: 30-day retention
- Azure SQL: 35-day retention

**Manual Backups:**
```bash
# Daily snapshots to S3
aws ec2 create-image --instance-id i-xxx --name backup-$(date +%Y-%m-%d)
```

**Disaster Recovery Test:**
Every 30 days, test restoring from backup to validate recovery time.

---

## Cost Optimization

1. **Use Free Tier:** Take advantage of 12-month free tier
2. **Spot Instances:** Use for non-critical workloads
3. **Reserved Instances:** 30-40% discount for 1-year commitment
4. **Scheduled Scaling:** Scale down during off-hours
5. **Data Transfer:** Optimize cross-region data transfer

---

## Security Checklist

- [ ] Encrypt all databases (enabled in Terraform)
- [ ] Use VPCs for isolation
- [ ] Restrict SSH access (to your IP only)
- [ ] Enable MFA on cloud accounts
- [ ] Rotate secrets monthly
- [ ] Enable CloudTrail/Cloud Logging
- [ ] Regular security audits
- [ ] DDoS protection (Cloudflare)

---

## Scaling Considerations

When you need to scale:

1. **Vertical:** Upgrade instance types
2. **Horizontal:** Add more instances behind load balancer
3. **Database:** Upgrade RDS instance class or use read replicas
4. **Static Content:** Increase CDN cache TTL

---

## Useful Commands

```bash
# Get infrastructure status
terraform state list

# Show specific resource
terraform state show aws_instance.backend

# Update costs
terraform plan -json | grep cost

# Destroy specific resource
terraform destroy -target=aws_instance.backend

# Format/validate
terraform fmt
terraform validate
```

---

## Support

For issues:
1. Check cloud provider docs
2. Review Terraform logs: `TF_LOG=DEBUG terraform apply`
3. Check application logs on EC2/Compute Engine
4. Verify network connectivity and security groups

---

## Next Steps

1. ✅ Complete AWS setup
2. ⏳ Deploy to Google Cloud
3. ⏳ Deploy to Azure
4. ⏳ Configure Cloudflare CDN
5. ⏳ Set up automated failover

See individual cloud directories for specific deployment instructions.
