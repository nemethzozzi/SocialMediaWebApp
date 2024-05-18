import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const { pathname } = location;

  // Check if the user is logged in
  if (!loggedInUser) {
    return <Navigate to="/login" />;
  }

  // Additional check for the profile page
  if (pathname.startsWith('/profile/') || pathname.startsWith('/update-profile/')) {
    const profileId = pathname.split('/').pop(); // Get the profile ID from the URL
    if (loggedInUser._id !== profileId) {
      return <Navigate to="/" />; // Redirect to home if IDs don't match
    }
  }

  return children;
};

export default PrivateRoute;
