import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiOutlineTrash } from 'react-icons/hi';
import { AiOutlineHeart, AiFillHeart, AiOutlineEdit } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

function CommentSection({ postId, user, fetchCommentsForPost }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const { profilePicture } = userData;
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  const fetchComments = async () => {
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
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error(`Could not fetch comments: ${error.message}`);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, user.token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user._id, text: commentText }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error('Failed to post comment: ' + errorResponse.message);
      }
      await fetchComments();
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(`Error adding comment: ${error.message}`);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      await fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete the comment:', error);
      toast.error(`Error deleting the comment: ${error.message}`);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Failed to like the comment: ${errorResponse.message}`);
      }

      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          if (hasLikedComment(comment.likes)) {
            toast.info('You unliked a comment.');
            return { ...comment, likes: comment.likes.filter(id => id !== user._id) };
          } else {
            toast.success('You liked a comment.');
            return { ...comment, likes: [...comment.likes, user._id] };
          }
        }
        return comment;
      });

      setComments(updatedComments);
    } catch (error) {
      console.error('Error liking/disliking comment:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text: editText, userId: user._id }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error('Failed to update the comment: ' + errorResponse.message);
      }

      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, text: editText, edited: true };
        }
        return comment;
      });

      setComments(updatedComments);
      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(`Error updating comment: ${error.message}`);
    }
  };

  const hasLikedComment = (likes) => likes?.includes(user._id);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mt-4">
      <ToastContainer />
      <form onSubmit={handleCommentSubmit} className="flex items-center">
        <img
          src={profilePicture ? `${apiUrl}/images/${profilePicture.split('/').pop()}` : '/defaultProfilePicture.jpg'}
          alt={`${user.username}'s profile`}
          className="h-8 w-8 rounded-full object-cover mr-2 cursor-pointer"
        />
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-md"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">Post</button>
      </form>
      {comments.map((comment) => (
        <div key={comment._id} className="mt-2 p-2 bg-gray-100 rounded-md border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">
            {formatDate(comment.createdAt)}
          </div>
          <div className="flex items-center">
            <img
              src={comment.userId?.profilePicture ? `${apiUrl}/images/${comment.userId.profilePicture.split('/').pop()}` : '/defaultProfilePicture.jpg'}
              alt={`${comment.userId?.username}'s profile`}
              className="h-8 w-8 rounded-full object-cover mr-2 cursor-pointer"
              onClick={() => navigate(`/user/${comment.userId?._id}`)}
            />
            <div className="flex-1 min-w-0 break-words">
              {editingComment === comment._id ? (
                <div className="flex flex-col">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  ></textarea>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleSaveEdit(comment._id)}
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
                <>
                  <span
                    className="font-semibold cursor-pointer"
                    onClick={() => navigate(`/user/${comment.userId?._id}`)}
                  >
                    {comment.userId?.username}:
                  </span>
                  <span className="ml-1">{comment.text}</span>
                  {comment.edited && (
                    <span className="text-xs text-gray-500 ml-1">(edited)</span>
                  )}
                </>
              )}
            </div>
            {user._id === comment.userId?._id && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditComment(comment)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Edit comment"
                >
                  <AiOutlineEdit size="16" />
                </button>
                <button
                  onClick={() => deleteComment(comment._id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete comment"
                >
                  <HiOutlineTrash size="16" />
                </button>
              </div>
            )}
            <button
              onClick={() => handleLike(comment._id)}
              className="text-red-500 hover:text-red-700 ml-4"
              aria-label="Like comment"
            >
              {hasLikedComment(comment.likes) ? <AiFillHeart size="16" /> : <AiOutlineHeart size="16" />}
            </button>
            <span>{comment.likes?.length || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommentSection;
