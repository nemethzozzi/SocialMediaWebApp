import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useFollow } from '../FollowContext';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const { followState, toggleFollow } = useFollow();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users?currentUserId=${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const filteredUsers = response.data.filter(u => u._id !== user._id); // Filter out the current user
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user._id, user.token, apiUrl]);

  const handleFollowToggle = async (userIdToFollow, isCurrentlyFollowing) => {
    const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';

    try {
      await axios.put(`${apiUrl}/api/users/${userIdToFollow}/${endpoint}`, {
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success(`User has been ${isCurrentlyFollowing ? 'unfollowed' : 'followed'}.`);
      setUsers(users.map(u => {
        if (u._id === userIdToFollow) {
          return { ...u, isFollowing: !isCurrentlyFollowing };
        }
        return u;
      }));
    } catch (error) {
      console.error(`Failed to ${endpoint} user:`, error?.response?.data?.message || error.message);
      toast.error(`Failed to ${endpoint} user: ${error?.response?.data?.message || error.message}`);
    }
  };

  const handleNavigateToProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {users.length > 0 ? users.map(user => (
        <div key={user._id} className="flex items-center justify-start space-x-4 mb-3">
          <img 
            src={`${apiUrl}/images/${user.profilePicture.split('/').pop()}`} // Ensures the image URL is constructed correctly
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
      )) : <p>No users to display.</p>}
    </div>
  );
};

export default UsersPage;
