import React, { useState } from "react";
import axios from "axios";

const CreatePost = ({ groupId, onPostCreated }) => {
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.get("/sanctum/csrf-cookie");
            console.log('Create Text Post Payload:', { group_id: groupId, content });
            const response = await axios.post("/api/groups/posts", {
                group_id: groupId,
                content,
            });
            console.log('Create Text Post Response:', response.data);
            setMessage(response.data.message);
            setErrors([]);
            setContent("");
            onPostCreated();
        } catch (err) {
            console.error("Create Text Post Error:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || "Failed to create text post");
            setErrors(err.response?.data?.errors || []);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-bold mb-2">Create Text Post</h3>
            {message && (
                <p
                    className={`mb-2 text-center ${
                        message.includes("Failed") || errors.length > 0
                            ? "text-red-500"
                            : "text-green-600"
                    }`}
                >
                    {message}
                </p>
            )}
            {errors.length > 0 && (
                <ul className="mb-2 text-red-500 text-sm">
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share a post with your group..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    maxLength="1000"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                    Post
                </button>
            </form>
        </div>
    );
};

export default CreatePost;