import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-2xl text-gray-600 mb-8">Page not found</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
