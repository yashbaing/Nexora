# Stockwave - Complete Trading App

A full-featured React app for trading tokenized stocks with real-time data, multiple payment methods, and a complete backend.

## 🎯 Features

✅ **Authentication**
- User registration and login
- JWT-based authentication
- Secure password hashing

✅ **Real-time Stock Data**
- Live price updates via WebSocket
- Stock charts and analytics
- Multiple stocks (AAPL, GOOGL, MSFT, AMZN, TSLA, META)

✅ **Trading**
- Buy and sell stocks
- Portfolio management
- Order history
- Real-time portfolio value tracking

✅ **Payments**
- UPI payments (Google Pay, PhonePe, Paytm)
- Crypto payments (Bitcoin, Ethereum)
- Visa/Mastercard/RuPay card payments
- Instant deposit confirmation

✅ **Responsive Design**
- Works on mobile, tablet, and desktop
- Android and iOS compatible
- Beautiful Tailwind CSS UI

## 📁 Project Structure

```
stockwave-trading-app/
├── backend/              # Express backend
│   ├── src/
│   │   ├── index.js     # Main server
│   │   └── routes/      # API routes
│   ├── package.json
│   └── .env
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/       # All pages
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Quick Start

### 1. Clone or Extract the Project
```bash
cd stockwave-trading-app
```

### 2. Install Dependencies
```bash
npm install
# or
bash setup.sh
```

### 3. Start the Application

**Option A: Run both frontend and backend together**
```bash
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### 4. Access the App
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🔐 Test Credentials

Use these to test the app:

**Register a new account** or use:
- Email: `test@example.com`
- Password: `password123`

## 📱 Pages Included

1. **Login Page** - User authentication
2. **Register Page** - New account creation
3. **Home Page** - Dashboard with stock overview
4. **Stock Detail Page** - Detailed stock info with live chart
5. **Portfolio Page** - Holdings and investment summary
6. **Wallet Page** - Fund management and balance
7. **Deposit Page** - Payment methods (UPI, Crypto, Card)
8. **Order History Page** - Trading history
9. **Settings Page** - User preferences and profile

## 🛠 Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.io Client
- Recharts (charts)
- React Icons
- React Toastify (notifications)

### Backend
- Express.js
- Node.js
- Socket.io (real-time)
- JWT (authentication)
- Bcryptjs (password hashing)
- CORS
- Dotenv

## 📊 Real-time Features

- **Live Stock Prices**: WebSocket updates every 2 seconds
- **Portfolio Updates**: Real-time balance changes
- **Order Execution**: Instant order processing

## 💳 Payment Integration Ready

The app is ready for integration with:
- **Razorpay** - UPI, Cards, Wallets
- **Stripe** - International cards
- **Crypto APIs** - Bitcoin/Ethereum processing

## 📈 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Stocks
```
GET /api/stocks
GET /api/stocks/:symbol
GET /api/stocks/search/:query
```

### Portfolio
```
GET /api/portfolio
POST /api/portfolio/add-stock
```

### Trades
```
POST /api/trades/buy
POST /api/trades/sell
GET /api/trades/history
```

### Payments
```
POST /api/payments/upi
POST /api/payments/crypto
POST /api/payments/card
```

### User
```
GET /api/user/profile
POST /api/user/update-profile
```

## 🔄 WebSocket Events

### Client → Server
```javascript
socket.emit('subscribe_stock', 'AAPL');
socket.emit('unsubscribe_stock', 'AAPL');
```

### Server → Client
```javascript
socket.on('price_update', (data) => {
  // { symbol, price, change, changePercent, timestamp }
});
```

## 🎨 UI/UX Features

- Clean, modern interface
- Responsive grid layouts
- Real-time data visualization
- Smooth transitions and animations
- Color-coded gains/losses
- Professional typography
- Accessible form elements

## 🔒 Security Features

- JWT authentication
- Password hashing with bcryptjs
- CORS enabled
- Environment variables for sensitive data
- Input validation
- Error handling

## 📦 Build for Production

### Frontend
```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Backend
```bash
cd backend
npm start
```

## 🚀 Deployment

### Frontend
- Vercel, Netlify, GitHub Pages, AWS Amplify

### Backend
- Heroku, Railway, Render, AWS EC2, DigitalOcean

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local) - Optional
```
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Issues
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS settings

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Socket.io Documentation](https://socket.io)

## 💡 Next Steps

1. **Database**: Replace mock data with MongoDB
2. **Payment Integration**: Integrate Razorpay or Stripe
3. **Crypto Integration**: Add blockchain API
4. **Analytics**: Add advanced charts and analytics
5. **Mobile App**: Convert to React Native
6. **Testing**: Add unit and integration tests
7. **CI/CD**: Setup GitHub Actions for deployment

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ by Your Dev Team**

Happy Trading! 🚀📈
