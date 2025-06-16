import React , {useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const Navbar = () => {
     const{isAuthenticated, setIsAuthenticated} = useContext(AuthContext);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        if(token){
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },[]);

    const handleLogout = async () => {
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            delete axios.defaults.headers.common['Authorization'];
            setIsAuthenticated(false);
            navigate('/login');
        } catch (err) {
            console.error('Logout Error:', err.response?.data || err.message);
        }
    };

    return (
       <nav className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
            <Link to="/" className="text-xl font-bold text-gray-900">MyAppName</Link>
            <div className="hidden sm:flex space-x-4">
                {isAuthenticated ? (
                    <>
                        <Link to="/user" className="text-gray-900 hover:text-blue-500">Profile</Link>
                        <Link to="/groups" className="text-gray-900 hover:text-blue-500">Groups</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-900 hover:text-blue-500">Login</Link>
                        <Link to="/register" className="text-gray-900 hover:text-blue-500">Register</Link>
                    </>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-2xl">🔔</span>
                <div onClick={()=>{navigate('/')}}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl">👤</div>
                {isAuthenticated && (
                    <button onClick={handleLogout} className="text-red-500 hover:underline">Logout</button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;