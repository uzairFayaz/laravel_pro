import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Group = () => {
    const [groups, setGroups] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get('/api/groups');
            setGroups(response.data.data || []);
        } catch (err) {
            console.error('Fetch Groups Error:', err.response?.data || err.message);
            setMessage('Failed to load groups');
            if (err.response?.status === 401) navigate('/login');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/groups', formData);
            setMessage(response.data.message);
            setFormData({ name: '', description: '' });
            fetchGroups();
        } catch (err) {
            console.error('Create Group Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.errors?.join(', ') || 'Failed to create group');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Groups</h2>
                {message && <p className={`mb-4 text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
                <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Group Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Group Description"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
                    >
                        Create Group
                    </button>
                </form>
                <div className="space-y-4">
                    {groups.length > 0 ? (
                        groups.map(group => (
                            <div key={group.id} className="bg-gray-50 rounded-md p-4">
                                <Link to={`/groups/${group.id}`} className="text-blue-500 hover:underline">
                                    <h3 className="text-lg font-semibold">{group.name}</h3>
                                </Link>
                                <p className="text-gray-600">{group.description || 'No description'}</p>
                                <p className="text-sm text-gray-500">Created by: {group.creator?.name || 'Unknown'}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No groups found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Group;