import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar'; // Ensure this component exists and is properly imported
import { useNavigate } from 'react-router-dom'; // Ensure you're using react-router-dom v5.2.0 or above

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); // Initialized for redirection
  const user = JSON.parse(localStorage.getItem('user')); // Make sure the user is stored in localStorage

  useEffect(() => {
    const fetchNotifications = async () => {
      // Check if user data is available before attempting to fetch notifications
      if (!user || !user._id) {
        toast.info('Please log in to view notifications.');
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/${user._id}`, {
          method: 'GET',
          headers: {
            // Add authorization header if required
            'Authorization': `Bearer ${user.token}`,
          },
        });
    
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch notifications: ${errorData}`);
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error:", error.message);
        toast.error("Failed to fetch notifications");
      }
    };    
    fetchNotifications();
  }, [user?._id, user?.token]); // Dependency array to refetch if user ID or token changes

  const handleNotificationClick = (notification) => {
    // Check if notification has postId, navigate to post page if it exists
    if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    } else {
      toast.error('Post ID not found in notification.');
    }
  };

  return (
    <div className="flex">
      <Sidebar /> {/* Render Sidebar if it exists */}
      <div className="notifications-content">
        <h2>Notifications</h2>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} onClick={() => handleNotificationClick(notification)}>
              {notification.type} by {notification.byUserId} on {new Date(notification.date).toLocaleDateString()}
            </div>
          ))
        ) : (
          <p>No new notifications.</p>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}

export default Notifications;
