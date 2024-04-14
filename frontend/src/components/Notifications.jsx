import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar'; // Assuming you have this component
import { useNavigate } from 'react-router-dom'; // Make sure to import useNavigate

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); // Initialize navigate for redirection
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Ensure you replace 'user._id' with the correct way to access the user's ID
        const response = await fetch(`http://localhost:5000/api/notifications/${user._id}`, {
          method: 'GET',
          // Add headers if needed, for example, for authorization
        });
    
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error:", error.message);
        toast.error("Failed to fetch notifications");
      }
    };    
    fetchNotifications();
  }, [user?._id, user?.token]); // Ensure useEffect reacts to changes in user._id or user.token

  const handleNotificationClick = (notification) => {
    // Define behavior for clicking on a notification, e.g., navigate to a post
    navigate(`/post/${notification.postId}`);
  };

  return (
    <div className="flex">
      <Sidebar /> {/* Render Sidebar */}
      <div className="notifications-content">
        <h2>Notifications</h2>
        {notifications.map((notification, index) => (
          <div key={index} onClick={() => handleNotificationClick(notification)}>
            {notification.type} by {notification.byUserId} on {new Date(notification.date).toLocaleDateString()}
          </div>
        ))}
        <ToastContainer />
      </div>
    </div>
  );
}

export default Notifications;
