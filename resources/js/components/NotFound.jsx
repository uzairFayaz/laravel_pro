import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-2xl mb-4">Page Not Found</p>
      <p className="text-lg mb-6">Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
