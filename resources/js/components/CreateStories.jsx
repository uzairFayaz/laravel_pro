import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const CreateStories = ({ groupId, onStoryCreated, members }) => {
    const [content, setContent] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState([]);

    const memberOptions = members.map(member => ({
        value: member.user_id,
        label: member.user_name || member.user_email,
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrors([]);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/stories', {
                group_id: groupId,
                content,
                shared_with: selectedMembers.map(member => member.value),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(response.data.message);
            setContent('');
            setSelectedMembers([]);
            onStoryCreated();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create story.');
            setErrors(err.response?.data?.errors || []);
        }
    };

    return (
        <div className="mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className={`p-2 rounded ${errors.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">Story Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="4"
                        maxLength="500"
                        placeholder="Write your story..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Share With</label>
                    <Select
                        isMulti
                        options={memberOptions}
                        value={selectedMembers}
                        onChange={setSelectedMembers}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select members..."
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Create Story
                </button>
            </form>
        </div>
    );
};

export default CreateStories;