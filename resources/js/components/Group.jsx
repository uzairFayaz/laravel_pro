
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import Cookies from 'js-cookie';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      console.error('ErrorBoundary caught:', error, errorInfo);
      setHasError(true);
      setErrorMessage(error.message || 'An error occurred in the application');
    };
    const rejectionHandler = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setErrorMessage(event.reason?.message || 'An unexpected error occurred. Please log in or try again.');
    };
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full mt-2 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  return children;
};

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
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
      const token = Cookies.get('token');
      const response = await axios.get('/api/groups', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data.data || []);
      setMessage('');
    } catch (err) {
      console.error('Fetch Groups Error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to load groups');
      if (err.response?.status === 401) {
        setMessage('Please log in to view groups.');
        navigate('/login');
      }
      if (err.response?.status === 422) setMessage(err.response?.data?.errors?.join(', ') || 'Invalid request');
      if (err.response?.status === 500) setMessage('Server error. Please try logging out and back in, or contact support.');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
      const token = Cookies.get('token');
      if (!token) {
        setMessage('Please log in to create a group.');
        navigate('/login');
        return;
      }
      const response = await axios.post('/api/groups', formData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.message || 'Group created!');
      setFormData({ name: '', description: '' });
      fetchGroups();
    } catch (err) {
      console.error('Create Group Error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create group');
      if (err.response?.status === 401) {
        setMessage('Please log in to create a group.');
        navigate('/login');
      }
      if (err.response?.status === 422) setMessage(err.response?.data?.errors?.join(', ') || 'Invalid request');
      if (err.response?.status === 500) setMessage('Server error. Please try logging out and back in, or contact support.');
    }
  };

  const checkAuthStatus = async () => {
    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
      const token = Cookies.get('token');
      console.log('Cookies:', { token }); // Debug log
      if (!token) return false;
      const response = await axios.get('/api/groups', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Auth Check Response:', response.data); // Debug log
      return true;
    } catch (err) {
      console.error('Auth Check Error:', err.response?.data || err.message);
      return false;
    }
  };

  useEffect(() => {
    if (showQrScanner) {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      html5QrCodeRef.current = html5QrCode;

      const handleQrCode = async (decodedText) => {
        setShowQrScanner(false);
        setScanningError('');
        html5QrCode.stop().catch(() => {});

        console.log('QR Code Decoded:', decodedText); // Debug log
        let shareCode;
        try {
          const url = new URL(decodedText);
          shareCode = url.searchParams.get('code');
          if (!shareCode || shareCode.length < 8) {
            throw new Error('Invalid share code format');
          }
        } catch {
          shareCode = decodedText;
          if (!shareCode || shareCode.length < 8) {
            setMessage('Invalid QR code format. Please scan a valid group QR code.');
            return;
          }
        }

        console.log('Share Code Sent:', shareCode); // Debug log
        const isAuthenticated = await checkAuthStatus();
        console.log('Auth Status:', isAuthenticated); // Debug log
        if (!isAuthenticated) {
          setMessage('You must be logged in to join a group. Please log in and try again.');
          navigate('/login');
          return;
        }

        try {
          await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
          const token = Cookies.get('token');
          if (!token) {
            setMessage('Authentication token missing. Please log in and try again.');
            navigate('/login');
            return;
          }
          const response = await axios.post(
            '/api/join-group',
            { code: shareCode },
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setMessage(response.data.message || 'Joined group!');


          const groupId = response.data?.data?.group_id;
          if (groupId) {
            navigate(`/groups/${groupId}`);
          } else {
            setMessage('Joined group, but group ID not found. Please try again.');
          }

        } catch (err) {
          console.error('Join Group Error:', err.response?.data || err.message);
          setMessage(err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Failed to join group. Please ensure the QR code is valid.');
          if (err.response?.status === 401) {
            setMessage('Authentication failed. Please log in and try again.');
            navigate('/login');
          }
          if (err.response?.status === 422) setMessage(err.response?.data?.errors?.join(', ') || 'Invalid share code. Please scan a valid group QR code.');
          if (err.response?.status === 500) setMessage('Server error while joining group. Please ensure you are logged in with a valid session or contact support.');
        }
      };

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          try {
            await handleQrCode(decodedText);
          } catch (err) {
            console.error('QR Code Processing Error:', err);
            setMessage('Failed to process QR code. Please try again or log in.');
          }
        },
        (err) => setScanningError(err?.message || 'Camera error')
      ).catch((err) => setScanningError(err?.message || 'Camera error'));

      return () => {
        html5QrCode.stop().catch(() => {});
        html5QrCode.clear().catch(() => {});
      };
    }
  }, [showQrScanner]);

  return (
    <ErrorBoundary>
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
          onClick={async () => {
            const isAuthenticated = await checkAuthStatus();
            if (!isAuthenticated) {
              setMessage('You must be logged in to scan a QR code. Please log in.');
              navigate('/login');
              return;
            }
            setShowQrScanner(true);
          }}
          className="mb-6 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow"
        >
          Join Group via QR Code
        </button>

        <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Groups</h2>

          {message && (
            <div className={`mb-4 text-center text-sm font-medium ${message.includes('Failed') || message.includes('Invalid') || message.includes('error') || message.includes('Authentication') ? 'text-red-600' : 'text-green-600'}`}>
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
    </ErrorBoundary>
  );
};

export default Group;