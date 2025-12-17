# GCP Deployment Guide for Deal Clarity Engine

## Overview

This guide deploys the Deal Clarity Engine backend to **Google Cloud Platform (GCP)** using Terraform. GCP's free tier ($300 credits for 90 days) covers:
- Cloud Run (serverless backend execution)
- Cloud SQL (PostgreSQL database)
- Cloud Storage (file uploads)

**Estimated costs after free tier:** $5-8/month

## Prerequisites

1. **GCP Account** - Sign up at https://console.cloud.google.com (free tier eligible)
2. **Terraform** - Already installed (v1.14.2)
3. **Google Cloud SDK** - For local development and authentication

## Step-by-Step Setup

### 1. Create GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a Project** (top left)
3. Click **NEW PROJECT**
4. Enter project name: `deal-clarity-engine`
5. Click **CREATE**
6. Wait for project to be created and select it

### 2. Enable Billing

1. In the console, go to **Billing** (left menu)
2. Click **Link Billing Account**
3. Create or select existing billing account
4. Confirm $300 free credits will be applied

### 3. Get Project ID

1. Go to **Project Settings** (gear icon, top right)
2. Copy the **Project ID** (not the project name)
3. Save this for later use

### 4. Create Service Account for Terraform

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **CREATE SERVICE ACCOUNT**
3. Enter service account name: `terraform`
4. Click **CREATE AND CONTINUE**
5. Grant these roles:
   - Cloud Run Admin
   - Cloud SQL Admin
   - Service Account User
   - Storage Admin
   - Compute Admin
6. Click **CONTINUE** → **DONE**

### 5. Create and Download Service Account Key

