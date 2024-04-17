import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Sidebar from "./Sidebar";
import Posts from "./Posts";
import SearchBar from "./SearchBar";
import UsersPage from "./UsersPage";
import CreatePost from './CreatePost';

function MainPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/timeline/all?userId=${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPosts(response.data);
      } catch (error) {
        toast.error("Could not fetch posts.");
        console.error('Error fetching posts:', error);
      }
    }

    if (user && user._id) {
      fetchPosts();
    }
  }, [user]);

  const handlePostCreated = newPost => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-1/4 xl:w-1/6 bg-gray-800 text-white">
        <Sidebar />
      </div>
      {/* Main content */}
      <div className="md:w-1/2 xl:w-4/6 flex flex-col items-center p-4">
        <SearchBar />
        <h1 className="mt-6 text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Welcome {user?.username}</h1>
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="w-full max-w-3xl mt-4">
        <Posts/>
        </div>
      </div>
      {/* User Page */}
      <div className="md:w-1/4 xl:w-1/6 bg-white p-4 border-l">
        <UsersPage />
      </div>
    </div>
  );
}

export default MainPage;
