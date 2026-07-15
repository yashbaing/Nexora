import React, { useState } from 'react';
import Header from '../components/Header';
import { FiCreditCard, FiDollarSign, FiCopy, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

function WalletPage() {
  const [balance, setBalance] = useState(50000);
  const [copied, setCopied] = useState(false);

  const walletAddress = '1A1z7agoat4RWND2uhQAWMVrp5foscXjza';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Wallet address copied!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8 shadow-lg">
          <p className="text-white text-opacity-80 mb-2">Available Balance</p>
          <h2 className="text-4xl font-bold mb-2">₹{balance.toLocaleString()}</h2>
          <p className="text-white text-opacity-80">Total funds available for investment</p>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* UPI */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">UPI Payment</h3>
            <p className="text-gray-600 mb-4">Instant deposits via UPI</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
              Pay via UPI
            </button>
          </div>

          {/* Crypto */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200 hover:border-purple-500 transition">
            <div className="text-4xl mb-4">₿</div>
            <h3 className="text-xl font-bold mb-2">Cryptocurrency</h3>
            <p className="text-gray-600 mb-4">Deposit using Bitcoin, Ethereum</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">
              Pay with Crypto
            </button>
          </div>

          {/* Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200 hover:border-green-500 transition">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2">Card Payment</h3>
            <p className="text-gray-600 mb-4">Visa, Mastercard, RuPay</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
              Pay with Card
            </button>
          </div>
        </div>

        {/* Crypto Wallet */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h3 className="text-2xl font-bold mb-4">Crypto Wallet Address</h3>
          <p className="text-gray-600 mb-4">Send cryptocurrency to this address for instant deposits</p>
          
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
            <code className="font-mono text-sm text-gray-800 break-all">{walletAddress}</code>
            <button
              onClick={copyToClipboard}
              className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition flex-shrink-0"
            >
              {copied ? <FiCheck className="text-green-600" /> : <FiCopy className="text-gray-600" />}
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <span className="font-medium">Important:</span> Only send Bitcoin/Ethereum to this address. Other currencies will be lost.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold">Recent Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">May 10, 2026</td>
                  <td className="px-6 py-4 flex items-center gap-2"><FiCreditCard /> Card</td>
                  <td className="px-6 py-4">+₹10,000</td>
                  <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Success</span></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">May 08, 2026</td>
                  <td className="px-6 py-4 flex items-center gap-2">📱 UPI</td>
                  <td className="px-6 py-4">+₹25,000</td>
                  <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Success</span></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">May 05, 2026</td>
                  <td className="px-6 py-4 flex items-center gap-2">₿ Crypto</td>
                  <td className="px-6 py-4">+₹15,000</td>
                  <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
