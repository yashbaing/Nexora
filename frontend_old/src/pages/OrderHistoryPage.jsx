import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

function OrderHistoryPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/trades/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrades(response.data);
    } catch (error) {
      toast.error('Failed to load order history');
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
        <h1 className="text-3xl font-bold mb-8">Order History</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">{trades.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Buy Orders</p>
            <p className="text-3xl font-bold text-green-600">
              {trades.filter(t => t.type === 'BUY').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Sell Orders</p>
            <p className="text-3xl font-bold text-red-600">
              {trades.filter(t => t.type === 'SELL').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Total Value</p>
            <p className="text-3xl font-bold text-purple-600">
              ₹{trades.reduce((acc, t) => acc + t.totalAmount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold">All Orders</h2>
          </div>

          {trades.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600 text-lg">No orders yet. Start trading!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Total Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{trade.id}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-bold ${trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.type === 'BUY' ? <FiArrowDown /> : <FiArrowUp />}
                          {trade.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                      <td className="px-6 py-4">{trade.shares}</td>
                      <td className="px-6 py-4">₹{trade.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold">₹{trade.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trade.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : trade.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryPage;