1. Click the newly created **terraform** service account
2. Go to **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Select **JSON** format
5. Click **CREATE**
6. A JSON file will download automatically
7. Save it securely (you'll use it for authentication)

### 6. Install Google Cloud SDK

**On Windows (using PowerShell):**

```powershell
# Option 1: Using winget (if available)
winget install Google.CloudSDK

# Option 2: Download and install manually from
# https://cloud.google.com/sdk/docs/install
```

After installation, verify:
```powershell
gcloud --version
```

### 7. Authenticate with GCP

```powershell
# Set your project ID
$env:GOOGLE_CLOUD_PROJECT = "your-gcp-project-id"

# Authenticate using service account key
gcloud auth activate-service-account --key-file="C:\path\to\service-account-key.json"

# Set the project
gcloud config set project your-gcp-project-id
```

### 8. Update terraform.tfvars

Edit `infrastructure/gcp/terraform.tfvars` with your values:

```hcl
project_id       = "your-gcp-project-id"
region           = "us-central1"  # or any other GCP region
db_username      = "deal_clarity_user"
db_password      = "YourStrongPassword123!"  # Min 8 characters
jwt_secret       = "your-jwt-secret-key-minimum-32-characters-here"
paystack_secret  = "sk_live_your_paystack_secret_key"
mongodb_uri      = "mongodb+srv://user:password@cluster.mongodb.net/database"
frontend_url     = "https://dealclarity-engine.vercel.app"
docker_image     = "gcr.io/your-project/deal-clarity-backend:latest"
```

**To get these values:**
- `db_password`: Create a strong 12+ character password
- `jwt_secret`: Copy from `backend/.env` (must be 32+ chars)
- `paystack_secret`: Copy from `backend/.env`
- `mongodb_uri`: Copy from `backend/.env`
- `docker_image`: You'll build and push this in the next step

### 9. Build and Push Docker Image to GCP

```powershell
# Navigate to backend directory
cd "c:\Users\Teest\OneDrive\Desktop\deal-clarity-engine\backend"

# Configure Docker authentication
gcloud auth configure-docker

# Build Docker image
docker build -t gcr.io/your-gcp-project-id/deal-clarity-backend:latest .

# Push to Google Container Registry
docker push gcr.io/your-gcp-project-id/deal-clarity-backend:latest

# Verify push was successful
gcloud container images list --repository=gcr.io/your-gcp-project-id
```

### 10. Initialize Terraform

```powershell
cd "c:\Users\Teest\OneDrive\Desktop\deal-clarity-engine\infrastructure\gcp"

# Initialize Terraform (downloads GCP provider)
& "C:\Users\Teest\Downloads\terraform_1.14.2_windows_amd64\terraform.exe" init
```

Expected output:
```
Terraform has been successfully initialized!
```

### 11. Plan Terraform Deployment

```powershell
# Preview all changes that will be made
& "C:\Users\Teest\Downloads\terraform_1.14.2_windows_amd64\terraform.exe" plan
```

Review the output. You should see resources being created:
- Cloud SQL PostgreSQL instance
- Cloud Run service
- Cloud Storage bucket
- Service accounts and IAM roles

### 12. Apply Terraform Configuration

```powershell
# Deploy to GCP (type "yes" when prompted)
& "C:\Users\Teest\Downloads\terraform_1.14.2_windows_amd64\terraform.exe" apply
```

**This will take 5-10 minutes.** You'll see progress messages.

Once complete, Terraform will output:
```
Outputs:

backend_service_url = "https://deal-clarity-backend-xxxxx-uc.a.run.app/api"
cloud_run_url = "https://deal-clarity-backend-xxxxx-uc.a.run.app"
cloud_sql_public_ip = "x.x.x.x"
storage_bucket_name = "your-project-deal-clarity-uploads"
```

### 13. Update Vercel with New Backend URL

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **deal-clarity-engine** project
3. Go to **Settings** → **Environment Variables**
4. Update or add:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** (the `backend_service_url` from Terraform output)
   - **Environments:** Production, Preview, Development
5. Click **Save**
6. Go to **Deployments** and redeploy (or push a commit to trigger auto-deploy)

### 14. Verify Backend is Working

Test the backend URL:

```powershell
# Get the Cloud Run URL from Terraform output
$backendUrl = "https://deal-clarity-backend-xxxxx-uc.a.run.app"

# Test the API
Invoke-WebRequest -Uri "$backendUrl/" -Method GET
```

Should respond with:
```json
{
  "message": "Welcome to Deal Clarity Engine API",
  "version": "1.0.0",
  "status": "running",
  "checks": {...}
}
```

### 15. Test Full Application

1. Go to https://dealclarity-engine.vercel.app
2. Try to login
3. You should connect to the new GCP backend
4. Create some test data (deals, calendar events)
5. Verify data persists

## Monitoring

### View Cloud Run Logs

```powershell
# Stream real-time logs
gcloud run logs read deal-clarity-backend --limit=50 --follow

# View specific revision logs
gcloud run logs read deal-clarity-backend --limit=100
```

### View Cloud SQL Logs

1. Go to [Cloud SQL Instances](https://console.cloud.google.com/sql/instances)
2. Click **deal-clarity-postgres**
3. Go to **Logs** tab

### Set Up Alerts

1. Go to **Cloud Run** → **deal-clarity-backend**
2. Scroll down to **Metrics**
3. Set up alerts for:
   - Request count
   - Error rate
   - Latency

## Cost Management

To avoid unexpected charges:

1. **Set Budget Alerts:**
   - Go to **Billing** → **Budgets and alerts**
   - Create alert at $50/month
   - Get emailed when approaching budget

2. **Check Free Tier Usage:**
   - Go to **Billing** → **Billing reports**
   - Verify you're using free tier resources

3. **Expected Costs (after free tier):**
   - Cloud Run: ~$2-3/month (pay per million requests)
   - Cloud SQL: ~$10-15/month (db.f1-micro is cheapest)
   - Cloud Storage: ~$0.02/month (unless storing lots of files)
   - **Total: ~$12-18/month**

## Cleanup (if needed)

To delete all resources:

```powershell
cd "c:\Users\Teest\OneDrive\Desktop\deal-clarity-engine\infrastructure\gcp"

# Destroy all resources
& "C:\Users\Teest\Downloads\terraform_1.14.2_windows_amd64\terraform.exe" destroy
```

## Troubleshooting

### "Permission denied" error
- Verify service account key file path is correct
- Run `gcloud auth list` to see authenticated accounts
- Run `gcloud config list` to verify project is set

### Cloud Run can't connect to database
- Check Cloud SQL public IP in Terraform output
- Verify environment variables in Cloud Run are correct
- Check Cloud SQL instance is running (in Cloud SQL console)

### Docker push fails
- Run `gcloud auth configure-docker` again
- Verify project ID is correct in image name
- Check Docker is installed and running

## Next Steps

After GCP deployment is working, you can:
1. Set up backups for Cloud SQL
2. Configure custom domain
3. Set up CI/CD for automatic deployments
4. Add additional Cloud Run services
5. Deploy to another region for redundancy

