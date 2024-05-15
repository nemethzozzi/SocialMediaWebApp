import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

function CommentSection({ postId, user, fetchCommentsForPost }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
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
      toast.success("Comment added successfully");
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
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete the comment:", error);
      toast.error(`Error deleting the comment: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  

  return (
    <div className="mt-4">
      <form onSubmit={handleCommentSubmit} className="flex items-center">
        <img
          src={`${apiUrl}/images/${profilePicture.split('/').pop()}`}
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
              src={`${apiUrl}/images/${user.profilePicture.split('/').pop()}`}
              alt={`${comment.userId.username}'s profile`}
              className="h-8 w-8 rounded-full object-cover mr-2 cursor-pointer"
              onClick={() => navigate(`/user/${comment.userId._id}`)}
            />
            <div className="flex-1 min-w-0 break-words">
              <span
                className="font-semibold cursor-pointer"
                onClick={() => navigate(`/user/${comment.userId._id}`)}
              >
                {comment.userId.username}:
              </span>
              <span className="ml-1">{comment.text}</span>
            </div>
            {user._id === comment.userId._id && (
              <HiOutlineTrash
                className="cursor-pointer text-red-500 ml-2"
                onClick={() => deleteComment(comment._id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


export default CommentSection;
