import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, LogoutIcon, UserCircleIcon, BellIcon } from '@heroicons/react/outline';

function Sidebar() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const { username } = userData;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="fixed flex flex-col h-screen bg-gray-800 text-white p-5 justify-between">
      <div>
        <div className="mb-4">
          <h2 className="text-4xl font-semibold">{username || 'Username'}</h2>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <HomeIcon className="h-6 w-6 mr-2" />
            <span>Home</span>
          </div>
          <div className="flex items-center cursor-pointer mt-4" onClick={() => navigate(`/profile/${userData._id}`)}>
            <UserCircleIcon className="h-6 w-6 mr-2" />
            <span>Profile</span>
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
