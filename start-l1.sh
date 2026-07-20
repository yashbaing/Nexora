#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# start-l1.sh — Start the Nexora Private L1 network
# Usage: ./start-l1.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

AVALANCHE_CLI="$HOME/bin/avalanche"
NETWORK_NAME="nexora"

echo "🔗 Starting Nexora Private L1..."

# Check if already running
if curl -sf "http://127.0.0.1:9654/ext/health" > /dev/null 2>&1; then
  echo "✅ Nexora L1 node already running at http://127.0.0.1:9654"
else
  echo "🚀 Launching local Avalanche network with Nexora L1..."
  $AVALANCHE_CLI network start --snapshot-name $NETWORK_NAME 2>&1 || \
  $AVALANCHE_CLI blockchain deploy $NETWORK_NAME --local 2>&1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Nexora Private L1 Network Details"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Network Name : Nexora L1"
echo "  Chain ID     : 66666"
echo "  Token Symbol : NXR"
echo "  RPC URL      : http://127.0.0.1:9654/ext/bc/2M4yVQxvusf3M87KM5uDYVoGm7cum8XjjdVKPmoubmgAxgRerv/rpc"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Add to MetaMask/Core Wallet:"
echo "   Network Name : Nexora L1"
echo "   RPC URL      : http://127.0.0.1:9654/ext/bc/2M4yVQxvusf3M87KM5uDYVoGm7cum8XjjdVKPmoubmgAxgRerv/rpc"
echo "   Chain ID     : 66666"
echo "   Currency     : NXR"
echo ""
echo "💰 Faucet address (1,000,000 NXR pre-funded):"
echo "   Address     : 0xeE6291906A4A2ba5F60BFB233C30e742aF02e6C5"
echo "   Private Key : 0x51767861fd278a63460bac8feaa497fe0b3a16ad2cb145093d2e0f9f7011894a"
echo ""
