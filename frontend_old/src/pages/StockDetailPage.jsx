import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StockChart from '../components/StockChart';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
    
    // Setup WebSocket for real-time updates
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    socket.emit('subscribe_stock', symbol);
    
    socket.on('price_update', (data) => {
      setStock(prev => prev ? {
        ...prev,
        price: parseFloat(data.price),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.changePercent),
      } : null);
    });

    return () => {
      socket.emit('unsubscribe_stock', symbol);
      socket.disconnect();
    };
  }, [symbol]);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`/api/stocks/${symbol}`);
      setStock(response.data);
    } catch (error) {
      toast.error('Failed to load stock');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      await axios.post(
        '/api/trades/buy',
        { symbol, shares, price: stock.price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Stock purchased successfully!');
      setShares(1);
    } catch (error) {
      toast.error('Failed to buy stock');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-xl text-gray-600">Stock not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 mb-8 hover:text-blue-700"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-4xl mb-2">{stock.logo}</div>
                  <h1 className="text-3xl font-bold">{stock.symbol}</h1>
                  <p className="text-gray-600">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">₹{stock.price.toFixed(2)}</p>
                  <div className={`flex items-center justify-end gap-2 text-lg font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.changePercent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <StockChart symbol={stock.symbol} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div>
                  <p className="text-gray-600 text-sm">Day High</p>
                  <p className="font-bold">₹{stock.dayHigh.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Day Low</p>
                  <p className="font-bold">₹{stock.dayLow.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Market Cap</p>
                  <p className="font-bold">{stock.marketCap}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Volume</p>
                  <p className="font-bold">{stock.volume}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Buy Stock</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Shares
                </label>
                <input
                  type="number"
                  min="1"
                  value={shares}
                  onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Share Price</span>
                  <span className="font-bold">₹{stock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-bold">{shares}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total Cost</span>
                  <span className="font-bold text-lg">₹{(shares * stock.price).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mb-4"
              >
                Buy Now
              </button>

              <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
                Add to Watchlist
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 <span className="font-medium">Tip:</span> Buy low, sell high. This stock has shown good growth potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetailPage;
