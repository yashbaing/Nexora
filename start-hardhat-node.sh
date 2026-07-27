#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# start-hardhat-node.sh
# Starts the Hardhat node persistently on http://localhost:8545 (chain 77777).
# Called by macOS LaunchAgent — auto-starts on login, auto-restarts on crash.
# ─────────────────────────────────────────────────────────────────────────────

export PATH="/Users/yashbaing/.nvm/versions/node/v24.12.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="/Users/yashbaing"

BLOCKCHAIN_DIR="$HOME/stockwave-trading-app/blockchain"
LOG_FILE="$HOME/stockwave-trading-app/hardhat-node.log"

cd "$BLOCKCHAIN_DIR" || exit 1

while true; do
  echo "[$(date)] 🚀 Starting Hardhat node (chain 77777) on http://localhost:8545 ..."
  npx hardhat node --port 8545
  EXIT_CODE=$?
  echo "[$(date)] ⚠️  Hardhat node exited (code=$EXIT_CODE). Restarting in 5 seconds..."
  sleep 5
done
