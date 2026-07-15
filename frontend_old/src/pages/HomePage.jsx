import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { FiTrendingUp, FiEye, FiTrendingDown } from 'react-icons/fi';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function HomePage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('/api/stocks');
      setStocks(response.data);
    } catch (error) {
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Trade Tokenized Stocks</h1>
          <p className="text-xl mb-8">Invest in fractional shares with UPI, Crypto, and Card payments</p>
          <div className="flex gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:bg-opacity-10">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Portfolio Summary */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Your Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Portfolio Value</p>
              <p className="text-3xl font-bold text-blue-600">₹103,789</p>
              <p className="text-green-600 text-sm mt-2">+₹5,000 (+6.7%)</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Today's Change</p>
              <p className="text-3xl font-bold text-green-600">+₹2,500</p>
              <p className="text-green-600 text-sm mt-2">+3.4%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Cash Balance</p>
              <p className="text-3xl font-bold text-purple-600">₹50,000</p>
              <p className="text-gray-600 text-sm mt-2">Available for investment</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm">Invested Amount</p>
              <p className="text-3xl font-bold text-orange-600">₹25,000</p>
              <p className="text-gray-600 text-sm mt-2">In 2 stocks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stocks Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Stocks</h2>
          <Link to="/portfolio" className="text-blue-600 hover:underline">View All →</Link>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Stocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-2xl mb-2">{stock.logo}</div>
                  <p className="font-bold text-lg">{stock.symbol}</p>
                  <p className="text-gray-600 text-sm">{stock.name}</p>
                </div>
                <FiEye className="text-gray-400" />
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold">₹{stock.price.toFixed(2)}</p>
                <div className={`flex items-center gap-2 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.changePercent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  <span className="font-medium">{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Market Cap</p>
                  <p className="font-bold">{stock.marketCap}</p>
                </div>
                <div>
                  <p className="text-gray-600">Volume</p>
                  <p className="font-bold">{stock.volume}</p>
                </div>
              </div>

              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                View Details
              </button>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Stockwave</h3>
            <p className="text-gray-400">Trade tokenized stocks with ease</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="text-gray-400 space-y-2">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="text-gray-400 space-y-2">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Help</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="text-gray-400 space-y-2">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Stockwave. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
