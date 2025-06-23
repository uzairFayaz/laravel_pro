import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import CreateStory from './CreateStories';
import CreatePost from './CreatePost';
import Cookies from 'js-cookie';

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
  const [qrSvg, setQrSvg] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return navigate('/login');

      const [groupRes, membersRes, storiesRes, postsRes] = await Promise.all([
        axios.get(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/groups/${id}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/groups/${id}/stories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/groups/${id}/posts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setGroup(groupRes.data.data);
      setMembers(membersRes.data.data || []);
      setStories(storiesRes.data.data?.stories || []);
      setPosts(postsRes.data.data?.posts || []);
      setMessage('');
      setErrors([]);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchQrCode = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return;

      const res = await axios.get(`/api/groups/${id}/qr`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'image/svg+xml',
        },
      });

      setQrSvg(res.data);
    } catch (err) {
      console.error('QR Fetch Error:', err);
    }
  };

  const handleApiError = (err) => {
    setMessage(err.response?.data?.message || 'Something went wrong.');
    setErrors(err.response?.data?.errors || []);
    if ([401, 403].includes(err.response?.status)) {
      Cookies.remove('token');
      navigate('/login');
    }
  };

  const toggleSharing = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return navigate('/login');

      const res = await axios.post(`/api/groups/${id}/toggle-sharing`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroup(prev => ({ ...prev, is_shared: res.data.data.is_shared }));
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      handleApiError(err);
    }
  };

  const copyShareCode = () => {
    if (group?.share_code) {
      navigator.clipboard.writeText(group.share_code)
        .then(() => setCopySuccess('Copied!'))
        .catch(() => setCopySuccess('Failed to copy'));
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const toggleQrDisplay = () => {
    const newState = !showQr;
    setShowQr(newState);
    if (newState) fetchQrCode();
  };

  const renderTabButtons = () => (
    <div className="mb-4">
      {['stories', 'posts', 'members'].map(tab => (
        <button
          key={tab}
          className={`mr-2 px-4 py-2 ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  const renderStories = () => (
    <div>
      <CreateStory groupId={id} onStoryCreated={fetchGroupData} members={members} />
      {stories.length ? stories.map(story => (
        <div key={story.id} className="border p-4 mb-2 rounded">
          <p>{story.content}</p>
          <p className="text-sm text-gray-500">
            Posted by: {story.user?.name} | Expires: {new Date(story.expires_at).toLocaleString()}
          </p>
        </div>
      )) : <p>No stories available.</p>}
    </div>
  );

  const renderPosts = () => (
    <div>
      <CreatePost groupId={id} onPostCreated={fetchGroupData} />
      {posts.length ? posts.map(post => (
        <div key={post.id} className="border p-4 mb-2 rounded">
          <p>{post.content}</p>
          <p className="text-sm text-gray-500">
            Posted by: {post.user?.name} on {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      )) : <p>No posts available.</p>}
    </div>
  );

  const renderMembers = () => (
    <div>
      {members.length ? members.map(member => (
        <div key={member.user_id} className="border p-4 mb-2 rounded">
          <p>{member.user_name}</p>
          <p className="text-sm text-gray-500">{member.user_email}</p>
        </div>
      )) : <p>No members available.</p>}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {message && (
        <div className={`p-2 rounded mb-4 ${errors.length ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
          {errors.length > 0 && (
            <ul className="list-disc ml-5">
              {errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          )}
        </div>
      )}

      {group ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
          <p className="mb-4">{group.description}</p>

          {group.created_by === group.creator?.id && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Share Code:</label>
                <span className="bg-gray-100 px-2 py-1 rounded font-mono">{group.share_code}</span>
                <button
                  onClick={copyShareCode}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Copy
                </button>
                {copySuccess && <span className="text-sm text-green-600">{copySuccess}</span>}
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Enable Sharing:</label>
                <input
                  type="checkbox"
                  checked={group.is_shared || false}
                  onChange={toggleSharing}
                  className="h-5 w-5"
                />
                <span className="text-sm text-gray-500">
                  {group.is_shared ? 'Sharing Enabled' : 'Sharing Disabled'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  onClick={toggleQrDisplay}
                >
                  {showQr ? 'Hide QR Code' : 'Show QR Code'}
                </button>
                <span className="text-sm text-gray-500">Scan to join this group</span>
              </div>

              {showQr && qrSvg && (
                <div className="mt-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              )}
            </div>
          )}

          {renderTabButtons()}

          {activeTab === 'stories' && renderStories()}
          {activeTab === 'posts' && renderPosts()}
          {activeTab === 'members' && renderMembers()}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default GroupDetails;