import React, { useState } from 'react';
import Header from '../components/Header';
import { FiToggle2, FiBell, FiLock, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function SettingsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    priceAlerts: true,
    orderNotifications: true,
    twoFactor: false,
    darkMode: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Setting updated');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Name</p>
              <p className="font-bold text-lg">{user?.name || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Email</p>
              <p className="font-bold text-lg">{user?.email || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Phone</p>
              <p className="font-bold text-lg">{user?.phone || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Member Since</p>
              <p className="font-bold text-lg">May 2026</p>
            </div>
          </div>
          <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Edit Profile
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FiBell /> Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-gray-600 text-sm">Receive updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-bold">Price Alerts</p>
                <p className="text-gray-600 text-sm">Alerts when stock prices change</p>
              </div>
              <button
                onClick={() => handleToggle('priceAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.priceAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-bold">Order Notifications</p>
                <p className="text-gray-600 text-sm">Alerts for order status updates</p>
              </div>
              <button
                onClick={() => handleToggle('orderNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.orderNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.orderNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FiLock /> Security
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-bold">Two-Factor Authentication</p>
                <p className="text-gray-600 text-sm">Enhanced security for your account</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactor')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.twoFactor ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.twoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition">
              <p className="font-bold">Change Password</p>
              <p className="text-gray-600 text-sm">Update your password regularly</p>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-bold">Dark Mode</p>
                <p className="text-gray-600 text-sm">Use dark theme</p>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
