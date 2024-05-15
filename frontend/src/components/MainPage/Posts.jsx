import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import CommentSection from './CommentSection';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
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
        const sortedPosts = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const postsWithUserDetails = await Promise.all(
          sortedPosts.map(async (post) => {
            const userResponse = await axios.get(`${apiUrl}/api/users/${post.userId}`);
            return { ...post, user: userResponse.data };
          })
        );

        setPosts(postsWithUserDetails);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error(`Could not fetch posts: ${error.message}`);
      }
    };

    if (user && user._id) fetchTimelinePosts();
  }, [user?._id, user?.token]);

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
        const errorResponse = await response.json();
        throw new Error(`Failed to like the post: ${errorResponse.message}`);
      }

      const likedPost = posts.find(post => post._id === postId);
      if (likedPost) {
        if (hasLikedPost(likedPost.likes)) {
          toast.info('You unliked a post.');
        } else {
          toast.success('You liked a post.');
        }

        const updatedPosts = posts.map(post => {
          if (post._id === postId) {
            if (hasLikedPost(post.likes)) {
              return { ...post, likes: post.likes.filter(id => id !== user._id) };
            } else {
              return { ...post, likes: [...post.likes, user._id] };
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
          return { ...post, comments: data };
        } catch (error) {
          console.error('Error fetching comments:', error);
          toast.error(`Could not fetch comments: ${error.message}`);
        }
      }
      return post;
    });
    setPosts(await Promise.all(updatedPosts));
  };

  const hasLikedPost = (likes) => likes.includes(user._id);

  const handleNavigateToProfile = (userId) => {
    navigate(`/user/${userId}`);
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
                  onClick={() => navigate(`/user/${post.user._id}`)}
                />
                <span className="font-semibold ml-2" 
                onClick={() => handleNavigateToProfile(post.userId)}>{post.user?.username}
                </span>
              </div>
            </div>
            <p>{post.desc}</p>
            {post.img && (
              <img
                src={`${apiUrl}${post.img}`}
                alt="Post"
                className="mt-4 max-h-96"
              />
            )}
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
