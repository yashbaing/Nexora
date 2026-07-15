#!/bin/bash

echo "🚀 Stockwave - Setting up your trading app..."

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

echo "✅ Setup complete!"
echo ""
echo "To start the app, run:"
echo "  npm run dev"
echo ""
echo "Or run them separately:"
echo "  npm run dev:backend"
echo "  npm run dev:frontend"
