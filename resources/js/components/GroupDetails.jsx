import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GroupDetails = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [stories, setStories] = useState([]);
    const [formData, setFormData] = useState({ email: '' });
    const [joinCode, setJoinCode] = useState('');
    const [storyContent, setStoryContent] = useState('');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const userId = parseInt(localStorage.getItem('user_id'));

    useEffect(() => {
        fetchGroup();
        fetchMembers();
        fetchStories();
    }, [id]);

    const fetchGroup = async () => {
        try {
            const response = await axios.get(`/api/groups/${id}`);
            setGroup(response.data.data);
        } catch (err) {
            console.error('Fetch Group Error:', err.response?.data || err.message);
            setMessage('Unauthorized');
            navigate('/login');
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`/api/groups/${id}/members`);
            setMembers(response.data.data || []);
        } catch (err) {
            console.error('Fetch Members Error:', err.response?.data || err.message);
            setMessage('Failed to load members');
            setMembers([]);
        }
    };

    const fetchStories = async () => {
        // Placeholder: Replace with actual API
          const response = await axios.get(`/api/groups/${id}/stories`);
          setStories(response.data.data || [])
          




        setStories([
            { id: 1, title: 'Story Title', content: 'Lorem ipsum dolor sit amet...', author: 'UserX' },
            { id: 2, title: 'Another Story', content: 'Consectetur adipiscing elit...', author: 'UserY' },
        ]);
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
            const response = await axios.post(`/api/groups/${id}/members`, formData);
            setMessage(response.data.message);
            setFormData({ email: '' });
            fetchMembers();
        } catch (err) {
            console.error('Add Member Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.errors?.join(', ') || 'Failed to add member');
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/groups/join', { share_code: joinCode });
            setMessage(response.data.message);
            setJoinCode('');
            fetchMembers();
            fetchGroup();
        } catch (err) {
            console.error('Join Group Error:', err.response?.data || err.message);
            setMessage(err.response?.data?.message || 'Failed to join group');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.delete(`/api/groups/${id}/members/${userId}`);
                setMessage(response.data.message);
                fetchMembers();
            } catch (err) {
                console.error('Remove Member Error:', err.response?.data || err.message);
                setMessage(err.response?.data?.message || 'Failed to remove member');
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.delete(`/api/groups/${id}`);
                setMessage(response.data.message);
                navigate('/groups');
            } catch (err) {
                console.error('Delete Group Error:', err.response?.data || err.message);
                setMessage(err.response?.data?.message || 'Failed to delete group');
            }
        }
    };

    const handlePostStory = async (e) => {
        e.preventDefault();
        // Placeholder: Replace with actual API
        setMessage('Story posted (placeholder)');
        setStoryContent('');
        fetchStories();
    };

    if (!group) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm p-6">
                <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                    <span className="ml-2 text-2xl">⭐</span>
                </div>
                <p className="text-sm text-gray-500">Created by {group.creator?.name || 'Unknown'} • 👑</p>
                {group.created_by === userId && (
                    <button
                        onClick={handleDeleteGroup}
                        className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                    >
                        Delete Group
                    </button>
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
                </div>
            </div>
            <main className="p-6">
                {message && <p className={`mb-4 text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
                {activeTab === 'overview' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <p className="text-gray-600">{group.description || 'No description'}</p>
                        <p className="text-sm text-gray-500 mt-2">Share Code: {group.share_code || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Sharing: {group.is_shared ? 'Enabled' : 'Disabled'}</p>
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
                                            </div>
                                        </div>
                                        {group.created_by === userId && (
                                            <button
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No members found.</p>
                            )}
                        </div>
                        {group.created_by === userId && (
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
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md"
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md"
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">Join Group</button>
                        </form>
                    </div>
                )}
                {activeTab === 'stories' && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Stories Feed</h3>
                        {group.created_by === userId && (
                            <form onSubmit={handlePostStory} className="mb-6 space-y-4">
                                <textarea
                                    value={storyContent}
                                    onChange={(e) => setStoryContent(e.target.value)}
                                    placeholder="Write a story..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-24"
                                />
                                <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">Post Story</button>
                            </form>
                        )}
                        <div className="space-y-4">
                            {stories.length > 0 ? (
                                stories.map(story => (
                                    <div key={story.id} className="bg-white shadow-sm rounded-md p-4">
                                        <h4 className="text-lg font-semibold flex items-center">
                                            <span className="mr-2">📖</span> {story.title} - {story.author}
                                        </h4>
                                        <p className="text-gray-600">{story.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No stories found.</p>
                            )}
                        </div>
                    </div>
                )}
                <Link to="/groups" className="mt-4 block text-center text-blue-500 hover:underline">Back to Groups</Link>
            </main>
        </div>
    );
};

export default GroupDetails;