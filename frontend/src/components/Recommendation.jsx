import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function Recommendation({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser._id) {
      fetchRandomUsers(currentUser);
    } else {
      // Handle the lack of a user object, maybe set loading to false or redirect
      setIsLoading(false);
    }
  }, []); // The empty array ensures this effect runs once after the initial render

  const fetchRandomUsers = async (currentUser) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/random?currentUserId=${currentUser._id}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch random users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching random users:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Ensure you send the authentication token as needed
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
      toast.success('User followed successfully');
      // Refresh the random users or handle the UI update as necessary
    } catch (error) {
      console.error('Error following user:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      {users.slice(0, 5).map((user) => (
        <div key={user._id} className="flex justify-between items-center p-3 border-b">
          <div className="flex items-center">
            {/* User image */}
            <img
              src={user.profilePicture || "/images/default_image.png"}
              alt={`${user.username}'s profile`}
              className="h-10 w-10 rounded-full object-cover mr-2"
            />
            <div>{user.username}</div>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleFollow(user._id)}
          >
            Follow
          </button>
        </div>
      ))}
    </div>
  );
}

export default Recommendation;
