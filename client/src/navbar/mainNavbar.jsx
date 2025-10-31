import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Home, Calendar, MessageSquare, Users, Trophy, Bell, User, UserCircle, Settings, FileText, LogOut } from 'lucide-react';

import CollabLearnLogo from '../assets/Collablearn Logo.png';
import Notification from '../components/Notification';

export default function MainNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('Guest');
  const [email, setEmail] = useState('');
  const [isPremium, setIsPremium] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch user data from database
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('MainNavbar: Token exists:', !!token);
      
      if (!token) {
        console.log('MainNavbar: No token found, using localStorage fallback');
        // Fallback to localStorage if no token
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedIsPremium = localStorage.getItem('isPremium');
        if (storedUsername) {
          setUsername(storedUsername);
          setEmail(storedEmail || '');
        }
        if (storedIsPremium !== null) {
          setIsPremium(storedIsPremium === 'true');
        } else {
          // assume guest is not premium
          setIsPremium(false);
        }
        setLoading(false);
        return;
      }

      console.log('MainNavbar: Fetching user data...');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('MainNavbar: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('MainNavbar: Response data:', data);
        
        if (data.success && data.user) {
          console.log('MainNavbar: Setting username to:', data.user.name);
          setUsername(data.user.name || 'Guest');
          setEmail(data.user.email || '');
          setIsPremium(Boolean(data.user.isPremium));
          
          // Update localStorage for future fallback
          if (data.user.name) {
            localStorage.setItem('username', data.user.name);
          }
          if (data.user.email) {
            localStorage.setItem('email', data.user.email);
          }
          if (typeof data.user.isPremium !== 'undefined') {
            localStorage.setItem('isPremium', String(Boolean(data.user.isPremium)));
          }
        } else {
          console.log('MainNavbar: API returned success=false or no user data, using localStorage fallback');
          // Fallback to localStorage
          const storedUsername = localStorage.getItem('username');
          const storedEmail = localStorage.getItem('email');
          const storedIsPremium = localStorage.getItem('isPremium');
          if (storedUsername) {
            setUsername(storedUsername);
            setEmail(storedEmail || '');
          }
          if (storedIsPremium !== null) setIsPremium(storedIsPremium === 'true');
        }
      } else {
        console.log('MainNavbar: API request failed with status:', response.status);
        const errorText = await response.text();
        console.log('MainNavbar: Error response:', errorText);
        
        // Fallback to localStorage
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedIsPremium = localStorage.getItem('isPremium');
        if (storedUsername) {
          setUsername(storedUsername);
          setEmail(storedEmail || '');
        }
        if (storedIsPremium !== null) setIsPremium(storedIsPremium === 'true');
      }
    } catch (error) {
      console.error('MainNavbar: Error fetching user data:', error);
      
      // Fallback to localStorage
      const storedUsername = localStorage.getItem('username');
      const storedEmail = localStorage.getItem('email');
      const storedIsPremium = localStorage.getItem('isPremium');
      if (storedUsername) {
        setUsername(storedUsername);
        setEmail(storedEmail || '');
      }
      if (storedIsPremium !== null) setIsPremium(storedIsPremium === 'true');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug localStorage contents
    console.log('MainNavbar: localStorage contents:');
    console.log('- token:', localStorage.getItem('token'));
    console.log('- username:', localStorage.getItem('username'));
    console.log('- email:', localStorage.getItem('email'));
    console.log('- userId:', localStorage.getItem('userId'));
    
    // Immediately set from localStorage if available (for instant display)
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    if (storedUsername) {
      setUsername(storedUsername);
      setEmail(storedEmail || '');
    }
    
    // Then fetch fresh data from API
    fetchUserData();

    const fetchNotifications = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) return;

      try {
    const [studentResponse, instructorResponse] = await Promise.all([
      fetch(`http://localhost:5000/api/booking/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`http://localhost:5000/api/booking/instructor/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

        let allNotifications = [];

        if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            if (studentData.success) {
                const studentNotifications = studentData.bookings
                    .filter(b => b.status === 'confirmed' || b.status === 'cancelled')
                    .map(b => ({ ...b, type: 'student' }));
                allNotifications.push(...studentNotifications);
            }
        }

        if (instructorResponse.ok) {
            const instructorData = await instructorResponse.json();
            if (instructorData.success) {
                const instructorNotifications = instructorData.bookings
                    .filter(b => b.status === 'pending')
                    .map(b => ({ ...b, type: 'instructor' }));
                allNotifications.push(...instructorNotifications);
            }
        }
        
        allNotifications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setNotifications(allNotifications);

      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const notificationInterval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail.name) {
        setUsername(event.detail.name);
      }
      if (event.detail.email) {
        setEmail(event.detail.email);
      }
      if (typeof event.detail.isPremium !== 'undefined') {
        setIsPremium(Boolean(event.detail.isPremium));
        localStorage.setItem('isPremium', String(Boolean(event.detail.isPremium)));
      }
    };

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    window.addEventListener('profileUpdated', handleProfileUpdate);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      clearInterval(notificationInterval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('email');
    localStorage.removeItem('isPremium');
    setUsername('Guest');
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleMenuClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const getLinkClass = (path) => {
    const baseClasses = 'nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5';
    return location.pathname === path
  ? `${baseClasses} bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md`
      : `${baseClasses} text-gray-600 hover:text-indigo-700 hover:bg-indigo-50`;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        {/* The change is in the line below */}
        <div className="flex justify-between items-center h-20 px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={CollabLearnLogo}
              alt="CollabLearn Logo" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <span className="text-2xl font-bold text-indigo-600">CollabLearn</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
              <Home size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/browse-skills" className={getLinkClass('/browse-skills')}>
              <Search size={20} />
              <span className="font-medium">Browse Skills</span>
            </Link>
            <Link to="/calendar" className={getLinkClass('/calendar')}>
              <Calendar size={20} />
              <span className="font-medium">Calendar</span>
            </Link>
            <Link to="/messages" className={getLinkClass('/messages')}>
              <MessageSquare size={20} />
              <span className="font-medium">Messages</span>
            </Link>
            <Link to="/community" className={getLinkClass('/community')}>
              <Users size={20} />
              <span className="font-medium">Community</span>
            </Link>
            {isPremium === false && (
              <Link to="/get-premium" className={location.pathname === '/get-premium' ? 'nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-xl' : 'nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform text-amber-700 hover:text-amber-900 hover:bg-amber-50'}>
                <Trophy size={20} />
                <span className="font-medium">Get Premium</span>
              </Link>
            )}
            {/* <Link to="/achievements" className={getLinkClass('/achievements')}>
              <Trophy size={20} />
              <span className="font-medium">Achievements</span>
            </Link> */}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div 
              className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
              ref={notificationRef}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={20} className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center bell-notification">
                  {notifications.length}
                </span>
              )}
              {isNotificationsOpen && <Notification notifications={notifications} onClose={() => setIsNotificationsOpen(false)} />}
            </div>
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User size={20} className="text-gray-600" />
                <span className="text-base font-semibold text-gray-900">{username}</span>
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-dropdown">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {loading ? 'Loading...' : username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loading ? '' : email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items with new hover effect */}
                  <div className="p-2">
                    <button
                      onClick={() => handleMenuClick('/profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-[#CC66FF] hover:text-white rounded-lg transition-colors group"
                    >
                      <UserCircle size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick('/settings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-[#CC66FF] hover:text-white rounded-lg transition-colors group"
                    >
                      <Settings size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                      {/* <span className="font-medium">Settings</span> */}
                      <Link to="/settings"><span className="font-medium">Settings</span></Link>
                    </button>
                    {/* Resources button removed as requested */}
                  </div>

                  {/* Sign Out Button */}
                  <div className="px-4 pb-2 pt-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}