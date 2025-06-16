import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const OtpVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || ""; // Fallback for refresh
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await axios.get("/sanctum/csrf-cookie");
            const response = await axios.post("/api/verify-otp", {
                email,
                otp,
            });
            console.log("OTP Verification Response:", response.data); // Debug
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user_id", response.data.user.id);
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${response.data.token}`;
            setMessage("OTP Verified Successfully ✅");
            navigate("/user"); // Redirect to profile
        } catch (err) {
            console.error(
                "OTP Verification Error:",
                err.response?.data || err.message
            );
            setMessage(err.response?.data?.message || "Invalid or expired OTP");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">
                    OTP Verification
                </h2>
                {email && (
                    <p className="mb-2 text-center text-sm text-gray-600">
                        OTP sent to <strong>{email}</strong>
                    </p>
                )}
                {message && (
                    <p
                        className={`text-center mb-4 ${
                            message.includes("Successfully")
                                ? "text-green-600"
                                : "text-red-500"
                        }`}
                    >
                        {message}
                    </p>
                )}
                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Verify OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OtpVerification;
