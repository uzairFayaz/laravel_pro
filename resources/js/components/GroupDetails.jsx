import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateStory from "./CreateStories";
import CreatePost from "./CreatePost";

const GroupDetails = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [stories, setStories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [formData, setFormData] = useState({ email: '' });
    const [joinCode, setJoinCode] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const userId = parseInt(localStorage.getItem('user_id'));

    useEffect(() => {
        console.log('GroupDetails: Fetching data for group ID:', id);
        console.log('GroupDetails: Token:', localStorage.getItem('token'));
        fetchGroupData();
    }, [id]);

    const fetchGroupData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const [groupResponse, membersResponse, storiesResponse, postsResponse] = await Promise.all([
                axios.get(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/groups/${id}/members`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/groups/${id}/stories`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/groups/${id}/posts`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            console.log('GroupDetails: Fetch Group Response:', groupResponse.data);
            console.log('GroupDetails: Fetch Members Response:', membersResponse.data);
            console.log('GroupDetails: Fetch Stories Response:', storiesResponse.data);
            console.log('GroupDetails: Fetch Posts Response:', postsResponse.data);
            setGroup(groupResponse.data.data);
            setMembers(membersResponse.data.data || []);
            setStories(storiesResponse.data.stories || []);
            setPosts(postsResponse.data.posts || []);
            setMessage('');
            setErrors([]);
        } catch (err) {
            console.error('GroupDetails: Fetch Data Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to load group data. Please log in again.');
            setErrors(err.response?.data?.errors || []);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleJoinCodeChange = (e) => {
        setJoinCode(e.target.value);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const token = localStorage.getItem('token');
            console.log('GroupDetails: Add Member Payload:', formData);
            const response = await axios.post(`/api/groups/${id}/members`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('GroupDetails: Add Member Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            setFormData({ email: '' });
            fetchGroupData();
        } catch (err) {
            console.error('GroupDetails: Add Member Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to add member');
            setErrors(err.response?.data?.errors?.map(error => Object.values(error).join(', ')) || []);
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const token = localStorage.getItem('token');
            console.log('GroupDetails: Join Group Payload:', { share_code: joinCode });
            const response = await axios.post('/api/groups/join', { share_code: joinCode }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('GroupDetails: Join Group Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            setJoinCode('');
            fetchGroupData();
        } catch (err) {
            console.error('GroupDetails: Join Group Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to join group');
            setErrors(err.response?.data?.errors || []);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const token = localStorage.getItem('token');
                console.log('GroupDetails: Remove Member Payload:', { userId });
                const response = await axios.delete(`/api/groups/${id}/members/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('GroupDetails: Remove Member Response:', response.data);
                setMessage(response.data.message);
                setErrors([]);
                fetchGroupData();
            } catch (err) {
                console.error('GroupDetails: Remove Member Error:', err.response?.data || err.message);
                setMessage(err.response?.data?.message || 'Failed to remove member');
                setErrors(err.response?.data?.errors || []);
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const token = localStorage.getItem('token');
                console.log('GroupDetails: Delete Group Payload:', { groupId: id });
                const response = await axios.delete(`/api/groups/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('GroupDetails: Delete Group Response:', response.data);
                setMessage(response.data.message);
                setErrors([]);
                navigate('/groups');
            } catch (err) {
                console.error('GroupDetails: Delete Group Error:', err.response?.data || err.message);
                setMessage(err.response?.data?.message || 'Failed to delete group');
                setErrors(err.response?.data?.errors || []);
            }
        }
    };

    const handleToggleGroupSharing = async () => {
        try {
            await axios.get('/sanctum/csrf-cookie');
            const token = localStorage.getItem('token');
            console.log('GroupDetails: Toggle Group Sharing Payload:', { groupId: id });
            const response = await axios.post(`/api/groups/${id}/toggle-sharing`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('GroupDetails: Toggle Group Sharing Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            fetchGroupData();
        } catch (err) {
            console.error('GroupDetails: Toggle Group Sharing Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to toggle group sharing');
            setErrors(err.response?.data?.errors || []);
        }
    };

    const handleToggleMemberSharing = async (userId) => {
        try {
            await axios.get('/sanctum/csrf-cookie');
            const token = localStorage.getItem('token');
            console.log('GroupDetails: Toggle Member Sharing Payload:', { userId });
            const response = await axios.post(`/api/groups/${id}/members/${userId}/toggle-sharing`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('GroupDetails: Toggle Member Sharing Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            fetchGroupData();
        } catch (err) {
            console.error('GroupDetails: Toggle Member Sharing Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to toggle member sharing');
            setErrors(err.response?.data?.errors || []);
        }
    };

    if (!group) return <div className="text-center py-8">Loading...</div>;
    const isCreator = userId && group.created_by === userId;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm p-6">
                <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                    <span className="ml-2 text-2xl">⭐</span>
                </div>
                <p className="text-sm text-gray-500">Created by {group.creator?.name || 'Unknown'} • 👑</p>
                {isCreator && (
                    <div className="mt-4 space-y-2">
                        <button
                            onClick={handleDeleteGroup}
                            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                        >
                            Delete Group
                        </button>
                        <button
                            onClick={handleToggleGroupSharing}
                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                        >
                            {group.is_shared ? 'Disable Sharing' : 'Enable Sharing'}
                        </button>
                    </div>
                )}
            </header>
            <div className="bg-white shadow-sm">
                <div className="flex space-x-4 px-6 py-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`text-base ${activeTab === 'overview' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`text-base ${activeTab === 'members' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`text-base ${activeTab === 'stories' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                        Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`text-base ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                    >
                        Posts
                    </button>
                </div>
            </div>
            <main className="p-6">
                {message && (
                    <p
                        className={`mb-4 text-center ${
                            message.includes('Failed') || errors.length > 0
                                ? 'text-red-500'
                                : 'text-green-600'
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
                {activeTab === 'overview' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <p className="text-gray-600">{group.description || 'No description'}</p>
                        <p className="text-sm text-gray-500 mt-2">Share Code: {group.share_code || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Sharing: {group.is_shared ? 'Enabled' : 'Disabled'}</p>
                        {!group.is_shared && (
                            <p className="text-sm text-red-500 mt-2">Note: Enable group sharing to allow joining via share code.</p>
                        )}
                    </div>
                )}
                {activeTab === 'members' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Members Management</h3>
                        <div className="space-y-4">
                            {members.length > 0 ? (
                                members.map(member => (
                                    <div key={member.user_id} className="flex items-center justify-between bg-gray-50 rounded-md p-4">
                                        <div className="flex items-center">
                                            <span className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-xl">👤</span>
                                            <div>
                                                <p className="font-semibold text-gray-900">{member.user_name}</p>
                                                <p className="text-gray-600">{member.user_email}</p>
                                                <p className="text-sm text-gray-500">Sharing: {member.is_shared ? 'Enabled' : 'Disabled'}</p>
                                            </div>
                                        </div>
                                        {isCreator && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleRemoveMember(member.user_id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                                >
                                                    Remove
                                                </button>
                                                <button
                                                    onClick={() => handleToggleMemberSharing(member.user_id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                                >
                                                    {member.is_shared ? 'Disable Sharing' : 'Enable Sharing'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No members found.</p>
                            )}
                        </div>
                        {isCreator && (
                            <form onSubmit={handleAddMember} className="mt-6 space-y-4">
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">✉️</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Member Email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">Add Member</button>
                            </form>
                        )}
                        <form onSubmit={handleJoinGroup} className="mt-6 space-y-4">
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">🔑</span>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={handleJoinCodeChange}
                                    placeholder="Enter Share Code"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">Join Group</button>
                        </form>
                    </div>
                )}
                {activeTab === 'stories' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Stories</h3>
                        <CreateStory groupId={id} onStoryCreated={fetchGroupData} />
                        <div className="mt-4">
                            {stories.length > 0 ? (
                                <div className="flex space-x-4 overflow-x-auto">
                                    {stories.map(story => (
                                        <div key={story.id} className="bg-gray-50 rounded-md p-4 w-48">
                                            <p className="text-gray-700 h-32 overflow-y-auto">{story.content}</p>
                                            <p className="text-sm text-gray-500 mt-2">{story.user?.name || 'Unknown'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No stories yet.</p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'posts' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Posts</h3>
                        <CreatePost groupId={id} onPostCreated={fetchGroupData} />
                        <div className="mt-4 space-y-4">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} className="bg-gray-50 rounded-md p-4">
                                        <p className="text-gray-700">{post.content}</p>
                                        <p className="text-sm text-gray-500 mt-2">{post.user?.name || 'Unknown'}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No posts yet.</p>
                            )}
                        </div>
                    </div>
                )}
                <NavLink to="/groups" className="mt-4 block text-center text-blue-500 hover:underline">Back to Groups</NavLink>
            </main>
        </div>
    );
};

export default GroupDetails;