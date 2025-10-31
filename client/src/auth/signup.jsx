import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Signup successful! Please log in.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup. Please try again later.');
    }
  };

  // The 'bg-gradient-to-r from-[#6a11cb] to-[#2575fc]' class mimics the purple/blue gradient from the footer.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      
      <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
        <div className="text-left mb-8">
          <Link to="/" className="text-sm text-gray-600 hover:text-sky-600 transition">
            &larr; Back to Home
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create Your Account</h2>
        
        <form onSubmit={handleSignup}>
          
          <div className="mb-6 text-left">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200"
            />
          </div>

          <div className="mb-6 text-left">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200"
            />
          </div>

          <div className="mb-6 text-left">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200"
            />
          </div>

          <div className="mb-8 text-left">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-sky-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-sky-700 transition-all duration-300 transform hover:scale-[1.01]"
          >
            Sign Up
          </button>

          <p className="mt-6 text-gray-600 text-sm text-center">
            Already have an account? 
            <Link 
                to="/login" 
                className="text-sky-600 font-semibold hover:underline ml-1"
            >
                Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;