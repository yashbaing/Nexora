import React, { useState } from 'react';
import Header from '../components/Header';
import { FiCreditCard, FiDollarSign, FiDock } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

function DepositPage() {
  const [method, setMethod] = useState('upi');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // UPI state
  const [upiId, setUpiId] = useState('');

  // Crypto state
  const [walletAddress, setWalletAddress] = useState('');
  const [currency, setCurrency] = useState('BTC');

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (method === 'upi') {
        await axios.post(
          '/api/payments/upi',
          { upiId, amount: parseFloat(amount) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('UPI payment initiated!');
      } else if (method === 'crypto') {
        await axios.post(
          '/api/payments/crypto',
          { walletAddress, amount: parseFloat(amount), currency },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Crypto payment initiated!');
      } else if (method === 'card') {
        await axios.post(
          '/api/payments/card',
          { cardLast4: cardNumber.slice(-4), amount: parseFloat(amount), cardholderName: cardName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Card payment successful!');
      }

      setAmount('');
      setUpiId('');
      setWalletAddress('');
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Deposit Funds</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Method Selection */}
          <div>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              {/* UPI */}
              <button
                onClick={() => setMethod('upi')}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  method === 'upi'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📱</div>
                <p className="font-bold">UPI</p>
                <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
              </button>

              {/* Crypto */}
              <button
                onClick={() => setMethod('crypto')}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  method === 'crypto'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">₿</div>
                <p className="font-bold">Cryptocurrency</p>
                <p className="text-sm text-gray-600">Bitcoin, Ethereum</p>
              </button>

              {/* Card */}
              <button
                onClick={() => setMethod('card')}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  method === 'card'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">💳</div>
                <p className="font-bold">Credit/Debit Card</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
              </button>
            </div>

            {/* Quick Amounts */}
            <div className="mt-8">
              <h3 className="font-bold mb-3">Quick Amount</h3>
              <div className="grid grid-cols-2 gap-2">
                {[1000, 5000, 10000, 25000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition font-medium"
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleDeposit} className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">
                {method === 'upi' && 'UPI Payment'}
                {method === 'crypto' && 'Cryptocurrency Payment'}
                {method === 'card' && 'Card Payment'}
              </h2>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* UPI Form */}
              {method === 'upi' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={method === 'upi'}
                  />
                </div>
              )}

              {/* Crypto Form */}
              {method === 'crypto' && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Your wallet address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required={method === 'crypto'}
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <p className="text-sm text-yellow-800">
                      Send the exact amount in {currency} to our wallet. Deposit will be credited within 10 minutes.
                    </p>
                  </div>
                </>
              )}

              {/* Card Form */}
              {method === 'card' && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required={method === 'card'}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="16"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                      required={method === 'card'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={method === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={method === 'card'}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Deposit Amount</span>
                  <span className="font-bold">₹{parseFloat(amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-bold">₹0</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="font-bold">You will receive</span>
                  <span className="font-bold text-lg text-green-600">₹{parseFloat(amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Your payment is secured with 256-bit encryption
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepositPage;
