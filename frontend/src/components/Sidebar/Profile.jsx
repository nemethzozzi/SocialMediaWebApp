import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineHeart, AiFillHeart, AiOutlineEdit } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import CommentSection from '../MainPage/CommentSection';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userInfo = await axios.get(`${apiUrl}/api/users/${id}`);
        setUser(userInfo.data);
      } catch (err) {
        setError(err.toString());
      }

      try {
        const postResults = await axios.get(`${apiUrl}/api/users/${id}/posts`);
        if (Array.isArray(postResults.data)) {
          const sortedPosts = postResults.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPosts(sortedPosts);
        } else {
          setError('Failed to fetch posts');
        }
      } catch (err) {
        setError(err.toString());
      }
    };

    fetchUserAndPosts();
  }, [id, apiUrl]);

  const hasLikedPost = (likes) => {
    return likes.includes(loggedInUser?._id);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`${apiUrl}/api/posts/${postId}/like`, {
        userId: loggedInUser._id
      }, {
        headers: {
          'Authorization': `Bearer ${loggedInUser.token}`,
        },
      });
      if (response.data) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const isLiked = hasLikedPost(post.likes);
            return {
              ...post,
              likes: isLiked ? post.likes.filter(uid => uid !== loggedInUser._id) : [...post.likes, loggedInUser._id]
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
        headers: { Authorization: `Bearer ${loggedInUser.token}` },
        data: { userId: loggedInUser._id }
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
      formData.append('userId', loggedInUser._id);
      if (editImage) {
        formData.append('image', editImage);
      }

      const response = await axios.put(`${apiUrl}/api/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${loggedInUser.token}`
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
          const response = await axios.get(`${apiUrl}/api/posts/${postId}/comments`);
          const data = await response.data;
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


  if (error) {
    return <div className="text-red-500">{error}</div>;
  }


  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {user && (
        <div className="text-center mb-4">
          <img
            src={`${apiUrl}/images/${user.profilePicture.split('/').pop()}`}
            alt={`${user.username}'s profile`}
            className="inline-block h-40 w-40 rounded-full mb-2"
          />
          <h1 className="text-3xl font-bold">{user.username}</h1>
          {user && user._id === loggedInUser._id && (
            <Link to={`/update-profile/${id}`} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              Edit User
            </Link>
          )}
        </div>
      )}
      {posts.length > 0 ? posts.map((post) => (
        <div key={post._id} className="bg-white shadow rounded-md p-6 relative mt-4">
          {loggedInUser._id === post.userId && (
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
                src={`${apiUrl}/images/${user.profilePicture.split('/').pop()}`}
                alt={`${post.user?.username}'s profile`}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="font-semibold ml-2">{user.username}</span>
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
          <CommentSection postId={post._id} user={loggedInUser} fetchComments={() => fetchCommentsForPost(post._id)} />
        </div>
      )) : <p>No posts to show.</p>}
    </div>
  );
};

export default Profile;
