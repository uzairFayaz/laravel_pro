import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/register', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user.id);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            setMessage('Registration successful');
            navigate('/profile');
        } catch (err) {
            console.error('Register Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.errors?.join(', ') || 'Failed to register');
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
                        <span className="absolute left-3 top-3 text-gray-500">👤</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
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
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">🔒</span>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center"
                    >
                        Register <span className="ml-2">➡️</span>
                    </button>
                </form>
                <p className="mt-4 text-center">
                    <Link to="/login" className="text-blue-500 hover:underline">Switch to Login? ↩️</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;