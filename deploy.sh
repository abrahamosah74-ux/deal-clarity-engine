#!/bin/bash

# Production deployment script for Deal Clarity Engine

set -e

echo "🚀 Starting production deployment..."

# Load environment
source .env

# Build and push Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend \
  npx mongoose-migrate up

# Start services
echo "⚡ Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Health check
echo "🏥 Performing health check..."
sleep 10
curl -f http://localhost:5000/api/health || exit 1

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://yourdomain.com"
echo "🔧 Backend API: http://api.yourdomain.com"
echo "📊 Health: http://api.yourdomain.com/api/health"
echo ""
