import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    // Log to see if user data and token are fetched correctly
    console.log("User data fetched:", user);

    useEffect(() => {
        // Only proceed if the token is available
        if (!user || !user.token) {
            console.error("User or user token not available at the time of effect execution.");
            setError("Authentication data is missing. Please log in.");
            return; // Stop the function if there is no user or token
        }

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                setNotifications(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('Failed to fetch notifications');
                toast.error('Failed to load notifications.');
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.token]); // Dependency on user.token to re-run when it changes

    if (!user || !user.token) {
        return <p>You must be logged in to view this page.</p>;
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {notifications.length > 0 ? (
                <ul>
                    {notifications.map(notification => (
                        <li key={notification._id} className="bg-white p-2 shadow rounded mb-2">
                            {notification.message}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No new notifications.</p>
            )}
        </div>
    );
}

export default Notifications;
