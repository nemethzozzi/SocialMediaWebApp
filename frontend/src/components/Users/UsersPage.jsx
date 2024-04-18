import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Initialize navigate function

useEffect(() => {
  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
  if (!currentUserId) {
    console.error("Current user ID is undefined. Please make sure the user is logged in and the correct user ID is stored.");
    toast.error("You must be logged in to view this page.");
    setLoading(false);
    return;
  }

  axios.get(`http://localhost:5000/api/users?currentUserId=${currentUserId}`)
  .then(response => {
    setUsers(response.data);
    setLoading(false);
  })
  .catch(error => {
    console.error('Failed to fetch users:', error);
    toast.error('Failed to fetch users');
    setLoading(false);
  });
}, []);


const handleFollowToggle = async (userIdToFollow, isCurrentlyFollowing) => {
  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
  const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';

  if (currentUserId && userIdToFollow !== currentUserId) {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${userIdToFollow}/${endpoint}`, {
        userId: currentUserId
      });

      toast.success(`User has been ${isCurrentlyFollowing ? 'unfollowed' : 'followed'}.`);
      setUsers(users.map(user => {
        if (user._id === userIdToFollow) {
          return { ...user, isFollowing: !isCurrentlyFollowing };
        }
        return user;
      }));
    } catch (error) {
      console.error(`Failed to ${endpoint} user:`, error?.response?.data?.message || error.message);
      toast.error(`Failed to ${endpoint} user: ${error?.response?.data?.message || error.message}`);
    }
  } else {
    toast.error('Operation not allowed.');
  }
};

const handleNavigateToProfile = (userId) => {
  navigate(`/user/${userId}`);  // Navigate to UserProfile component
};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {users.map(user => (
        <div key={user._id} className="flex items-center justify-start space-x-4 mb-3">
          <img 
            src={user.profilePicture || '/path/to/default_profile.png'} 
            alt={`${user.username}'s profile`} 
            className="h-10 w-10 rounded-full cursor-pointer" 
            onClick={() => handleNavigateToProfile(user._id)} 
          />
          <span 
            className="cursor-pointer" 
            onClick={() => handleNavigateToProfile(user._id)}
          >
            {user.username}
          </span>
          <button
            onClick={() => handleFollowToggle(user._id, user.isFollowing)}
            className={`px-4 py-1 rounded ${user.isFollowing ? 'bg-red-500' : 'bg-blue-500'} text-white`}
          >
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default UsersPage;
