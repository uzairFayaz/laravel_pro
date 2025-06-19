import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import CreateStory from './CreateStories';
import CreatePost from './CreatePost';

const GroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [stories, setStories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('stories');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState([]);
    const [copySuccess, setCopySuccess] = useState('');
    const [showQr, setShowQr] = useState(false);

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
            setGroup(groupResponse.data.data);
            setMembers(membersResponse.data.data || []);
            setStories(storiesResponse.data.data?.stories || []);
            setPosts(postsResponse.data.data?.posts || []);
            setMessage('');
            setErrors([]);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to load group data. Please try again.');
            setErrors(err.response?.data?.errors || []);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const copyShareCode = () => {
        if (group?.share_code) {
            navigator.clipboard.writeText(group.share_code)
                .then(() => {
                    setCopySuccess('Copied!');
                    setTimeout(() => setCopySuccess(''), 2000);
                })
                .catch(() => setCopySuccess('Failed to copy'));
        }
    };

    const toggleGroupSharing = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            setMessage('');
            setErrors([]);
            const response = await axios.post(`/api/groups/${id}/toggle-sharing`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroup(prevGroup => ({ ...prevGroup, is_shared: response.data.data.is_shared }));
            setMessage(response.data.message);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to toggle sharing.');
            setErrors(err.response?.data?.errors || []);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            {message && (
                <div className={`p-2 rounded mb-4 ${errors.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                    {errors.length > 0 && (
                        <ul className="list-disc ml-5">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {group ? (
                <div>
                    <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
                    <p className="mb-4">{group.description}</p>
                    {group.created_by === group.creator?.id ? (
                        <div className="mb-4 space-y-2">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Share Code:</label>
                                <span className="bg-gray-100 px-2 py-1 rounded font-mono">{group.share_code}</span>
                                <button
                                    onClick={copyShareCode}
                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    Copy
                                </button>
                                {copySuccess && (
                                    <span className="text-sm text-green-600">{copySuccess}</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Enable Sharing:</label>
                                <input
                                    type="checkbox"
                                    checked={group.is_shared || false}
                                    onChange={toggleGroupSharing}
                                    className="h-5 w-5"
                                />
                                <span className="text-sm text-gray-500">
                                    {group.is_shared ? 'Sharing Enabled' : 'Sharing Disabled'}
                                </span>
                            </div>
                            {/* QR Code Section */}
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    onClick={() => setShowQr(!showQr)}
                                >
                                    {showQr ? 'Hide QR Code' : 'Show QR Code'}
                                </button>
                                <span className="text-sm text-gray-500">Scan to join this group</span>
                            </div>
                            {showQr && (
                                <div className="mt-2">
                                    <img
                                        src={`/api/groups/${id}/qr`}
                                        alt="Group QR Code"
                                        style={{ width: 300, height: 300 }}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Only the group creator can manage sharing settings.</p>
                    )}
                    <div className="mb-4">
                        <button
                            className={`mr-2 px-4 py-2 ${activeTab === 'stories' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange('stories')}
                        >
                            Stories
                        </button>
                        <button
                            className={`mr-2 px-4 py-2 ${activeTab === 'posts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange('posts')}
                        >
                            Posts
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'members' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleTabChange('members')}
                        >
                            Members
                        </button>
                    </div>
                    {activeTab === 'stories' && (
                        <div>
                            <CreateStory groupId={id} onStoryCreated={fetchGroupData} members={members} />
                            {stories.length > 0 ? (
                                stories.map((story) => (
                                    <div key={story.id} className="border p-4 mb-2 rounded">
                                        <p>{story.content}</p>
                                        <p className="text-sm text-gray-500">
                                            Posted by: {story.user?.name} | Expires: {new Date(story.expires_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No stories available.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'posts' && (
                        <div>
                            <CreatePost groupId={id} onPostCreated={fetchGroupData} />
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post.id} className="border p-4 mb-2 rounded">
                                        <p>{post.content}</p>
                                        <p className="text-sm text-gray-500">
                                            Posted by: {post.user?.name} on {new Date(post.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No posts available.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'members' && (
                        <div>
                            {Array.isArray(members) && members.length > 0 ? (
                                members.map((member) => (
                                    <div key={member.user_id} className="border p-4 mb-2 rounded">
                                        <p>{member.user_name}</p>
                                        <p className="text-sm text-gray-500">{member.user_email}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No members available.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default GroupDetails;