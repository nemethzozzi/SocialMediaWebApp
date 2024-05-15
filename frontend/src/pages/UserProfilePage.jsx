import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import SearchBar from '../components/SearchBar';
import UsersPage from '../components/Users/UsersPage';
import UserProfile from '../components/Users/UserProfile';

function ProfilePage({ user, }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-1/6 xl:w-1/6 bg-gray-800 text-white">
        <Sidebar />
      </div>
      {/* Main content */}
      <div className="md:w-4/6 xl:w-4/6 flex flex-col items-center p-4">
        <SearchBar />
        <UserProfile />
      </div>
      {/* User Page */}
      <div className="md:w-1/4 xl:w-1/6 bg-white p-4 border-l">
        <UsersPage />
      </div>
    </div>
  );
}

export default ProfilePage;
