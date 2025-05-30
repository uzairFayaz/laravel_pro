import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [joinCode, setJoinCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
        fetchGroups();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/user');
            setUser(response.data);
        } catch (err) {
            console.error('Fetch User Error:', err.response?.data || err.message);
            setMessage('Unauthorized');
            navigate('/login');
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await axios.get('/groups');
            setGroups(response.data.data || []);
        } catch (err) {
            console.error('Fetch Groups Error:', err.response?.data || err.message);
            setMessage('Failed to load groups');
        }
    };

    const handleCreateChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/groups', createForm);
            setMessage(response.data.message);
            setCreateForm({ name: '', description: '' });
            fetchGroups();
        } catch (err) {
            console.error('Create Group Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.errors?.join(', ') || 'Failed to create group');
        }
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/groups/join', { share_code: joinCode });
            setMessage(response.data.message);
            setJoinCode('');
            fetchGroups();
        } catch (err) {
            console.error('Join Group Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to join group');
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.delete(`/api/groups/${id}`);
                setMessage(response.data.message);
                fetchGroups();
            } catch (err) {
                console.error('Delete Group Error:', err.response?.data || err.message);
                setMessage(err.response?.data?.message || 'Failed to delete group');
            }
        }
    };

    if (!user) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="bg-white shadow-md w-64 p-6 hidden sm:block">
                <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-6 flex items-center justify-center text-3xl">👤</div>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold">My Groups</h3>
                    <ul className="mt-2 space-y-2">
                        {groups.filter(g => g.created_by === user.id).map(group => (
                            <li key={group.id}>
                                <Link to={`/groups/${group.id}`} className="text-gray-900 hover:bg-gray-100 block px-2 py-1 rounded">{group.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold">Joined Groups</h3>
                    <ul className="mt-2 space-y-2">
                        {groups.filter(g => g.created_by !== user.id).map(group => (
                            <li key={group.id}>
                                <Link to={`/groups/${group.id}`} className="text-gray-900 hover:bg-gray-100 block px-2 py-1 rounded">{group.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-6">
                {message && <p className={`mb-4 text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">User Info</h2>
                    <p className="text-gray-700">Name: {user.name}</p>
                    <p className="text-gray-700">Email: {user.email}</p>
                </div>
                <div className="mb-6 bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Create Group</h3>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            value={createForm.name}
                            onChange={handleCreateChange}
                            placeholder="Group Name"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                        <textarea
                            name="description"
                            value={createForm.description}
                            onChange={handleCreateChange}
                            placeholder="Description"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md h-24"
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">Create Group</button>
                    </form>
                </div>
                <div className="mb-6 bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Join Group</h3>
                    <form onSubmit={handleJoinSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Share Code"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">Join Group</button>
                    </form>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Groups</h3>
                    {groups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {groups.map(group => (
                                <div key={group.id} className="bg-white shadow-md rounded-lg p-4">
                                    <h4 className="text-lg font-semibold">{group.name}</h4>
                                    <p className="text-gray-600">{group.description || 'No description'}</p>
                                    <div className="mt-2 flex space-x-2">
                                        <Link to={`/groups/${group.id}`} className="text-blue-500">👁️ View</Link>
                                        {group.created_by === user.id && (
                                            <button onClick={() => handleDeleteGroup(group.id)} className="text-red-500">🗑️ Delete</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No groups found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserProfile;