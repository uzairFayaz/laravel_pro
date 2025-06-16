import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const { email } = location.state || { email: "" };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resetToken = localStorage.getItem('reset_token');
            if (!resetToken) {
                throw new Error("Reset token not found. Please request a new OTP.");
            }
            console.log('Reset Password Request Payload:', {
                ...formData,
                reset_token: resetToken,
            });
            const response = await axios.post(
                "/api/reset-password",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${resetToken}`,
                    },
                }
            );
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
                    <ul className="mb-4 text-red-500 text-sm">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">
                            ✉️
                        </span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">
                            🔒
                        </span>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="New Password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">
                            🔒
                        </span>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Confirm New Password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center"
                    >
                        Reset Password <span className="ml-2">➡️</span>
                    </button>
                </form>
                <p className="mt-4 text-center">
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Back to Login? ↩
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;