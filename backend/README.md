# Nexora Backend

Express backend for the Nexora trading application.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

## Running

```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`

### User
- GET `/api/user/profile`
- POST `/api/user/update-profile`

### Stocks
- GET `/api/stocks`
- GET `/api/stocks/:symbol`
- GET `/api/stocks/search/:query`

### Portfolio
- GET `/api/portfolio`
- POST `/api/portfolio/add-stock`

### Payments
- POST `/api/payments/upi`
- POST `/api/payments/crypto`
- POST `/api/payments/card`

### Trades
- POST `/api/trades/buy`
- POST `/api/trades/sell`
- GET `/api/trades/history`
