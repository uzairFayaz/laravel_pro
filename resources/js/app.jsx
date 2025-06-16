import React from "react";
import { useState } from "react";
import { Router } from "react-router-dom";
import "@vite/client";
import Navbar from "./components/Navbar";
import { Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import UserProfile from "./components/UserProfile";
import Groups from "./components/Group";
import GroupDetails from "./components/GroupDetails";
import NotFound from "./components/NotFound";
import { AuthProvider } from "./components/AuthContext";
import OtpVerification from "./components/OtpVerification";
import ForgetPassword from "./components/ForgetPassword";
import VerifyForgetPassword from "./components/VerifyForgetPassword";
import ResetPassword from "./components/ResetPassword";
import CreateStory from "./components/CreateStories";
import CreatePost from "./components/CreatePost";

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-100 flex flex-col">
                    <Navbar />
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<OtpVerification />} />
                        <Route path="/user" element={<UserProfile />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/groups/:id" element={<GroupDetails />} />
                        <Route path="/forgot-password" element={<ForgetPassword/>} />
                        <Route path="/verify-forget-password" element={<VerifyForgetPassword/>} /> 
                        <Route path="/reset-password" element={<ResetPassword/>} />
                        <Route path="/createStory" element={<CreateStory/>}/>
                        <Route path="/createPost" element={<CreatePost/>} />


                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
