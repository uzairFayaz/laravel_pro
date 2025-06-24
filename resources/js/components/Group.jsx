import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import Cookies from "js-cookie";

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scanningError, setScanningError] = useState('');
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef(null);
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  useEffect(() => {
    if (showQrScanner) {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setShowQrScanner(false);
          setScanningError('');
          html5QrCode.stop().catch(() => {});
          let shareCode = decodedText;

          try {
            const url = new URL(decodedText);
            const codeFromUrl = url.searchParams.get('code');
            if (codeFromUrl) shareCode = codeFromUrl;
          } catch {}

          try {
            const token = Cookies.get('token');
            const response = await axios.post(
              '/api/join-group',
              { share_code: shareCode },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(response.data.message || 'Joined group!');
            fetchGroups();
          } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to join group.');
          }
        },
        (err) => setScanningError(err || 'Camera error')
      ).catch((err) => setScanningError(err?.message || 'Camera error'));

      return () => {
        html5QrCode.stop().catch(() => {});
        html5QrCode.clear().catch(() => {});
      };
    }
  }, [showQrScanner]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center">
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-[350px] flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Scan Group QR Code</h2>
            <div id={qrCodeRegionId} className="w-72 h-72 rounded border" />
            {scanningError && (
              <p className="text-sm text-red-500 mt-3">{scanningError}</p>
            )}
            <button
              onClick={() => {
                setShowQrScanner(false);
                setScanningError('');
                if (html5QrCodeRef.current) {
                  html5QrCodeRef.current.stop().catch(() => {});
                  html5QrCodeRef.current.clear().catch(() => {});
                }
              }}
              className="mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowQrScanner(true)}
        className="mb-6 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow"
      >
        Join Group via QR Code
      </button>

      <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Groups</h2>

        {message && (
          <div className={`mb-4 text-center text-sm font-medium ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Group Name"
            required
            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Group Description"
            className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
          >
            Create Group
          </button>
        </form>

        <div className="space-y-4">
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.id} className="border rounded-md p-4 hover:shadow transition duration-200">
                <Link to={`/groups/${group.id}`} className="text-lg font-bold text-blue-600 hover:underline">
                  {group.name}
                </Link>
                <p className="text-gray-700 mt-1">{group.description || 'No description provided.'}</p>
                <p className="text-sm text-gray-500 mt-1">Created by: {group.creator?.name || 'Unknown'}</p>
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
