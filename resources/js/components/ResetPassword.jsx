import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const { email: initialEmail } = location.state || { email: "" };

    // Initialize email from location state
    useEffect(() => {
        if (initialEmail) {
            setFormData(prev => ({ ...prev, email: initialEmail }));
        }
    }, [initialEmail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get("/sanctum/csrf-cookie");
            const resetToken = localStorage.getItem('reset_token');
            console.log('Form Data:', formData);
            console.log('Reset Token from localStorage:', resetToken);
            if (!resetToken) {
                console.error('No reset_token found in localStorage');
                throw new Error("Reset token not found. Please request a new OTP.");
            }
            const payload = {
                ...formData,
                token: resetToken,
            };
            console.log('Reset Password Payload:', payload);
            const response = await axios.post("/api/reset-password", payload);
            console.log('Reset Password Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            localStorage.removeItem('reset_token');
            navigate("/login");
        } catch (err) {
            console.error("Reset Password Error:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || "Failed to reset password");
            setErrors(err.response?.data?.errors || []);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                        MyAppName
                    </span>
                    <span className="ml-2 text-2xl">🔒</span>
                </div>
                {message && (
                    <p
                        className={`mb-4 text-center ${
                            message.includes("Failed") || errors.length > 0
                                ? "text-red-500"
                                : "text-green-600"
                        }`}
                    >
                        {message}
                    </p>
                )}
                {errors.length > 0 && (
                    <ul className="mb-4 text-red-700 text-sm">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ✉️
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email address"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                🔒
                            </span>
                            <input
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="New password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                🔒
                            </span>
                            <input
                                type="password"
                                name="new_password_confirmation"
                                value={formData.new_password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 text-sm"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center text-sm font-medium"
                    >
                        Reset Password <span className="ml-2">➡️</span>
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Back to Login? ↩
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;