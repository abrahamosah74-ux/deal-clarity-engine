#!/bin/bash
set -e

# Deal Clarity Engine - AWS EC2 Setup Script
# This script is executed when the EC2 instance starts

echo "Starting Deal Clarity Engine backend setup..."

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs npm

# Install PostgreSQL client
apt-get install -y postgresql-client

# Clone repository
cd /home/ubuntu
git clone https://github.com/abrahamosah74-ux/deal-clarity-engine.git
cd deal-clarity-engine/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
NODE_ENV=${node_env}
PORT=5000
MONGO_URI=postgresql://$(echo "${db_user}" | base64 -d):$(echo "${db_password}" | base64 -d)@${db_host}/${db_name}
JWT_SECRET=${jwt_secret}
FRONTEND_URL=${frontend_url}
LOG_LEVEL=info
PAYSTACK_SECRET_KEY=${paystack_secret}
S3_BUCKET=deal-clarity-uploads
S3_REGION=us-east-1
EOF

# Create systemd service for auto-restart
cat > /etc/systemd/system/deal-clarity.service << 'EOFSERVICE'
[Unit]
Description=Deal Clarity Engine Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/deal-clarity-engine/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOFSERVICE

# Start the service
systemctl daemon-reload
systemctl enable deal-clarity.service
systemctl start deal-clarity.service

echo "Deal Clarity Engine backend setup complete!"
echo "Service is running on port 5000"
