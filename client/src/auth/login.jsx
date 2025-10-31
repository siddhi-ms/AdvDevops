import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State to hold the selected login role (user or admin)
  const [role, setRole] = useState('user'); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Send Login Request with role information
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Successful Login: Store credentials
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.name);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userAvatar', data.user.avatar || '');
        // Store the user's role returned by the server
        localStorage.setItem('userRole', data.user.role); 
        
        toast.success('Login successful!');

        // 3. Conditional Redirection based on role
        if (data.user.role === 'admin') {
          // Admin login - redirect to admin dashboard
          navigate('/admin');
        } else {
          // Regular user login - redirect to user dashboard
          navigate('/dashboard');
        }
      } else {
        toast.error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again later.');
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
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Welcome Back!</h2>
        
        <form onSubmit={handleLogin}>
          
          <div className="mb-6 text-left">
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
              Login Role
            </label>
            <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 bg-white appearance-none"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
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

          <div className="mb-8 text-left">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-sky-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-sky-700 transition-all duration-300 transform hover:scale-[1.01]"
          >
            {role === 'admin' ? 'Log In as Admin' : 'Log In'}
          </button>

          <a 
            href="#" 
            className="block mt-4 text-sm text-sky-600 hover:underline text-center"
            onClick={(e) => { e.preventDefault(); alert('Forgot Password functionality TBD'); }}
          >
            Forgot Password?
          </a>
          
          <p className="mt-6 text-gray-600 text-sm text-center">
            Don't have an account? 
            <Link 
                to="/signup" 
                className="text-sky-600 font-semibold hover:underline ml-1"
            >
                Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;