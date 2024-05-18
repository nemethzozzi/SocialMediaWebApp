import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const FollowContext = createContext();

export const useFollow = () => {
  return useContext(FollowContext);
};

export const FollowProvider = ({ children }) => {
  const [followState, setFollowState] = useState({});
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFollowState = async () => {
      if (user && user._id) {
        try {
          const response = await axios.get(`${apiUrl}/api/users/${user._id}/followings`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          const followings = response.data || [];
          const initialFollowState = {};
          followings.forEach(following => {
            initialFollowState[following._id] = true; // Assuming followings are user objects
          });
          setFollowState(initialFollowState);
        } catch (error) {
          console.error('Failed to fetch follow state:', error);
        }
      }
    };

    fetchFollowState();
  }, [user, apiUrl]);

  const toggleFollow = (userId, isFollowing) => {
    setFollowState((prevState) => ({
      ...prevState,
      [userId]: isFollowing,
    }));
  };

  return (
    <FollowContext.Provider value={{ followState, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};

export default FollowProvider;
