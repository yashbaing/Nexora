import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">📈</span>
          </div>
          <span className="font-bold text-xl hidden sm:block">Stockwave</span>
        </Link>
        
        <nav className="flex gap-6 items-center">
          <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <Link to="/portfolio" className="text-gray-600 hover:text-gray-900">Portfolio</Link>
          <Link to="/wallet" className="text-gray-600 hover:text-gray-900">Wallet</Link>
          <Link 
            to="/deposit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            Deposit <FiArrowRight />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
