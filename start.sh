#!/bin/bash

cd ~/stockwave-trading-app

echo "🚀 Starting Stockwave Trading App..."
echo ""
echo "📋 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start backend
echo "▶️  Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend
echo "▶️  Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT

wait
