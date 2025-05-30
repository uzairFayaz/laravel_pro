import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-16">
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">My App Name</span>
                    <span className="ml-2 text-3xl">🚀</span>
                </div>
                <p className="text-lg text-gray-600 mb-8">Tagline description</p>
                <div className="flex justify-center space-x-4 sm:flex-col sm:space-x-0 sm:space-y-4">
                    <Link
                        to="/login"
                        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 flex items-center"
                    >
                        <span className="mr-2">🔓</span> Login
                    </Link>
                    <Link
                        to="/register"
                        className="border border-blue-500 text-blue-500 px-6 py-3 rounded-md hover:bg-blue-50 flex items-center"
                    >
                        <span className="mr-2">📝</span> Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;