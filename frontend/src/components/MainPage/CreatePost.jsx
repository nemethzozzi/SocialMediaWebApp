import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function CreatePost({ onPostCreated }) {
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', user._id);
    formData.append('desc', desc);

    try {
      const response = await axios.post(`${apiUrl}/api/posts`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });
      toast.success('Post created successfully!');
      onPostCreated(response.data);
      setDesc('');
      setImage(null);
    } catch (error) {
      toast.error("Failed to create post.");
      console.error('Failed to create post:', error);
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
            onChange={e => setDesc(e.target.value)}
            required
          ></textarea>
          <input
            type="file"
            onChange={e => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0 file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button type="submit" className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 rounded-md text-white text-sm">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
