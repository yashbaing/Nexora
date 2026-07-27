#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# auto-redeploy.sh
# Checks if the Hardhat node just reset (contracts gone) and redeploys.
# Run this every time you start the app, or on a cron.
# ─────────────────────────────────────────────────────────────────────────────

export PATH="/Users/yashbaing/.nvm/versions/node/v24.12.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="/Users/yashbaing"

ROOT="$HOME/stockwave-trading-app"
BLOCKCHAIN="$ROOT/blockchain"
ADDRESSES="$ROOT/deployed-addresses.json"
RPC="http://localhost:8545"

echo "🔍 Checking if Hardhat node is up and contracts are deployed..."

# 1. Wait for the Hardhat node to be available (up to 30 seconds)
for i in $(seq 1 30); do
  RESPONSE=$(curl -sf -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    "$RPC" 2>/dev/null)
  if [ -n "$RESPONSE" ]; then
    echo "✅ Hardhat node is up at $RPC"
    break
  fi
  echo "⏳ Waiting for Hardhat node... ($i/30)"
  sleep 1
done

# Check node came up
RESPONSE=$(curl -sf -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  "$RPC" 2>/dev/null)
if [ -z "$RESPONSE" ]; then
  echo "❌ Hardhat node did not start. Cannot deploy contracts."
  exit 1
fi

# 2. Check if the deployed MockUSDC contract still exists on-chain
USDC_ADDR=$(python3 -c "import json; d=json.load(open('$ADDRESSES')); print(d.get('MockUSDC',''))" 2>/dev/null || echo "")

if [ -z "$USDC_ADDR" ]; then
  echo "⚠️  No deployed-addresses.json found. Deploying contracts..."
  NEEDS_DEPLOY=true
else
  # Call eth_getCode on the MockUSDC address — if it returns "0x", contract is gone (node reset)
  CODE=$(curl -sf -X POST -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$USDC_ADDR\",\"latest\"],\"id\":2}" \
    "$RPC" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result'])" 2>/dev/null || echo "0x")

  if [ "$CODE" = "0x" ] || [ -z "$CODE" ]; then
    echo "⚠️  MockUSDC contract not found at $USDC_ADDR — node was reset! Redeploying..."
    NEEDS_DEPLOY=true
  else
    echo "✅ Contracts are live at $USDC_ADDR — no redeployment needed."
    NEEDS_DEPLOY=false
  fi
fi

# 3. Deploy if needed
if [ "$NEEDS_DEPLOY" = "true" ]; then
  echo ""
  echo "🚀 Deploying contracts to fresh Hardhat node..."
  cd "$BLOCKCHAIN"
  npx hardhat run scripts/deploy.ts --network localhost
  
  if [ $? -eq 0 ]; then
    echo "✅ Contracts deployed successfully!"
    echo "📄 New addresses saved to deployed-addresses.json"
  else
    echo "❌ Contract deployment FAILED. Check the Hardhat node logs."
    exit 1
  fi
fi

echo ""
echo "🎉 Nexora blockchain layer is ready!"
echo "   RPC: $RPC"
if [ -f "$ADDRESSES" ]; then
  echo "   MockUSDC: $(python3 -c "import json; print(json.load(open('$ADDRESSES'))['MockUSDC'])" 2>/dev/null)"
  echo "   Platform: $(python3 -c "import json; print(json.load(open('$ADDRESSES'))['StockwavePlatform'])" 2>/dev/null)"
fi
