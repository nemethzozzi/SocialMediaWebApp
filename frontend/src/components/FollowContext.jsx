import React, { createContext, useContext, useState } from 'react';

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const [followState, setFollowState] = useState({});

  const toggleFollow = (userId) => {
    setFollowState((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId],
    }));
  };

  return (
    <FollowContext.Provider value={{ followState, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);
