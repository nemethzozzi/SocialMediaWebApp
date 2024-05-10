import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, LogoutIcon, UserCircleIcon, BellIcon, CogIcon } from '@heroicons/react/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Sidebar() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const { username, profilePicture } = userData;

  useEffect(() => {
    // Update component state when localStorage changes
    const handleStorageChange = () => {
      setUserData(JSON.parse(localStorage.getItem('user')) || {});
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    toast.success("Logout succesfull!");
    localStorage.removeItem('user');
    localStorage.clear();
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const profileImageUrl = `${apiUrl}/images/${profilePicture.split('/').pop()}`;

  return (
    <div className="fixed flex flex-col h-screen bg-gray-800 text-white p-5 justify-between">
      <div>
        <ToastContainer />
        <div className="mb-4 flex items-center cursor-pointer"> {/* Updated to flex to align items horizontally */}
          <img 
            src={profileImageUrl}
            alt="Profile"
            className="h-16 w-16 rounded-full mr-4"
            onClick={() => navigate(`/profile/${userData._id}`)}
          />
          <h2 className="text-4xl font-semibold" onClick={() => navigate(`/profile/${userData._id}`)}>{username || 'Username'} </h2>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center cursor-pointer " onClick={() => navigate('/')}>
            <HomeIcon className="h-6 w-6 mr-2" />
            <span>Home</span>
          </div>
          <div className="flex items-center cursor-pointer mt-4" onClick={() => navigate(`/profile/${userData._id}`)}>
            <UserCircleIcon className="h-6 w-6 mr-2" />
            <span>Profile</span>
          </div>
          <div className="flex items-center cursor-pointer mt-4" onClick={() => navigate('/settings')}>
            <CogIcon className="h-6 w-6 mr-2" />
            <span>Settings</span>
          </div>
          <div className="flex items-center cursor-pointer mt-4" onClick={() => navigate('/notifications')}>
            <BellIcon className="h-6 w-6 mr-2" />
            <span>Notifications</span>
          </div>
        </div>
      </div>

      <div className="flex items-center cursor-pointer" onClick={handleLogout}>
        <LogoutIcon className="h-6 w-6 mr-2" />
        <span>Logout</span>
      </div>
    </div>
  );
}

export default Sidebar;
