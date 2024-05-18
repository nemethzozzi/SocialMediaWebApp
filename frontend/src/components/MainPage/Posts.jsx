import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart, AiOutlineEdit } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import CommentSection from './CommentSection';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // Track which post is being edited
  const [editDesc, setEditDesc] = useState(''); // Store the new description during editing
  const [editImage, setEditImage] = useState(null); // Store the new image during editing
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
