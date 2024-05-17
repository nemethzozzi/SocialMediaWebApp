import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const apiUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL; 

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Login successful! Redirecting...');
        localStorage.setItem('user', JSON.stringify(data));
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Failed to login:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };  
   

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-3xl font-bold text-gray-900 mt-2 text-center">Login</div>
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
            <Link to="/register" className="block text-center text-blue-500 hover:text-blue-700 mb-5">Don't have an account? Register!</Link>
              <button type="submit" className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-700 rounded-md text-white text-sm">Login</button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
