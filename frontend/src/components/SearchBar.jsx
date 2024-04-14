import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div>
      <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search users..." />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;
