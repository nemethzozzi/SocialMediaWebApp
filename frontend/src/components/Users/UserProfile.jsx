import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineHeart, AiFillHeart, AiOutlineEdit } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import CommentSection from '../MainPage/CommentSection';
import { useFollow } from '../FollowContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const { followState, toggleFollow } = useFollow();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userInfo = await axios.get(`${apiUrl}/api/users/${id}`);
        setProfileUser(userInfo.data);
      } catch (err) {
        setError(err.toString());
      }

      try {
        const postResults = await axios.get(`${apiUrl}/api/users/${id}/posts`);
        const sortedPosts = postResults.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts || []);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setPosts([]); // No posts found
        } else {
          setError(err.toString());
        }
      }
    };

    fetchUserAndPosts();
  }, [id, apiUrl, followState]);

  const hasLikedPost = (likes) => {
    return likes.includes(user?._id);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`${apiUrl}/api/posts/${postId}/like`, {
        userId: user._id
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (response.data) {
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
      const response = await axios.delete(`${apiUrl}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        data: { userId: user._id }
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

  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditDesc(post.desc);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditDesc('');
    setEditImage(null);
  };

  const handleSaveEdit = async (postId) => {
    try {
      const formData = new FormData();
      formData.append('desc', editDesc);
      formData.append('userId', user._id);
      if (editImage) {
        formData.append('image', editImage);
      }

      const response = await axios.put(`${apiUrl}/api/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to update the post');
      }

      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          return { ...post, desc: editDesc, img: editImage ? URL.createObjectURL(editImage) : post.img, edited: true };
        }
        return post;
      });

      setPosts(updatedPosts);
      setEditingPost(null);
      setEditDesc('');
      setEditImage(null);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(`Error updating post: ${error.message}`);
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

  const handleFollowToggle = async (userIdToFollow, isCurrentlyFollowing) => {
    const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';

    // Optimistically update the follow state
    toggleFollow(userIdToFollow, !isCurrentlyFollowing);

    try {
      await axios.put(`${apiUrl}/api/users/${userIdToFollow}/${endpoint}`, {
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success(`User has been ${isCurrentlyFollowing ? 'unfollowed' : 'followed'}.`);
    } catch (error) {
      // Revert follow state on error
      toggleFollow(userIdToFollow, isCurrentlyFollowing);
      console.error(`Failed to ${endpoint} user:`, error?.response?.data?.message || error.message);
      toast.error(`Failed to ${endpoint} user: ${error?.response?.data?.message || error.message}`);
    }
  };

  const isFollowing = profileUser ? followState[profileUser._id] : false;

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {profileUser && (
        <div className="text-center mb-4">
          <img
            src={`${apiUrl}/images/${profileUser.profilePicture.split('/').pop()}`}
            alt={`${profileUser.username}'s profile`}
            className="inline-block h-40 w-40 rounded-full mb-2"
          />
          <h1 className="text-3xl font-bold">
            {profileUser.username}
          </h1>
          {profileUser._id !== user._id && (
            <button
              onClick={() => handleFollowToggle(profileUser._id, isFollowing)}
              className={`px-4 py-1 rounded ${isFollowing ? 'bg-red-500' : 'bg-blue-500'} text-white mt-4`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      )}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="bg-white shadow rounded-md p-6 relative mt-4">
            {user._id === post.userId && (
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Edit post"
                >
                  <AiOutlineEdit size="24" />
                </button>
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete post"
                >
                  <HiOutlineTrash size="24" />
                </button>
              </div>
            )}
            <div className="mb-2">
              <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
              <div className="mb-2 mt-4 flex items-center">
                <img
                  src={`${apiUrl}/images/${profileUser.profilePicture.split('/').pop()}`}
                  alt={`${profileUser.username}'s profile`}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="font-semibold ml-2">{profileUser.username}</span>
              </div>
            </div>
            {editingPost === post._id ? (
              <div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                ></textarea>
                <input
                  type="file"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0 file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleSaveEdit(post._id)}
                    className="py-1 px-3 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="py-1 px-3 bg-red-500 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p>{post.desc} {post.edited && <span className="text-xs text-gray-400">(edited)</span>}</p>
            )}
            {post.img && (
              <img
                src={`${apiUrl}${post.img}`}
                alt="Post"
                className="max-h-96 m-auto mt-4"
              />
            )}
            <div className="flex items-center mt-2">
              <button onClick={() => handleLike(post._id)} className="text-red-500 mr-2">
                {hasLikedPost(post.likes) ? <AiFillHeart size="24" /> : <AiOutlineHeart size="24" />}
              </button>
              <span>{post.likes.length}</span>
            </div>
            <CommentSection postId={post._id} user={user} fetchComments={() => fetchCommentsForPost(post._id)} />
          </div>
        ))
      ) : (
        <p className="text-center text-2xl mt-10">This user has no post.</p>
      )}
    </div>
  );
};

export default UserProfile;
