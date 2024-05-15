import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Sidebar from "../components/Sidebar/Sidebar";
import Posts from "../components/MainPage/Posts";
import SearchBar from "../components/SearchBar";
import UsersPage from "../components/Users/UsersPage";
import CreatePost from '../components/MainPage/CreatePost';

function MainPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/posts/timeline/all?userId=${user._id}`, {
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
      <div className="md:w-1/6 xl:w-1/6 bg-gray-800 text-white">
        <Sidebar />
      </div>
      {/* Main content */}
      <div className="md:w-4/6 xl:w-4/6 flex flex-col items-center p-4">
        <SearchBar />
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
