#!/bin/bash

echo "🚀 Setting up Deal Clarity Engine..."

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install $1 and try again."
        exit 1
    fi
}

check_command node
check_command npm
check_command docker
check_command docker-compose

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/public

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Set up environment
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit the .env file with your actual configuration."
    echo "   Required: PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, JWT_SECRET"
else
    echo "✅ .env file already exists"
fi

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start the application: docker-compose up -d"
echo "3. Visit http://localhost:3000"
echo ""
echo "Optional: Run tests"
echo "  Backend: cd backend && npm test"
echo "  Frontend: cd frontend && npm test"
echo ""
