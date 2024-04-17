import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/user/${userId}`);
        if (response.status === 200) {
          setPosts(response.data);
        } else {
          toast.error("Failed to fetch user posts");
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading user posts...</div>;
  }

  return (
    <div>
      <ToastContainer />
      {posts.length > 0 ? (
        posts.map(post => (
          <div key={post._id} className="bg-white shadow rounded-md p-6 mb-4">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-gray-600">{post.content}</p>
          </div>
        ))
      ) : (
        <p>No posts found for this user.</p>
      )}
    </div>
  );
}

export default UserPosts;
