import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/login', formData);
            console.log('Login Response:', response.data); // Debug: Inspect response

            // Store token
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            } else {
                throw new Error('No token in response');
            }

            // Store user_id if available
            const userId = response.data.user?.id || response.data.id || null;
            if (userId) {
                localStorage.setItem('user_id', userId);
            } else {
                console.warn('No user ID in response; proceeding without it');
            }

            setMessage('Login successful');
            navigate('/user');
        } catch (err) {
            console.error('Login Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">MyAppName</span>
                    <span className="ml-2 text-2xl">🔒</span>
                </div>
                {message && <p className={`mb-4 text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">✉️</span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">🔒</span>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center"
                    >
                        Login <span className="ml-2">➡️</span>
                    </button>
                </form>
                <p className="mt-4 text-center">
                    <Link to="/register" className="text-blue-500 hover:underline">Switch to Register? ↩️</Link>
                </p>
                <p className="mt-2 text-right text-sm">
                    <Link to="#" className="text-blue-500 hover:underline">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;