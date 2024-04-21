import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });      
      const data = await response.json();
      if (response.ok) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message || 'Registration failed!');
      }
    } catch (error) {
      console.error('Failed to register:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-3xl font-bold text-gray-900 mt-2 text-center">Register</div>
        <div className="bg-white p-8 border border-gray-300 mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="text-sm font-bold text-gray-600 block">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-bold text-gray-600 block">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Password</label>
              <input
                type={passwordShown ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
              <div onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6">
                {passwordShown ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
              </div>
            </div>
            <Link to="/login" className="block text-center text-blue-500 hover:text-blue-700 mb-5">Already have an account? Login!</Link>
              <button type="submit" className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 rounded-md text-white text-sm">Register</button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;