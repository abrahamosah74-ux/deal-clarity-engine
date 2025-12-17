aws_region            = "us-east-1"
environment           = "prod"
instance_type         = "t3.micro"
db_instance_class     = "db.t3.micro"
db_allocated_storage  = 20

# Database password (CHANGE THIS TO A STRONG PASSWORD!)
db_username           = "dealclaritydb"
db_password           = "ChangeMe123!StrengPassword"

# Secrets from your backend/.env - FILL THESE IN!
jwt_secret            = "your_jwt_secret_from_backend_env"
paystack_secret       = "sk_live_your_paystack_key_here"

# Frontend URL
frontend_url          = "https://dealclarity-engine.vercel.app"

# SSH access (IMPORTANT: Change to your IP for security, not 0.0.0.0/0)
ssh_allowed_cidr      = "0.0.0.0/0"

# Your AWS SSH key pair name (create this in AWS EC2 first)
key_pair_name         = "deal-clarity-key"
