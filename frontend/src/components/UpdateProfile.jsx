import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

function UpdateProfile() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [profileImageFile, setProfileImageFile] = useState(null); // State to handle file input
    const [originalUsername, setOriginalUsername] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [editField, setEditField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL; 
    const { userId } = useParams();

    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };

    useEffect(() => {
        setLoading(true);
        axios.get(`${apiUrl}/api/users/${userId}`)
            .then(response => {
                setUser(response.data);
                setUsername(response.data.username);
                setOriginalUsername(response.data.username);
                setEmail(response.data.email);
                setOriginalEmail(response.data.email);
                setProfilePicture(response.data.profilePicture);
            })
            .catch(error => {
                const message = error.response ? error.response.data.message : error.message;
                toast.error('Failed to fetch user data: ' + message);
                setError(message);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const checkUsernameAvailability = async () => {
        if (username !== originalUsername && username.trim() !== "") {
            try {
                const response = await axios.get(`${apiUrl}/api/users/check-username`, {
                    params: { username }
                });
                setUsernameAvailable(response.data.available);
                if (!response.data.available) {
                    toast.error('Username is already in use!');
                } else {
                    toast.success('Username is available.');
                }
                return response.data.available;
            } catch (err) {
                const errorMessage = err.response ? err.response.data.message : 'Network Error';
                toast.error('Failed to check username availability: ' + errorMessage);
                return false;
            }
        } else {
            setUsernameAvailable(true);
            return true;
        }
    };

    const handleEdit = field => {
        setEditField(editField === field ? null : field);
    };

    const handleCancel = field => {
        if (field === 'username') {
            setUsername(originalUsername);
            setUsernameAvailable(true);
        } else if (field === 'email') {
            setEmail(originalEmail);
        }
        setEditField(null);
        toast.info('Changes cancelled.');
    };

    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setProfilePicture(URL.createObjectURL(file)); // Preview the image
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!usernameAvailable || username.trim() === "") {
            toast.error('Invalid or unavailable username. Please correct it before updating.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('profilePicture', profileImageFile); // Append file
        if (password) {
            formData.append('password', password);
        }

        try {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            const response = await axios.put(`${apiUrl}/api/users/${userId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Assuming a Bearer token is used
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                toast.success('Profile updated successfully!');
                setUser({ ...user, username, email, profilePicture: response.data.profilePicture });
                setOriginalUsername(username);
                setOriginalEmail(email);
                setEditField(null);
                setProfileImageFile(null); // Clear file after upload
            } else {
                throw new Error('Update failed');
            }
        } catch (err) {
            toast.error('Failed to update profile: ' + (err.response ? err.response.data.message : err.message));
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <ToastContainer />
            <div className='bg-white p-8 border border-gray-300 shadow-lg rounded-lg' style={{ width: '500px' }}>
                <h1 className='text-lg font-bold mb-4 text-center'>User Profile</h1>
                {profilePicture && (
                    <div className="flex justify-center mb-4">
                        <img
                            src={`${apiUrl}/images/${user?.profilePicture.split('/').pop()}`}
                            alt="Profile"
                            className="rounded-full h-32 w-32 object-cover"
                        />
                    </div>
                )}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-bold text-gray-600 mb-2">
                        Profile Picture:
                        <input
                            type="file"
                            onChange={handleProfileImageChange}
                            className="mt-1 p-2 border border-gray-300"
                        />
                    </label>
                </div>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {editField === 'username' ? (
                        <>
                            <label className="block text-sm font-bold text-gray-600">
                                Username:
                                <br /><input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 p-2 border border-gray-300 rounded w-2/3"
                                />
                                <button onClick={checkUsernameAvailability} className="ml-2 px-4 py-1 rounded bg-blue-500 text-white">OK</button>
                                <button onClick={() => handleCancel('username')} className="ml-2 px-4 py-1 rounded bg-red-500 text-white">Cancel</button>
                            </label>
                        </>
                    ) : (
                        <div className="block text-sm font-bold text-gray-600">
                            Username: <br />{username}
                            <button onClick={() => handleEdit('username')} className="ml-2 px-4 py-1 rounded bg-blue-500 text-white my-2">Edit</button>
                        </div>
                    )}
                    {editField === 'email' ? (
                        <>
                            <label className="block text-sm font-bold text-gray-600">
                                Email:
                                <br /><input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 p-2 border border-gray-300 rounded w-2/3"
                                />
                                <button onClick={() => handleEdit('email')} className="ml-2 px-4 py-1 rounded bg-blue-500 text-white">OK</button>
                                <button onClick={() => handleCancel('email')} className="ml-2 px-4 py-1 rounded bg-red-500 text-white">Cancel</button>
                            </label>
                        </>
                    ) : (
                        <div className="block text-sm font-bold text-gray-600">
                            Email: <br />{email}
                            <button onClick={() => handleEdit('email')} className="ml-2 px-4 py-1 rounded bg-blue-500 text-white my-2">Edit</button>
                        </div>
                    )}
                    <div className="relative block text-sm font-bold text-gray-600">
                        Password:
                        <input
                            type={passwordShown ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password (optional)"
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                        />
                        <div onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6">
                            {passwordShown ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 rounded text-white text-sm">Update</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateProfile;
