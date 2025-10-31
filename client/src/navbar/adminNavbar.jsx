import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Settings, LogOut, User, LayoutDashboard, Trash2, Home, Bell } from 'lucide-react';

// Assuming the logo is imported
import CollabLearnLogo from '../assets/Collablearn Logo.png'; 

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // State and user data from localStorage
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Admin');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'admin@collab.com');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userRole = localStorage.getItem('userRole'); 

  // --- Styling Helper Functions (Light Mode Only) ---
  
  // Base class for navigation links
  const linkBase = 'nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5';
  
  // Link styling helper function for admin tabs (match mainNavbar colors)
  const getLinkClass = (path) => {
    const active = `${linkBase} bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md`;
    const inactive = `${linkBase} text-gray-600 hover:text-indigo-700 hover:bg-indigo-50`;
    return location.pathname === path ? active : inactive;
  };

  // Dropdown menu item styling
  const getMenuButtonClass = () => {
    // Retaining the original hover style from the user's MainNavbar
    return `w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-[#CC66FF] hover:text-white rounded-lg transition-colors group`;
  };

  // --- Effects and Handlers ---
  useEffect(() => {
    // Handles clicking outside the dropdown to close it
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all user data
    localStorage.clear(); 
    setUsername('Guest');
    setEmail('');
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleMenuClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };
  
  // Define Admin Navigation Tabs
  const adminNavTabs = [
    { path: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { path: '/admin/manage-users', icon: Users, label: 'Manage Users' }, 
    { path: '/admin/manage-posts', icon: Trash2, label: 'Manage Posts' },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Admin Settings' },
  ];

  // --- Render ---
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="flex justify-between items-center h-20 px-8">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <img 
              src={CollabLearnLogo}
              alt="CollabLearn Logo" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <span className="text-2xl font-bold text-indigo-600">CollabLearn</span>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-1">
            {adminNavTabs.map(tab => (
              <Link key={tab.path} to={tab.path} className={getLinkClass(tab.path)}>
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </Link>
            ))}
          </div>

          {/* User Section (Notifications and Profile Dropdown) */}
          <div className="flex items-center gap-4">
            {/* Notifications (Placeholder) */}
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center bell-notification">5</span>
            </div>

            {/* Profile Dropdown */}
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
                  
                  
                  {/* <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{username}</p>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>
                    </div>
                  </div> */}

                  {/* Admin Menu Items */}
                    <div className="p-2">
                    {/* Link back to regular dashboard (Optional for quick switching) */}
                    {/* {userRole === 'admin' && (
                        <button
                          onClick={() => handleMenuClick('/dashboard')}
                          className={getMenuButtonClass()}
                        >
                            <Home size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                            <span className="font-medium">User Dashboard</span>
                        </button>
                    )}
                    
                    <button
                      onClick={() => handleMenuClick('/profile')}
                      className={getMenuButtonClass()}
                    >
                      <User size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => handleMenuClick('/settings')}
                      className={getMenuButtonClass()}
                    >
                      <Settings size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                      <span className="font-medium">Settings</span>
                    </button> */}
                  </div>

                  {/* Sign Out Button */}
                  {/* <div className="px-4 pb-2 pt-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div> */}
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