// SearchBar.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SearchBar = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!username.trim()) {
          toast.error('Please enter a username to search.');
          return;
        }
        try {
          const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/search/${encodeURIComponent(username.trim())}`);
          if (response.data && response.data.id) {
            navigate(`/user/${response.data.id}`);
          } else {
            toast.error('User not found');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'An error occurred during the search');
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
            />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
};

export default SearchBar;
