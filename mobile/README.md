# Nexora Mobile

Expo React Native trading app for tokenized stocks.

- **UI** inspired by [nexora-frontend-sand.vercel.app](https://nexora-frontend-sand.vercel.app/)
- **Prices** from Hyperliquid via the Nexora backend WebSocket/REST
- **Settlement** on-chain (Fuji live today; Monad Testnet when contracts are deployed)
- **Android APK** + **iOS** (Expo / EAS)

## Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iPhone), or press `a` / `i` for simulators.

## Configure

| Env | Default |
|-----|---------|
| `EXPO_PUBLIC_BACKEND_URL` | `https://nexora-backend-production-a457.up.railway.app` |

Contract addresses:

- `src/addresses-fuji.json` — live Avalanche Fuji deployment (used until Monad deploy)
- `src/addresses-monad.json` — fill after deploying to Monad Testnet

## Deploy contracts to Monad Testnet

1. Fund a wallet with test MON from https://faucet.monad.xyz
2. From repo root:

```bash
cd blockchain
MONAD_PRIVATE_KEY=0xyourkey npx hardhat run scripts/deploy.ts --network monadTestnet
```

3. Copy root `deployed-addresses.json` into `mobile/src/addresses-monad.json`
4. Point the backend `RPC_URL` + `DEPLOYED_ADDRESSES` / oracle key at the Monad deployment

## Build Android APK

```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

Debug APK (no signing setup):

```bash
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Build iOS

Requires macOS + Apple Developer account:

```bash
npx expo prebuild --platform ios
npx expo run:ios
# or: eas build --platform ios
```

## Features

- Email / demo wallet login (non-custodial keys)
- Live markets (Hyperliquid-scaled prices)
- Buy / sell tokenized stocks with oracle quotes
- Portfolio + USDC faucet
- Home / Markets / Portfolio / Wallet tabs
