#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# start.sh — Start the full Nexora app
# This is the ONLY script you need to run. It handles everything:
#   1. Ensures Hardhat node is running (starts it if not)
#   2. Auto-redeploys contracts if the node was reset
#   3. Starts backend (Express + WebSocket)
#   4. Starts frontend (Next.js)
# ─────────────────────────────────────────────────────────────────────────────

export PATH="/Users/yashbaing/.nvm/versions/node/v24.12.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="/Users/yashbaing"

ROOT="$HOME/stockwave-trading-app"
RPC="http://localhost:8545"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     🚀  NEXORA TRADING PLATFORM        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# ── Step 1: Start Hardhat node if not running ──────────────────────────────
echo "▶ [1/4] Checking Hardhat node..."
RUNNING=$(curl -sf -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  "$RPC" 2>/dev/null)

if [ -z "$RUNNING" ]; then
  echo "   ⚡ Hardhat node not running. Starting it now..."
  cd "$ROOT/blockchain"
  nohup npx hardhat node --port 8545 > "$ROOT/hardhat-node.log" 2>&1 &
  HARDHAT_PID=$!
  echo "   📄 Hardhat PID: $HARDHAT_PID (logs: hardhat-node.log)"
  
  # Wait for it to come up
  echo "   ⏳ Waiting for node to be ready..."
  for i in $(seq 1 30); do
    sleep 1
    CHECK=$(curl -sf -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
      "$RPC" 2>/dev/null)
    if [ -n "$CHECK" ]; then
      echo "   ✅ Hardhat node ready (took ${i}s)"
      break
    fi
    if [ $i -eq 30 ]; then
      echo "   ❌ Hardhat node failed to start! Check hardhat-node.log"
      exit 1
    fi
  done
else
  echo "   ✅ Hardhat node already running at $RPC"
fi

# ── Step 2: Auto-redeploy contracts if needed ─────────────────────────────
echo ""
echo "▶ [2/4] Checking smart contracts..."
cd "$ROOT"
bash auto-redeploy.sh
if [ $? -ne 0 ]; then
  echo "   ❌ Contract deployment failed. Aborting."
  exit 1
fi

# ── Step 3: Kill any old backend/frontend processes ───────────────────────
echo ""
echo "▶ [3/4] Clearing old processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null && echo "   🔴 Killed old backend on :5001" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "   🔴 Killed old frontend on :3000" || true
sleep 1

# ── Step 4: Start backend ──────────────────────────────────────────────────
echo ""
echo "▶ [4/4] Starting Backend & Frontend..."
cd "$ROOT"
npm run dev --workspace=backend > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo "   ✅ Backend started (PID: $BACKEND_PID) → http://localhost:5001"

sleep 4

# ── Step 5: Start frontend ─────────────────────────────────────────────────
npm run dev --workspace=frontend > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "   ✅ Frontend started (PID: $FRONTEND_PID) → http://localhost:3000"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✅  ALL SYSTEMS GO                    ║"
echo "║                                        ║"
echo "║  🌐 App:      http://localhost:3000    ║"
echo "║  ⚙️  Backend:  http://localhost:5001   ║"
echo "║  🔗 Chain:    http://localhost:8545    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop backend & frontend (Hardhat node keeps running)"
echo ""

# Wait and handle Ctrl+C
trap "echo ''; echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Backend & Frontend stopped.'; echo '💡 Hardhat node is still running in background.'; exit 0" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
