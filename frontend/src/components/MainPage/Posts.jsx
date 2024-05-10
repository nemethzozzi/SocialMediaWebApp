import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Make sure this is correctly imported
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'; // For liking posts
import { HiOutlineTrash } from 'react-icons/hi'; // For deleting posts
import CommentSection from './CommentSection';
import axios from 'axios';


function Posts() {
  const [posts, setPosts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const { username, profilePicture } = user;
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;


  useEffect(() => {
    const fetchTimelinePosts = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/posts/timeline/all?userId=${user._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to fetch posts: ${response.status}, Body: ${errorBody}`);
        }
  
        const result = await response.json();
        // Sort posts in descending order based on the 'createdAt' timestamp
        const sortedPosts = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Now let's assume we want to fetch user details for each post
        const postsWithUserDetails = await Promise.all(
          sortedPosts.map(async (post) => {
            // If post.userId is just the ID, fetch the user details separately
            const userResponse = await axios.get(`${apiUrl}/api/users/${post.userId}`);
            // Combine the post with the user details
            return { ...post, user: userResponse.data };
          })
        );
  
        // Now you can set the postsWithUserDetails in your state
        setPosts(postsWithUserDetails);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error(`Could not fetch posts: ${error.message}`);
      }
    };
  
    if (user && user._id) fetchTimelinePosts();
  }, [user?._id, user?.token]); // Assuming user is defined and includes _id and token
  

const handleLike = async (postId) => {
  try {
    const response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({ userId: user._id }),
    });

    if (!response.ok) {
      const errorResponse = await response.json(); // Get more details from the server's response
      throw new Error(`Failed to like the post: ${errorResponse.message}`);
    }

    // Optimistically update the UI after liking a post
    const likedPost = posts.find(post => post._id === postId);
    if (likedPost) {
      if (hasLikedPost(likedPost.likes)) {
        // User is unliking the post
        toast.info('You unliked a post.');
      } else {
        // User is liking the post
        toast.success('You liked a post.');
      }

      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          if (hasLikedPost(post.likes)) {
            return { ...post, likes: post.likes.filter(id => id !== user._id) }; // Unlike the post
          } else {
            return { ...post, likes: [...post.likes, user._id] }; // Like the post
          }
        }
        return post;
      });

      setPosts(updatedPosts);
    }
  } catch (error) {
    console.error('Error liking/disliking post:', error);
    toast.error(`Error: ${error.message}`);
  }
};
  
  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete the post');
      }
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(`Error deleting post: ${error.message}`);
    }
  };

  const fetchCommentsForPost = async (postId) => {
    // Assuming each post object has a 'comments' array
    const updatedPosts = posts.map(async (post) => {
      if (post._id === postId) {
        try {
          const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`, {
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

  const hasLikedPost = (likes) => likes.includes(user._id);

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="space-y-4">
      <ToastContainer />
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="bg-white shadow rounded-md p-6 relative">
            {user._id === post.userId && (
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
              <div className="mb-2 mt-4 flex items-center cursor-pointer">
                <img
                  src={`${apiUrl}/images/${post.user.profilePicture.split('/').pop()}`}
                  alt={`${post.user?.username}'s profile`}
                  className="h-8 w-8 rounded-full object-cover"
                  onClick={() => navigate(`/profile/${post.user._id}`)}
                />
                <span className="font-semibold ml-2" onClick={() => handleNavigateToProfile(post.userId)}>{post.user?.username}</span>
              </div>
            </div>
            <p>{post.desc}</p>
            <div className="flex items-center mt-2">
              <button onClick={() => handleLike(post._id)} className="text-red-500 mr-2">
                {hasLikedPost(post.likes) ? <AiFillHeart size="24" /> : <AiOutlineHeart size="24" />}
              </button>
              <span>{post.likes?.length || 0}</span>
            </div>
            <CommentSection postId={post._id} user={user} fetchComments={() => fetchCommentsForPost(post._id)} />
          </div>
        ))
      ) : (
        <p>No posts to show.</p>
      )}
    </div>
  );
}



export default Posts;