import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolio(response.data);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Portfolio</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Total Value</p>
            <p className="text-3xl font-bold text-blue-600">₹{portfolio?.totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Cash Balance</p>
            <p className="text-3xl font-bold text-green-600">₹{portfolio?.cash.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Holdings</p>
            <p className="text-3xl font-bold text-purple-600">{portfolio?.stocks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Return</p>
            <p className="text-3xl font-bold text-orange-600">
              +₹{portfolio?.stocks.reduce((acc, s) => acc + s.gain, 0).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Holdings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Shares</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Current Price</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Invested</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Current Value</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Gain/Loss</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Return %</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.stocks.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">{stock.symbol}</td>
                    <td className="px-6 py-4">{stock.shares}</td>
                    <td className="px-6 py-4">₹{stock.currentPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">₹{stock.investedAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">₹{stock.currentValue.toFixed(2)}</td>
                    <td className={`px-6 py-4 flex items-center gap-2 ${stock.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.gain >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                      ₹{stock.gain.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${stock.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.gainPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;
