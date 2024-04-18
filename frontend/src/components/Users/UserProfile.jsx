import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import CommentSection from '../MainPage/CommentSection';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  if (user) {
    console.log('Current User ID:', user._id);
    console.log('Current Username:', user.username);
    console.log('URL ID:', id);

    if (user._id === id) {
        console.log('This is the profile of the current user');
    } else {
        console.log('This is the profile of another user');
    }
}

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userInfo = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(userInfo.data);
        const postResults = await axios.get(`http://localhost:5000/api/users/${id}/posts`);
        if (Array.isArray(postResults.data)) {
          setPosts(postResults.data);
        } else {
          setError('Failed to fetch posts');
        }
      } catch (err) {
        setError(err.toString());
      }
    };

    fetchUserAndPosts();
  }, [id]);

  const hasLikedPost = (likes) => {
    return likes.includes(user?._id);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {
        userId: user._id
      });
      if (response.data) {
        // Optimistically toggle like state in the UI
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const isLiked = hasLikedPost(post.likes);
            return {
              ...post,
              likes: isLiked ? post.likes.filter(uid => uid !== user._id) : [...post.likes, user._id]
            };
          }
          return post;
        }));
        toast.success(`You have ${hasLikedPost(posts.find(post => post._id === postId).likes) ? 'liked' : 'unliked'} the post!`);
      }
    } catch (error) {
      toast.error('Failed to like the post');
      console.error('Like operation failed:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        data: { userId: user._id } // Ensure backend checks this!
      });
      if (response.status === 200) {
        setPosts(posts.filter(post => post._id !== postId));
        toast.success('Post deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Delete operation failed:', error);
    }
  };

  const fetchCommentsForPost = async (postId) => {
    // Assuming each post object has a 'comments' array
    const updatedPosts = posts.map(async (post) => {
      if (post._id === postId) {
        try {
          const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch comments');
          }
          const data = await response.json();
          return { ...post, comments: data }; // Update this post's comments
        } catch (error) {
          console.error('Error fetching comments:', error);
          toast.error(`Could not fetch comments: ${error.message}`);
        }
      }
      return post; // Return unchanged post for those that don't match
    });
    setPosts(await Promise.all(updatedPosts)); // Update the state once all promises are resolved
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-4">
        <img
          src={user?.profilePicture || "/images/default_profile.png"}
          alt={`${user?.username}'s profile`}
          className="inline-block h-10 w-10 rounded-full mr-2"
        />
        <span>{user?.username}</span>
      </h1>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="bg-white shadow rounded-md p-6 relative mt-4">
            {user?._id === post.userId && (
              <button 
                onClick={() => handleDeletePost(post._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                aria-label="Delete post"
              >
                <HiOutlineTrash size="24" />
              </button>
            )}
            <div className="mb-2">
              <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
              <div className="mb-2 mt-4 flex items-center">
                <img
                  src={post.user?.profilePicture || "/images/default_image.png"}
                  alt={`${post.user?.username}'s profile`}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="font-semibold ml-2">{post.user?.username}</span>
              </div>
            </div>
            <p>{post.desc}</p>
            <div className="flex items-center mt-2">
              <button onClick={() => handleLike(post._id)} className="text-red-500 mr-2">
                {hasLikedPost(post.likes) ? <AiFillHeart size="24" /> : <AiOutlineHeart size="24" />}
              </button>
              <span>{post.likes.length}</span>
            </div>
            <CommentSection postId={post._id} user={user} />
          </div>
        ))
      ) : (
        <p>No posts to show.</p>
      )}
    </div>
  );
};

export default UserProfile;