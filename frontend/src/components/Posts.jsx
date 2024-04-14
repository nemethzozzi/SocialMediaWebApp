import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'; // For liking posts
import { HiOutlineTrash } from 'react-icons/hi'; // For deleting posts
import CreatePost from './CreatePost';


function Posts() {
  const [posts, setPosts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // Assuming user info is stored in localStorage

  useEffect(() => {
    const fetchTimelinePosts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/timeline/all?userId=${user._id}`, {
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
        // Assuming each post object has a 'createdAt' field
        // Sort posts in descending order based on the 'createdAt' timestamp
        const sortedPosts = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error(`Could not fetch posts: ${error.message}`);
      }
    };
  
    if (user && user._id) fetchTimelinePosts();
  }, [user?._id, user?.token]);
  
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

const handleLike = async (postId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
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
        // User is disliking the post
        toast.info('You disliked a post.');
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
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
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

  const hasLikedPost = (likes) => likes.includes(user._id);

  return (
    <div className="space-y-4">
    <CreatePost onPostCreated={handlePostCreated} />
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
              <h5 className="text-lg font-semibold">{post.username}</h5>
              <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
              <img
              src={post.userId.profilePicture || "/images/default_image.png"}
              className="h-8 w-8 rounded-full object-cover mr-2 mt-2"
            />
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

function CommentSection({ postId, user, fetchCommentsForPost }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  // Standalone function to fetch comments
  const fetchComments = async () => {
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
      setComments(data); // Assuming the response directly gives the comments array
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
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
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
      await fetchComments(); // Refresh comments after adding a new one
      setCommentText('');
      toast.success("Comment added successfully");
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(`Error adding comment: ${error.message}`);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
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
      await fetchComments(); // Refresh comments after deleting
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
            {/* User image */}
            <img
              src={comment.userId.profilePicture || "/images/default_image.png"}
              alt={`${comment.userId.username}'s profile`}
              className="h-8 w-8 rounded-full object-cover mr-2" // Tailwind classes for image styling
            />
            {/* Username and comment text */}
            <div className="flex-1 min-w-0 break-words">
              <span className="font-semibold">{comment.userId.username}:</span>
              <span className="ml-1">{comment.text}</span>
            </div>
            {/* Delete comment icon */}
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

export default Posts;
