import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Star, Users, Trophy, BookOpen, Clock, MessageSquare, Settings, Lock } from 'lucide-react';
import MainNavbar from '../../navbar/mainNavbar';

// Lazy load the StudentInfoModal for better initial load performance
const StudentInfoModal = lazy(() => import('./StudentInfoModal'));

const Dashboard = React.memo(() => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const navigate = useNavigate();

  // Memoize the token to avoid getting it on every render
  const token = useMemo(() => localStorage.getItem('token'), []);

  // In-memory cache as fallback if storage fails
  const memoryCache = useMemo(() => ({ data: null, timestamp: null }), []);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setError('Please login to view dashboard');
      setLoading(false);
    }
  }, [token]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear memory cache on unmount
      if (memoryCache) {
        memoryCache.data = null;
        memoryCache.timestamp = null;
      }
    };
  }, [memoryCache]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check sessionStorage cache first (lasts for browser session, larger quota)
      const cacheKey = 'dashboard_data';
      const cacheTimestampKey = 'dashboard_timestamp';

      try {
        // Try sessionStorage first
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTimestamp = sessionStorage.getItem(cacheTimestampKey);

        if (cached && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < 2 * 60 * 1000) { // 2 minutes for faster refresh
            setDashboardData(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        // Fall back to memory cache
        if (memoryCache.data && memoryCache.timestamp) {
          const age = Date.now() - memoryCache.timestamp;
          if (age < 1 * 60 * 1000) { // 1 minute for memory cache
            setDashboardData(memoryCache.data);
            setLoading(false);
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Cache read failed:', cacheError);
        // Clear potentially corrupted cache
        try {
          sessionStorage.removeItem(cacheKey);
          sessionStorage.removeItem(cacheTimestampKey);
        } catch (clearError) {
          console.error('Failed to clear cache:', clearError);
        }
      }

      // Fetch fresh data with optimized single API call
      const dashboardResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!dashboardResponse.ok) {
        const errorText = await dashboardResponse.text();
        console.error('Dashboard API error:', errorText);
        throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
      }

      const dashboardData = await dashboardResponse.json();

      if (dashboardData.success) {
        // Set the consolidated dashboard data
        setDashboardData(dashboardData.data);

        // Cache optimized data (only essential info to reduce size)
        const optimizedCache = {
          user: {
            id: dashboardData.data.user?.id,
            name: dashboardData.data.user?.name,
            email: dashboardData.data.user?.email,
            avatar: dashboardData.data.user?.avatar,
            isPremium: !!dashboardData.data.user?.isPremium
          },
          stats: dashboardData.data.stats,
          skills: {
            teaching: dashboardData.data.skills?.teaching?.slice(0, 10) || [], // Limit to 10 most recent
            learning: dashboardData.data.skills?.learning?.slice(0, 10) || []
          },
          upcomingBookings: {
            teaching: dashboardData.data.upcomingBookings?.teaching?.slice(0, 5) || [], // Limit to 5 most recent
            learning: dashboardData.data.upcomingBookings?.learning?.slice(0, 5) || []
          }
        };

        // Always store in memory cache
        memoryCache.data = optimizedCache;
        memoryCache.timestamp = Date.now();

        // Try to store in sessionStorage
        try {
          const cacheString = JSON.stringify(optimizedCache);
          // Check if the data size is reasonable (< 1MB)
          if (cacheString.length < 1024 * 1024) {
            sessionStorage.setItem(cacheKey, cacheString);
            sessionStorage.setItem(cacheTimestampKey, Date.now().toString());
          }
        } catch (storageError) {
          console.warn('Failed to cache dashboard data in sessionStorage:', storageError);
        }
      } else {
        throw new Error(dashboardData.message || 'Failed to fetch dashboard data');
      }

    } catch (err) {
      console.error('Dashboard error:', err);

      // Fallback to individual API calls if dashboard endpoint fails
      try {
        await fetchFallbackData(token);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchFallbackData = async (token) => {
    // Fetch user profile
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    // setUser may be defined elsewhere in your app; keep as-is if available

    // Fetch user's skills
    try {
      const skillsResponse = await fetch('http://localhost:5000/api/skills/my-skills', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        // setTeachingSkills/setLearningSkills may be defined elsewhere in your app
      }
    } catch (skillsErr) {
      console.error('Skills fetch error:', skillsErr);
    }

    // Additional fallback calls omitted for brevity
  };

  // Memoize derived data to prevent unnecessary re-calculations
  const derivedData = useMemo(() => {
    if (!dashboardData) return null;

    const teachingSkills = dashboardData.skills?.teaching || [];
    const learningSkills = dashboardData.skills?.learning || [];
    const upcomingBookings = dashboardData.upcomingBookings?.teaching || [];
    const studentBookings = dashboardData.upcomingBookings?.learning || [];

    return {
      user: dashboardData.user,
      teachingSkills,
      learningSkills,
      upcomingBookings,
      studentBookings,
      stats: dashboardData.stats || {},
      // Pre-compute commonly used values
      hasTeachingSkills: teachingSkills.length > 0,
      hasLearningSkills: learningSkills.length > 0,
      hasUpcomingSessions: upcomingBookings.length > 0 || studentBookings.length > 0,
      allUpcomingSessions: [...upcomingBookings, ...studentBookings].sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  }, [dashboardData]);

  // Whether current user can join meetings (premium users only)
  // Coerce to boolean to avoid undefined/truthy issues from cached data
  const allowJoin = !!derivedData?.user?.isPremium;

  const handleViewStudentProgress = useCallback((student, skill) => {
    setSelectedStudent(student);
    setSelectedSkill(skill);
    setShowStudentModal(true);
  }, []);

  const handleMessageStudent = useCallback((student) => {
    navigate('/messages', { state: { startChat: student } });
    setShowStudentModal(false);
  }, [navigate]);

  const handleScheduleSession = useCallback(() => {
    navigate('/book-session');
  }, [navigate]);

  const handleManageAllSkills = useCallback(() => {
    navigate('/browse-skills');
  }, [navigate]);

  const handleFindSkills = useCallback(() => {
    navigate('/browse-skills');
  }, [navigate]);

  const handleAddTeachingSkill = useCallback(() => {
    navigate('/browse-skills');
  }, [navigate]);

  const handleExploreSkillsToLearn = () => {
    navigate('/browse-skills');
  };

  const handleViewAllSessions = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  const handleSetAvailability = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  const handleMessageCenter = useCallback(() => {
    navigate('/messages');
  }, [navigate]);

  const handleBookSession = useCallback((skill) => {
    const user = derivedData?.user;
    if (user && skill) {
      navigate(`/book-session?skillId=${skill._id}&instructorId=${user.id}&skillTitle=${encodeURIComponent(skill.name)}&instructorName=${encodeURIComponent(user.name)}`);
    }
  }, [navigate, derivedData?.user]);

  const handleViewMoreInfo = useCallback((skill) => {
    if (!skill || !skill._id) {
      console.error('Invalid skill data:', skill);
      return;
    }
    navigate('/skill-sessions', { state: { skill } });
  }, [navigate]);

  const handleEditSkill = useCallback((skill) => {
    navigate('/browse-skills', { state: { editSkill: skill } });
  }, [navigate]);

  const handleViewStudents = useCallback((skill) => {
    navigate('/calendar', { state: { filterBySkill: skill.name } });
  }, [navigate]);

  const handleViewSkillDetails = useCallback((skill) => {
    navigate('/browse-skills', { state: { viewSkill: skill } });
  }, [navigate]);

  const handleCalendar = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  const handleMessages = useCallback(() => {
    navigate('/messages');
  }, [navigate]);

  // Memoized utility functions
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today @ ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow @ ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }, []);

  const getProgressColor = useCallback((progress) => {
    // Use indigo accents to match browseSkills styling
    if (progress >= 80) return 'bg-indigo-500';
    if (progress >= 50) return 'bg-indigo-400';
    if (progress >= 25) return 'bg-indigo-300';
    return 'bg-gray-300';
  }, []);

  const getSkillInitials = useCallback((skillName) => {
    return skillName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!derivedData) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="flex h-screen bg-gray-100 font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        
        {/* Top Navbar Component */}
        <MainNavbar />
        
        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 bg-gray-100 pt-24">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {derivedData?.user?.name || 'Guest'}!
              </h1>

            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="text-2xl font-bold text-indigo-600">{derivedData?.teachingSkills.length || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Teaching</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center space-x-2 mb-1">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span className="text-2xl font-bold text-indigo-600">{derivedData?.learningSkills.length || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Learning</p>
                  </div>
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="text-gray-600 text-sm">
                  {(derivedData?.upcomingBookings.length > 0) || (derivedData?.studentBookings.length > 0)
                    ? `${derivedData?.upcomingBookings.length || 0} teaching session${(derivedData?.upcomingBookings.length || 0) !== 1 ? 's' : ''} • ${derivedData?.studentBookings.length || 0} learning session${(derivedData?.studentBookings.length || 0) !== 1 ? 's' : ''} upcoming`
                    : 'No upcoming sessions - Schedule your next session!'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Grid for two main sections: Upcoming/Skills and Learning Progress/Activity/Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Upcoming Sessions & Skills I'm Teaching) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Upcoming Sessions Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2" /> Upcoming Sessions
                  </h3>
                  <button 
                    onClick={handleCalendar}
                    className="text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {derivedData.allUpcomingSessions
                  .slice(0, 5)
                  .map((booking, index) => {
                    const isTeaching = derivedData.upcomingBookings.includes(booking);
                    const otherUser = isTeaching ? booking.student : booking.instructor;
                    
                      return (
                      <div key={booking._id || index} className={`flex items-center justify-between py-4 px-4 rounded-lg mb-3 border-l-4 ${
                        isTeaching 
                          ? 'bg-indigo-50 border-indigo-600' 
                          : 'bg-purple-50 border-purple-500'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg ${
                            isTeaching ? 'bg-indigo-600' : 'bg-purple-600'
                          }`}>
                            {getSkillInitials(booking.skill?.name || 'SK')}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-gray-800 text-lg">{booking.skill?.name || 'Unknown Skill'}</p>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                isTeaching 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {isTeaching ? 'Teaching' : 'Learning'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                              {isTeaching ? `Teaching ${otherUser?.name || 'Unknown Student'}` : `Learning with ${otherUser?.name || 'Unknown Instructor'}`}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(booking.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative group">
                            <button
                              onClick={() => { if (!allowJoin) return; navigate('/video-call', { state: { userName: derivedData?.user?.name } }); }}
                              disabled={!allowJoin}
                              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                                isTeaching 
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              } ${!allowJoin ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              Join
                            </button>
                            {!allowJoin && (
                              <div className="absolute right-0 -top-12 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                <div className="flex items-center space-x-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-md shadow-lg">
                                  <Lock className="w-5 h-5" />
                                  <span>Need Premium to use this feature</span>
                                </div>
                                <div className="w-3 h-3 bg-gray-900 transform rotate-45 -mt-1 mr-3"></div>
                              </div>
                            )}
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <span className="text-lg">⋮</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                }

                {derivedData.upcomingBookings.length === 0 && derivedData.studentBookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No upcoming sessions scheduled</p>
                    <p className="text-sm mt-2">Book a session to get started!</p>
                  </div>
                )}
              </div>

              {/* Skills I'm Teaching Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-3">
                      <Users className="w-5 h-5" />
                    </div>
                    Skills I'm Teaching
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full">
                      {derivedData.teachingSkills.length} active
                    </span>
                  </h3>
                  <button className="text-indigo-600 text-sm font-semibold hover:underline">
                    Manage All
                  </button>
                </div>
                
                {derivedData.teachingSkills.length > 0 ? (
                  <div className="space-y-3">
                    {derivedData.teachingSkills.map((skill, index) => (
                      <div key={skill._id || index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition duration-150">
                        <div className="flex items-center space-x-4">
                          <div className="bg-indigo-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg">
                            {getSkillInitials(skill.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">{skill.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                Level: {skill.offering?.level || 'Not specified'}
                              </span>
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-1"></span>
                                {skill.offering?.sessions || 0} sessions completed
                              </span>
                              <span className="flex items-center">
                                <span className="text-yellow-500 mr-1">⭐</span>
                                {skill.offering?.rating?.toFixed(1) || '0.0'} rating
                              </span>
                            </div>
                            {skill.offering?.price && (
                              <p className="text-sm text-blue-600 font-medium">
                                ${skill.offering.price}/hour
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => handleViewMoreInfo(skill)}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200"
                          >
                            View More Info
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-2">You're not teaching any skills yet</p>
                    <p className="text-gray-500 text-sm mb-4">Share your expertise and start earning by teaching others!</p>
                    <button 
                      onClick={handleAddTeachingSkill}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors"
                    >
                      Add Your First Teaching Skill
                    </button>
                  </div>
                )}
              </div>

              {/* Students I'm Teaching */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                  <Users className="w-5 h-5 text-gray-500 mr-2" /> My Students
                </h3>
                
                {derivedData.upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {derivedData.upcomingBookings.slice(0, 4).map((booking, index) => {
                      const progressPercentage = Math.floor(Math.random() * 80) + 20; // Mock progress for now
                      
                      return (
                        <div key={booking._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-full h-12 w-12 flex items-center justify-center font-semibold text-lg">
                                      {booking.student?.name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{booking.student?.name || 'Unknown Student'}</p>
                              <p className="text-sm text-gray-600">{booking.skill?.name || 'Unknown Skill'}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{progressPercentage}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewStudentProgress(booking.student, booking.skill)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              View Progress
                            </button>
                            <button 
                              onClick={() => handleMessageStudent(booking.student)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No students yet</p>
                    <p className="text-sm mt-2">Start teaching to connect with students!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Learning Progress, Recent Activity, Quick Actions) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Skills I'm Learning Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-3">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    Skills I'm Learning
                    <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full">
                      {derivedData.learningSkills.length} in progress
                    </span>
                  </h3>
                </div>
                
                {derivedData.learningSkills.length > 0 ? (
                  <div className="space-y-4">
                    {derivedData.learningSkills.map((skill, index) => (
                      <div key={skill._id || index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                              {getSkillInitials(skill.name)}
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold text-lg">{skill.name}</p>
                              <p className="text-sm text-gray-600">
                                {skill.seeking?.currentInstructor 
                                  ? `Learning with ${skill.seeking.currentInstructor.name}`
                                  : 'Looking for an instructor'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-gray-500">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                              Currently learning this skill
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="bg-sky-100 text-sky-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-2">No learning goals set</p>
                    <p className="text-gray-500 text-sm">Discover new skills and connect with expert instructors!</p>
                  </div>
                )}
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                  <Clock className="w-5 h-5 text-gray-500 mr-2" /> Recent Activity
                </h3>
                
                {/* Mock Recent Activities - In real implementation, fetch from database */}
                <div className="space-y-3">
                  {derivedData.upcomingBookings.slice(0, 3).map((booking, index) => (
                    <div key={booking._id || index} className="flex items-start">
                      <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <Users className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-gray-700">
                          Teaching session: <span className="font-semibold">{booking.skill?.name || 'Unknown Skill'}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {derivedData.studentBookings.slice(0, 2).map((booking, index) => (
                    <div key={`student-${booking._id || index}`} className="flex items-start">
                      <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <BookOpen className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-gray-700">
                          Learning session: <span className="font-semibold">{booking.skill?.name || 'Unknown Skill'}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {derivedData.upcomingBookings.length === 0 && derivedData.studentBookings.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Student Info Modal */}
      {showStudentModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading student details...</p>
            </div>
          </div>
        }>
          <StudentInfoModal
            student={selectedStudent}
            skill={selectedSkill}
            onClose={() => {
              setShowStudentModal(false);
              setSelectedStudent(null);
              setSelectedSkill(null);
            }}
            onMessage={handleMessageStudent}
          />
        </Suspense>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
