#!/bin/bash

# Smart Classroom AI - Quick Start Script
# This script installs dependencies and starts the development server

echo "🚀 Starting Smart Classroom AI Frontend..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. You have $(node -v)."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Navigate to project directory
PROJECT_DIR="/workspaces/smart-classroom-ui/smart-classroom-ai"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
echo "📁 Working directory: $(pwd)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the right directory?"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo "⚠️  Please edit .env.local with your API URL:"
        echo "   NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.dev"
    else
        echo "❌ .env.example not found. Please create .env.local manually."
    fi
fi

# Start development server
echo "🌐 Starting development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================================="

npm run dev