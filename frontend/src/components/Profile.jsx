import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Sidebar from './Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import UserPosts from './UserPosts';

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user data');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-grow container mx-auto p-6">
        <ToastContainer />
        <div className="bg-white rounded-lg shadow p-6">
          <div className="profile-header mb-6">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={`${user.username}'s profile`} className="rounded-full w-32 h-32 object-cover mx-auto" />
            ) : (
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto uppercase text-2xl font-bold text-gray-700">
                {user.username[0]}
              </div>
            )}
            <h1 className="text-center text-3xl font-bold mt-4">{user.username}</h1>
          </div>
          <div className='items-center'>
            <div className="w-full max-w-3xl mt-4">
              <UserPosts />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
