import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreatePost({ onPostCreated }) {
  const [desc, setDesc] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPost = {
      userId: user._id, // Replace with actual user ID
      desc: desc,
    };

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers such as authentication tokens
        },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Post created successfully!');
        setDesc(''); // Clear the textarea after successful post submission
        navigate('/'); // Navigate to the homepage or feed page
        onPostCreated(result);
      } else {
        toast.error('Failed to create post.');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col justify-center px-6">
      <ToastContainer />
      <div className="max-w-lg w-full mx-auto bg-white p-8 border border-gray-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="What's happening?"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 rounded-md text-white text-sm"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
