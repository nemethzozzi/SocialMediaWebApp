import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import UpdateProfile from '../components/UpdateProfile';

function UpdateUserPage({ user, }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-1/6 xl:w-1/6 bg-gray-800 text-white">
        <Sidebar />
      </div>
      {/* Main content */}
      <div className="md:w-4/6 xl:w-4/6 flex flex-col items-center p-4">
        <UpdateProfile />
      </div>
    </div>
  );
}

export default UpdateUserPage;
