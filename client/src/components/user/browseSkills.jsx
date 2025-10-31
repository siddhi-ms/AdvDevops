import React, { useState, useEffect } from 'react';
import { Search, Home, Calendar, MessageSquare, Users, Trophy, Bell, Filter, Clock, MapPin, Star, UserPlus, X, ChevronDown, Sparkles } from 'lucide-react';
import MainNavbar from '../../navbar/mainNavbar.jsx';
import { Link } from 'react-router-dom';
import { getAvatarDisplayProps, hasCustomAvatar } from '../../utils/avatarUtils';
import { formatINR } from '../../utils/currencyUtils';
// Placeholder MainNavbar component


export default function SkillSwapBrowse() {
  // Current logged-in user id (if logged in)
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const [visibleSkills, setVisibleSkills] = useState(6);
  const [showPostSkillModal, setShowPostSkillModal] = useState(false);
  const [postSkillForm, setPostSkillForm] = useState({
    title: '',
    description: '',
    skills: '',
    timePerHour: '',
    price: ''
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [skillCounts, setSkillCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Predefined skills mapping to categories
  const skillCategoryMapping = {
    'Java': 'Java',
    'Python': 'Python', 
    'C/C++': 'C/C++',
    'C++': 'C/C++',
    'C': 'C/C++',
    'MongoDB': 'MongoDB',
    'Mongo': 'MongoDB',
    'Express': 'Express',
    'Express.js': 'Express',
    'React': 'React',
    'React.js': 'React',
    'Node.js': 'Node.js',
    'Node': 'Node.js',
    'JavaScript': 'Programming',
    'TypeScript': 'Programming',
    'HTML/CSS': 'Programming',
    'PHP': 'Programming',
    'Ruby': 'Programming',
    'Go': 'Programming',
    'Rust': 'Programming',
    'Kotlin': 'Programming',
    'Swift': 'Programming',
    'Angular': 'Programming',
    'Vue.js': 'Programming',
    'Spring Boot': 'Java',
    'Django': 'Python',
    'Flask': 'Python',
    'Laravel': 'Programming',
    'Ruby on Rails': 'Programming',
    'ASP.NET': 'Programming',
    'PostgreSQL': 'MongoDB',
    'MySQL': 'MongoDB',
    'SQLite': 'MongoDB',
    'Redis': 'MongoDB',
    'Docker': 'Programming',
    'Kubernetes': 'Programming',
    'AWS': 'Programming',
    'Azure': 'Programming',
    'Google Cloud': 'Programming',
    'Git': 'Programming',
    'Linux': 'Programming',
    'DevOps': 'Programming',
    'Machine Learning': 'Programming',
    'Data Science': 'Programming',
    'Artificial Intelligence': 'Programming',
    'Cybersecurity': 'Programming',
    'UI/UX Design': 'Programming',
    'Graphic Design': 'Programming',
    'Digital Marketing': 'Programming',
    'Project Management': 'Programming'
  };

  const categories = [
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ), 
      name: 'All Categories', 
      count: skillCounts['All Categories'] || 0, 
      active: selectedCategory === 'All Categories'
    },
    
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5">
          {/* Steam */}
          <path d="M18 8c1 2 0 4 1 6M25 6c1 2.5 0 4.5 1 7" strokeLinecap="round"/>
          
          {/* Coffee cup */}
          <path d="M12 20h26M12 20c0 0 2 18 13 18s13-18 13-18" strokeLinecap="round" strokeLinejoin="round"/>
          <ellipse cx="25" cy="20" rx="13" ry="3" fill="currentColor" opacity="0.2"/>
          
          {/* Cup handle */}
          <path d="M38 24c2 0 4 1.5 4 4s-2 4-4 4" strokeLinecap="round"/>
        </svg>
      ), 
      name: 'Java', 
      count: skillCounts['Java'] || 0,
      active: selectedCategory === 'Java'
    },
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="currentColor">
          <path d="M25,2L6,11v17c0,11.7,8.1,22.6,19,25c10.9-2.4,19-13.3,19-25V11L25,2z M25,7l15,7v14c0,9.3-6.4,17.9-15,20 c-8.6-2.1-15-10.7-15-20V14L25,7z"/>
          <text x="25" y="32" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">C++</text>
        </svg>
      ), 
      name: 'C/C++', 
      count: skillCounts['C/C++'] || 0,
      active: selectedCategory === 'C/C++'
    },
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="currentColor">
          {/* Python snake logo - two intertwined snakes */}
          <path d="M20 8c-3 0-5 2-5 5v6h10v1H13c-3 0-5 2-5 5v6c0 3 2 5 5 5h4v-5c0-3 2-5 5-5h10c2.5 0 4.5-2 4.5-4.5v-8.5c0-3-2-5-5-5h-11.5z" opacity="0.6"/>
          <path d="M30 42c3 0 5-2 5-5v-6H25v-1h12c3 0 5-2 5-5v-6c0-3-2-5-5-5h-4v5c0 3-2 5-5 5H18c-2.5 0-4.5 2-4.5 4.5v8.5c0 3 2 5 5 5h11.5z"/>
          <circle cx="18" cy="13" r="1.5" fill="white"/>
          <circle cx="32" cy="37" r="1.5" fill="white"/>
        </svg>
      ), 
      name: 'Python', 
      count: skillCounts['Python'] || 0,
      active: selectedCategory === 'Python'
    },
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="currentColor">
          {/* MongoDB leaf */}
          <path d="M25 5c-1 0-1.8 3-2.5 7-.8 4-1.5 9-1.5 13 0 6 2 10 4 10s4-4 4-10c0-4-.7-9-1.5-13-.7-4-1.5-7-2.5-7z"/>
          <path d="M24 35v10h2V35" opacity="0.6"/>
          <ellipse cx="25" cy="15" rx="8" ry="12" opacity="0.3"/>
        </svg>
      ), 
      name: 'MongoDB', 
      count: skillCounts['MongoDB'] || 0,
      active: selectedCategory === 'MongoDB'
    },
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="8" y1="25" x2="42" y2="25"/>
          <line x1="8" y1="15" x2="25" y2="15"/>
          <line x1="8" y1="35" x2="25" y2="35"/>
          <path d="M25 5L42 15v20L25 45"/>
        </svg>
      ), 
      name: 'Express', 
      count: skillCounts['Express'] || 0,
      active: selectedCategory === 'Express'
    },
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="25" cy="25" rx="18" ry="7"/>
          <ellipse cx="25" cy="25" rx="18" ry="7" transform="rotate(60 25 25)"/>
          <ellipse cx="25" cy="25" rx="18" ry="7" transform="rotate(120 25 25)"/>
          <circle cx="25" cy="25" r="4" fill="currentColor"/>
        </svg>
      ), 
      name: 'React', 
      count: skillCounts['React'] || 0,
      active: selectedCategory === 'React'
    },
    { 
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 50 50" fill="currentColor">
          {/* Node.js hexagon with JS */}
          <path d="M25 5L8 14v18l17 10 17-10V14L25 5z"/>
          <path d="M25 10l12 7v14l-12 7-12-7V17l12-7z" fill="white" opacity="0.9"/>
          <text x="25" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">JS</text>
        </svg>
      ), 
      name: 'Node.js', 
      count: skillCounts['Node.js'] || 0,
      active: selectedCategory === 'Node.js'
    }
  ];

  const [postedSkills, setPostedSkills] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newSkillAdded, setNewSkillAdded] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);

  // Function to calculate skill counts by category
  const calculateSkillCounts = (skills) => {
    const counts = {
      'All Categories': skills.length,
      'Java': 0,
      'Python': 0,
      'C/C++': 0,
      'MongoDB': 0,
      'Express': 0,
      'React': 0,
      'Node.js': 0
    };

    skills.forEach(skill => {
      const skillName = skill.name;
      const category = skillCategoryMapping[skillName];
      
      if (category && counts.hasOwnProperty(category)) {
        counts[category]++;
      }
    });

    return counts;
  };

  // Function to filter skills by category
  const filterSkillsByCategory = (skills, category) => {
    if (category === 'All Categories') {
      return skills;
    }

    if (!category) {
      return skills;
    }

    return skills.filter(skill => {
      const skillCategory = skillCategoryMapping[skill.name];
      return skillCategory === category;
    });
  };

  // Enhanced fetch function with smooth loading
  const fetchPostedSkills = async (showLoader = true) => {
    try {
      if (showLoader) {
        setPageLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await fetch('/api/skills/search');
      const data = await response.json();
      
      if (data.success) {
        console.log('=== SKILLS FETCHED SUCCESSFULLY ===');
        console.log('Skills count:', data.data.length);
        
        // Add smooth transition for new skills
        if (!showLoader && data.data.length > postedSkills.length) {
          setNewSkillAdded(true);
          setTimeout(() => setNewSkillAdded(false), 2000);
        }
        
        setPostedSkills(data.data);
        
        // Calculate skill counts by category
        const counts = calculateSkillCounts(data.data);
        setSkillCounts(counts);
        
        // Filter skills based on selected category
        const filtered = filterSkillsByCategory(data.data, selectedCategory);
        setFilteredSkills(filtered);
        
      } else {
        console.error('Failed to fetch posted skills:', data.message);
      }
    } catch (error) {
      console.error('Error fetching posted skills:', error);
    } finally {
      if (showLoader) {
        // Add minimum loading time for smooth UX
        setTimeout(() => setPageLoading(false), 500);
      } else {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  };

  useEffect(() => {
    fetchPostedSkills(true);
    
    // Optional: Set up auto-refresh every 5 minutes for real-time updates
    const autoRefreshInterval = setInterval(() => {
      fetchPostedSkills(false);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(autoRefreshInterval);
  }, []);

  // Update filtered skills when posted skills or selected category changes
  useEffect(() => {
    if (postedSkills.length > 0) {
      const filtered = filterSkillsByCategory(postedSkills, selectedCategory);
      setFilteredSkills(filtered);
    }
  }, [postedSkills, selectedCategory]);

  // Fetch user's available skills from database
  const fetchAvailableSkills = async () => {
    try {
      setSkillsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/skills/my-skills', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Filter for skills that are being offered but are not yet posted
        const skillsToPost = data.data.skillsOffering.filter(skill => !skill.isPosted);
        const uniqueSkillNames = [...new Set(skillsToPost.map(skill => skill.name))];
        setAvailableSkills(uniqueSkillNames);
      } else {
        console.error('Failed to fetch skills:', data.message);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Fetch skills when modal opens
  useEffect(() => {
    if (showPostSkillModal) {
      fetchAvailableSkills();
    }
  }, [showPostSkillModal]);

  const handlePostSkillSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to post a skill');
        return;
      }

      const response = await fetch('/api/skills/post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: postSkillForm.title,
          description: postSkillForm.description,
          skills: postSkillForm.skills,
          timePerHour: postSkillForm.timePerHour,
          price: postSkillForm.price
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success message with smooth animation
        setSuccessMessage('Skill posted successfully! 🎉');
        setTimeout(() => setSuccessMessage(''), 4000);
        
        // Reset form and close modal
        setPostSkillForm({
          title: '',
          description: '',
          skills: '',
          timePerHour: '',
          price: ''
        });
        setShowPostSkillModal(false);
        setShowSkillsDropdown(false);
        
        // Dynamically refresh skills without full page reload
        setTimeout(() => {
          fetchPostedSkills(false); // Use refresh mode
        }, 500);
        
      } else {
        alert(data.message || 'Failed to post skill');
      }
    } catch (error) {
      console.error('Error posting skill:', error);
      alert('An error occurred while posting the skill. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostSkillForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle skill selection
  const handleSkillSelect = (skillName) => {
    setPostSkillForm(prev => ({
      ...prev,
      skills: skillName
    }));
    setShowSkillsDropdown(false); // Close dropdown after selection
  };

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    const filtered = filterSkillsByCategory(postedSkills, categoryName);
    setFilteredSkills(filtered);
    setVisibleSkills(6); // Reset visible skills count
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }

        .category-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-card:hover {
          transform: translateY(-4px);
        }

        .skill-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .skill-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .nav-item {
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          transform: scale(1.05);
        }

        .tag-item {
          transition: all 0.2s ease;
        }

        .tag-item:hover {
          transform: scale(1.1);
        }

        .bell-notification {
          animation: pulse 2s infinite;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .modal-overlay {
          backdrop-filter: blur(4px);
          background: rgba(0, 0, 0, 0.4);
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .modal-overlay {
          backdrop-filter: blur(4px);
          background: rgba(0, 0, 0, 0.4);
        }
      `}</style>

      <MainNavbar />

      {/* Main Content */}
      <div className="pt-24">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Amazing Skills</h1>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 animate-slideDown">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 max-w-md mx-auto">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-green-700 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-12 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search skills, instructors, or topics..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
            </div>
            {/* category select removed to simplify UI */}
            <Link to="/skill-recommendations" className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg font-medium cursor-pointer">
              <Sparkles size={18} className="text-white" />
              <span className="font-medium">Recommendations</span>
            </Link>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg font-semibold cursor-pointer"
              onClick={() => setShowPostSkillModal(true)}
            >
              <UserPlus size={20} />
              <span>Post Skill</span>
            </button>
          </div>

          {/* Browse by Category */}
          <div className="mb-12 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`category-card p-6 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer ${
                    cat.active
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                  style={{animationDelay: `${0.3 + idx * 0.05}s`}}
                >
                  <div className="bg-indigo-100 rounded-2xl p-4 mb-4 text-indigo-600">{cat.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</div>
                  <div className="text-xs text-gray-500">{cat.count} skills</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills Available with Refresh Button */}
          <div className="mb-8 flex items-center justify-between animate-fadeInUp" style={{animationDelay: '0.5s'}}>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredSkills.length} Skills Available
              {selectedCategory && selectedCategory !== 'All Categories' && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  in {selectedCategory}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchPostedSkills(false)}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-all ${
                  isRefreshing 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 hover:border-indigo-400 cursor-pointer'
                }`}
                title="Refresh skills"
              >
                <div className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              {/* relevance sort removed; keep only refresh and actions */}
            </div>
          </div>

          {/* Skills Grid with Enhanced Loading */}
          {pageLoading ? (
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Skeleton Loading Cards */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  {/* Header skeleton */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  {/* Content skeleton */}
                  <div className="space-y-3 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  
                  {/* Tags skeleton */}
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  
                  {/* Footer skeleton */}
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Refresh indicator */}
              {isRefreshing && (
                <div className="mb-6 animate-fadeIn">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700 font-medium">Refreshing skills...</span>
                  </div>
                </div>
              )}
              
              {/* New skill notification */}
              {newSkillAdded && (
                <div className="mb-6 animate-slideDown">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-green-700 font-medium">New skills available! Check them out below.</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-6 mb-8">
              {filteredSkills.slice(0, visibleSkills).map((skill, idx) => (
                <div key={skill._id} className="skill-card bg-white rounded-xl border border-gray-200 p-6 animate-fadeInUp" style={{animationDelay: `${0.6 + idx * 0.1}s`}}>
                  {/* Instructor Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      // Use avatar utility functions for consistent avatar handling
                      const avatarProps = getAvatarDisplayProps(skill.user, 48);
                      
                      console.log('=== AVATAR RENDERING WITH UTILS ===');
                      console.log('User:', skill.user?.name);
                      console.log('Avatar Props:', avatarProps);
                      
                      // Try to show custom avatar first
                      if (avatarProps.hasCustom && avatarProps.avatarUrl) {
                        console.log('Showing custom avatar:', avatarProps.avatarUrl);
                        return (
                          <img 
                            src={avatarProps.avatarUrl}
                            alt={avatarProps.userName} 
                            className="w-12 h-12 rounded-full hover:scale-110 transition-transform object-cover border-2 border-gray-200 flex-shrink-0"
                            onLoad={() => {
                              console.log('✅ Custom avatar loaded:', avatarProps.avatarUrl);
                            }}
                            onError={(e) => {
                              console.log('❌ Custom avatar failed, trying placeholder');
                              // Switch to placeholder on error
                              e.target.src = avatarProps.placeholderUrl;
                              e.target.onError = (e2) => {
                                console.log('❌ Placeholder also failed, using initials');
                                // Hide image and show initials fallback
                                e2.target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = avatarProps.fallbackProps.className;
                                fallback.style.backgroundColor = avatarProps.fallbackProps.style.backgroundColor;
                                fallback.textContent = avatarProps.fallbackProps.children;
                                fallback.title = `Avatar failed for ${avatarProps.userName}`;
                                e2.target.parentNode.insertBefore(fallback, e2.target);
                              };
                            }}
                          />
                        );
                      } else {
                        // Use placeholder avatar service for users without custom avatars
                        console.log('Showing placeholder avatar:', avatarProps.placeholderUrl);
                        return (
                          <img 
                            src={avatarProps.placeholderUrl}
                            alt={avatarProps.userName} 
                            className="w-12 h-12 rounded-full hover:scale-110 transition-transform object-cover border-2 border-gray-200 flex-shrink-0"
                            onLoad={() => {
                              console.log('✅ Placeholder avatar loaded for:', avatarProps.userName);
                            }}
                            onError={(e) => {
                              console.log('❌ Placeholder failed, using initials for:', avatarProps.userName);
                              // Hide image and show initials fallback
                              e.target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = avatarProps.fallbackProps.className;
                              fallback.style.backgroundColor = avatarProps.fallbackProps.style.backgroundColor;
                              fallback.textContent = avatarProps.fallbackProps.children;
                              fallback.title = `Generated avatar for ${avatarProps.userName}`;
                              e.target.parentNode.insertBefore(fallback, e.target);
                            }}
                          />
                        );
                      }
                    })()}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{skill.user?.name || 'Unknown User'}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{skill.user?.rating?.average?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-500">({skill.user?.rating?.count || 0})</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">{skill.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{skill.offering?.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skill.tags.map((tag, i) => (
                      <span key={i} className="tag-item px-3 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{skill.offering?.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>Online</span>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <Trophy size={16} />
                      <span>{skill.offering?.level}</span>
                    </div> */}
                  </div>

                  {/* Difficulty Level Badge */}
                  <div className="mt-3">
                    <span 
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        skill.offering?.level === 'Beginner' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : skill.offering?.level === 'Intermediate' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : skill.offering?.level === 'Advanced'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : skill.offering?.level === 'Expert'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      {skill.offering?.level || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end mb-4">
                    <span className={`text-lg font-bold ${skill.offering?.price === 0 ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {skill.offering?.price === 0 ? 'Free' : `${formatINR(skill.offering?.price)}/hr`}
                    </span>
                  </div>

                  {/* Book Button */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const ownerId = skill.user?._id || skill.user?.id;
                      const isOwnSkill = currentUserId && ownerId && ownerId.toString() === currentUserId.toString();
                      if (isOwnSkill) {
                        return (
                          <button
                            type="button"
                            disabled
                            title="You can't book a session for your own skill"
                            className="flex-1 text-center py-3 rounded-lg font-semibold cursor-not-allowed px-28 bg-gray-200 text-gray-500 border border-gray-300"
                          >
                            Your Skill
                          </button>
                        );
                      }
                      return (
                        <Link 
                          to={`/book-session?skillId=${skill._id}&instructorId=${ownerId}&skillTitle=${encodeURIComponent(skill.name)}&instructorName=${encodeURIComponent(skill.user?.name || 'Unknown User')}`}
                          className="flex-1 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg cursor-pointer px-28"
                        >
                          Book Session
                        </Link>
                      );
                    })()}
                    
                    <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-400 transition-all cursor-pointer">
                      <UserPlus size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}

          {/* Load More Button */}
          {visibleSkills < filteredSkills.length && (
            <div className="text-center animate-fadeInUp">
              <button
                onClick={() => setVisibleSkills(prev => prev + 3)}
                className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all text-gray-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md cursor-pointer"
              >
                Load More Skills
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Skill Modal */}
      {showPostSkillModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Post a New Skill</h2>
              <button 
                onClick={() => {
                  setShowPostSkillModal(false);
                  setShowSkillsDropdown(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePostSkillSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={postSkillForm.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Master JavaScript Fundamentals"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={postSkillForm.description}
                  onChange={handleInputChange}
                  placeholder="e.g., This course covers the basics of Javascript..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill to Include <span className="text-red-500">*</span>
                </label>
                
                {/* Selected Skill Display */}
                {postSkillForm.skills && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                      {postSkillForm.skills}
                      <button
                        type="button"
                        onClick={() => setPostSkillForm(prev => ({ ...prev, skills: '' }))}
                        className="hover:bg-indigo-200 rounded-full p-0.5 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  </div>
                )}
                
                {/* Skills Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-left flex items-center justify-between cursor-pointer"
                  >
                    <span className={!postSkillForm.skills ? "text-gray-400" : "text-gray-900"}>
                      {!postSkillForm.skills 
                        ? "Select a skill to include..." 
                        : postSkillForm.skills
                      }
                    </span>
                    <ChevronDown size={20} className={`transform transition-transform ${
                      showSkillsDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Dropdown Options */}
                  {showSkillsDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {skillsLoading ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Loading skills...
                        </div>
                      ) : availableSkills.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          No skills available
                        </div>
                      ) : (
                        availableSkills.map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSkillSelect(skill)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                              postSkillForm.skills === skill ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                            }`}
                          >
                            <span>{skill}</span>
                            {postSkillForm.skills === skill && (
                              <span className="text-indigo-600">✓</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {/* Validation */}
                {!postSkillForm.skills && (
                  <p className="text-xs text-gray-500 mt-1">Please select a skill</p>
                )}
              </div>

              {/* Time per Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration <span className="text-red-500">*</span>
                </label>
                <select
                  name="timePerHour"
                  value={postSkillForm.timePerHour}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="">Select duration</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1.5 hours">1.5 hours</option>
                  <option value="2 hours">2 hours</option>
                  <option value="2.5 hours">2.5 hours</option>
                  <option value="3 hours">3 hours</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Optional)
                </label>
                <input
                  type="text"
                  name="price"
                  value={postSkillForm.price}
                  onChange={handleInputChange}
                  placeholder="e.g., ₹50/hr (leave empty for free)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostSkillModal(false);
                    setShowSkillsDropdown(false);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!postSkillForm.skills}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                    !postSkillForm.skills 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  Post Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Enhanced Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.7; 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .skill-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .skill-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Stagger animation for skill cards */
        .skill-card:nth-child(1) { animation-delay: 0.1s; }
        .skill-card:nth-child(2) { animation-delay: 0.2s; }
        .skill-card:nth-child(3) { animation-delay: 0.3s; }
        .skill-card:nth-child(4) { animation-delay: 0.4s; }
        .skill-card:nth-child(5) { animation-delay: 0.5s; }
        .skill-card:nth-child(6) { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}