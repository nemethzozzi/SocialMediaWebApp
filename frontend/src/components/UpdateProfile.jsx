import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ username: '', email: '', password: '' });
  const [editMode, setEditMode] = useState({ username: false, email: false, password: false });
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState(null);

  if (user) {
    console.log('Current User ID:', user._id);
    console.log('Current Username:', user.username);
    console.log('URL ID:', id);

    if (user._id === id) {
        console.log('This is the profile of the current user');
    } else {
        console.log('This is the profile of another user');
    }
}


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser({
            ...response.data,
            token: response.headers.authorization || response.headers.Authorization
          });
        setUserData({ username: response.data.username, email: response.data.email });
      } catch (error) {
        toast.error('Failed to fetch user data.');
      }
    };

    fetchUserData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024 && ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      setProfileImage(file);
    } else {
      toast.error('Invalid file. Please select an image up to 10MB.');
    }
  };

  const handleSaveChanges = async (field) => {
    const formData = new FormData();
    formData.append(field, userData[field]);
    formData.append('userId', user.id); // Assuming user.id is the logged-in user's ID
  
    if (field === 'profilePicture' && profileImage) {
      formData.append('profilePicture', profileImage);
    }
  
    // Include isAdmin if necessary
    formData.append('isAdmin', user.isAdmin);
  
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`, // Ensure this token is valid and not undefined
        },
      });
    } catch (error) {
      toast.error(error.response?.data.message || 'An error occurred while updating the profile.');
    }
  };

  const handleChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="space-y-6">
        {Object.entries(userData).map(([key, value]) => (
          <div key={key}>
            {editMode[key] ? (
              <>
                <input
                  type={key === 'password' ? 'password' : 'text'}
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
                <button onClick={() => handleSaveChanges(key)}>Save</button>
                <button onClick={() => setEditMode({ ...editMode, [key]: false })}>Cancel</button>
              </>
            ) : (
              <>
                <span>{value}</span>
                <button onClick={() => setEditMode({ ...editMode, [key]: true })}>Edit</button>
              </>
            )}
          </div>
        ))}
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input
            id="profilePicture"
            type="file"
            onChange={handleImageChange}
            accept=".jpg, .jpeg, .png, .gif"
            className="mt-1 block w-full"
          />
          {profileImage && (
            <div className="mt-4">
              <p>Selected image: {profileImage.name}</p>
              <button onClick={() => handleSaveChanges('profilePicture')}>Upload Image</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
