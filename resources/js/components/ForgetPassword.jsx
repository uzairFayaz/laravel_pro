import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgetPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
    });
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get("/sanctum/csrf-cookie");
            console.log('Forgot Password Request Payload:', formData);
            const response = await axios.post("/api/forget-password", formData);
            console.log('Forgot Password Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            navigate("/verify-forget-password", { state: { email: formData.email, isForgotPassword: true } });
        } catch (err) {
            console.error("Forgot Password Error:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || "Failed to process password reset");
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
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center"
                    >
                        Send OTP <span className="ml-2">➡️</span>
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

export default ForgetPassword;