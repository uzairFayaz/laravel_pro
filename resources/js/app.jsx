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

const App = () => {
    return(
        <BrowserRouter>

            <div className="min-h-screen bg-gray-100 flex flex-col">
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register"  element={<Register/>}/>
                    <Route path="/user" element={<UserProfile/>} />
                    <Route path="/groups" element={<Groups/>}  />
                    <Route path="/groups/:id"  element={<GroupDetails/>}/>

                </Routes>
            </div>
</BrowserRouter>)
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
