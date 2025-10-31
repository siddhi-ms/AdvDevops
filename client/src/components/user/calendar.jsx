import React, { useState, useMemo, useEffect } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    addDays, 
    addMonths, 
    subMonths, 
    isSameMonth, 
    isSameDay,
    isToday,
    addWeeks,
    subWeeks
} from 'date-fns';
import MainNavbar from '../../navbar/mainNavbar'; 

const CalendarPage = () => {
  // --- STATE MANAGEMENT ---
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the date currently centered/viewed
  const [currentView, setCurrentView] = useState('Month'); // 'Day', 'Week', or 'Month'
  const [bookingRequests, setBookingRequests] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  // --- DATA FETCHING ---
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
        console.error("User not authenticated");
        setLoadingRequests(false);
        return;
    }

    const fetchAllData = async () => {
        setLoadingRequests(true);
        try {
      const [instructorBookingsRes, studentBookingsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/booking/instructor/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/booking/student/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let instructorBookingsData = { success: false, bookings: [] };
      let studentBookingsData = { success: false, bookings: [] };

      if (instructorBookingsRes.ok) {
        try { instructorBookingsData = await instructorBookingsRes.json(); } catch (err) { console.error('Invalid JSON from instructor bookings response', err); }
      } else {
        console.error('Failed to fetch instructor bookings:', instructorBookingsRes.status);
      }

      if (studentBookingsRes.ok) {
        try { studentBookingsData = await studentBookingsRes.json(); } catch (err) { console.error('Invalid JSON from student bookings response', err); }
      } else {
        console.error('Failed to fetch student bookings:', studentBookingsRes.status);
      }

            let pending = [];
            let confirmed = [];

            if (instructorBookingsData.success) {
                pending = instructorBookingsData.bookings.filter(b => b.status === 'pending');
                const instructorConfirmed = instructorBookingsData.bookings
                    .filter(b => b.status === 'confirmed')
                    .map(b => ({ ...b, role: 'instructor' }));
                confirmed.push(...instructorConfirmed);
            }

            if (studentBookingsData.success) {
                const studentConfirmed = studentBookingsData.bookings
                    .filter(b => b.status === 'confirmed')
                    .map(b => ({ ...b, role: 'student' }));
                confirmed.push(...studentConfirmed);
            }
            
            const bookingsById = new Map();
            confirmed.forEach(booking => {
                if (bookingsById.has(booking._id)) {
                    const existingBooking = bookingsById.get(booking._id);
                    if (typeof booking.student === 'object') existingBooking.student = booking.student;
                    if (typeof booking.instructor === 'object') existingBooking.instructor = booking.instructor;
                    if (typeof booking.skill === 'object') existingBooking.skill = booking.skill;
                } else {
                    bookingsById.set(booking._id, { ...booking });
                }
            });
            const uniqueConfirmed = Array.from(bookingsById.values());

            setBookingRequests(pending);
            setScheduledSessions(uniqueConfirmed);

        } catch (error) {
            console.error("Error fetching booking data:", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    fetchAllData();
  }, []);

  // --- HANDLERS ---

  const handleBookingAction = async (bookingId, status) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No token found");
        return;
    }

    try {
    const response = await fetch(`http://localhost:5000/api/booking/${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

  let data = null;
  if (response.ok) {
      try { data = await response.json(); } catch (err) { console.error('Failed to parse booking update JSON', err); }
  } else {
      console.error('Failed booking update, status:', response.status);
  }

  if (data && data.success && data.booking) {
            if (status === 'confirmed') {
                const confirmedSession = bookingRequests.find(req => req._id === bookingId);
                if (confirmedSession) {
                    setScheduledSessions(prevSessions => [
                        ...prevSessions, 
                        { ...confirmedSession, status: 'confirmed', role: 'instructor' }
                    ]);
                }
            }
            setBookingRequests(prevRequests => prevRequests.filter(req => req._id !== bookingId));
            
            const feedbackMessage = status === 'confirmed' ? 'Request has been confirmed.' : 'Request has been cancelled.';
            setFeedback({ show: true, message: feedbackMessage, type: 'success' });
            setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 3000);
        } else {
            console.error("Failed to update booking:", data.message);
            setFeedback({ show: true, message: 'Failed to update request.', type: 'error' });
            setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 3000);
        }
    } catch (error) {
        console.error("Error updating booking:", error);
    }
  };

  const handlePrev = () => {
    if (currentView === 'Month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'Week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (currentView === 'Day') {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (currentView === 'Month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'Week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (currentView === 'Day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (event) => {
    setCurrentView(event.target.value);
    setCurrentDate(new Date()); // Reset date to today when changing view
  };

  // --- CALENDAR LOGIC (for Month View) ---

  const monthName = format(currentDate, 'MMMM yyyy');

  // Generate calendar days only for the Month view
  const monthCalendarDays = useMemo(() => {
    if (currentView !== 'Month') return [];
    
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 }); // Saturday end

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate, currentView]);

  const todaySessions = useMemo(() => 
    scheduledSessions.filter(session => isToday(new Date(session.date)))
  , [scheduledSessions]);

  const weekStats = useMemo(() => {
    const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
    const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 0 });

    const thisWeekSessions = scheduledSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfThisWeek && sessionDate <= endOfThisWeek;
    });

    const teachingCount = thisWeekSessions.filter(s => s.role === 'instructor').length;
    const learningCount = thisWeekSessions.filter(s => s.role === 'student').length;
    const totalHours = thisWeekSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const earnings = 0; // Placeholder for earnings calculation

    return { teachingCount, learningCount, totalHours, earnings };
  }, [scheduledSessions]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        
        <MainNavbar />
        
        {/* Main Calendar Content */}
        <main className="flex-1 p-6 bg-slate-50 pt-24">
          {feedback.show && (
            <div className={`${feedback.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded relative mb-4`} role="alert">
                <span className="block sm:inline">{feedback.message}</span>
            </div>
          )}
          
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Calendar</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Selector Button - MADE FUNCTIONAL */}
              <div className="relative">
                {/* <select 
                  value={currentView}
                  onChange={handleViewChange}
                  className="appearance-none border border-gray-300 rounded-lg py-2 px-4 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option>Day</option>
                    <option>Week</option>
                    <option>Month</option>
                </select> */}
                
              </div>
              
              {/* <button className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
                <span className="material-icons-outlined text-xl mr-1">&#x2B;</span> Filter
              </button> */}
              
              {/* Block Time Button (Sky-Themed) */}
              {/* <button className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200 font-semibold">
                <span className="material-icons-outlined text-xl mr-2">&#x2B;</span> Block Time
              </button> */}
            </div>
          </div>

          {/* Main Grid: Calendar and Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Column: Calendar View (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                {/* Dynamic Month/View Title */}
                <h3 className="text-xl font-semibold text-gray-800">
                  {currentView === 'Month' 
                    ? monthName
                    : currentView === 'Week'
                    ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM do')}`
                    : format(currentDate, 'EEEE, MMM do, yyyy')
                  }
                </h3>

                {/* Navigation Buttons - MADE FUNCTIONAL */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handlePrev}
                    className="text-gray-500 hover:text-gray-800 border p-2 rounded-lg"
                  >
                    &#x2039;
                  </button>
                  <button 
                    onClick={handleToday}
                    className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Today
                  </button>
                  <button 
                    onClick={handleNext}
                    className="text-gray-500 hover:text-gray-800 border p-2 rounded-lg"
                  >
                    &#x203A;
                  </button>
                </div>
              </div>

              {/* Dynamic Calendar Content */}
              {currentView === 'Month' ? (
                // --- MONTH VIEW GRID ---
                <div className="grid grid-cols-7 text-center border border-gray-200">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-sm font-semibold text-gray-500 border-b border-gray-200">
                      {day}
                    </div>
                  ))}
                  
                  {/* Days */}
                  {monthCalendarDays.map((day, index) => {
                    const daySessions = scheduledSessions.filter(session => 
                        isSameDay(new Date(session.date), day)
                    );

                    return (
                        <div 
                          key={index} 
                          className={`h-32 p-1 border-b border-r border-gray-200 ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : 'bg-white'} transition-colors duration-300 hover:bg-gray-100`}
                        >
                          <div className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full 
                            ${isToday(day) ? 'bg-indigo-600 text-white' : 'text-gray-700'} 
                            ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}
                          `}>
                            {format(day, 'd')}
                          </div>
                          
                          <div className="mt-1 space-y-1 overflow-y-auto h-20">
                            {daySessions.map(session => {
                              console.log('Session skill:', session.skill);
                              const skillName = session.skill?.name || 'Unknown Skill';
                              const studentName = session.student?.name || 'Unknown Student';
                              const instructorName = session.instructor?.name || 'Unknown Instructor';
                              const partnerName = session.role === 'instructor' ? studentName : instructorName;
                              
                              return (
                                <div 
                                    key={session._id}
                                    className={`p-1.5 rounded-lg text-xs text-white shadow-sm ${session.role === 'instructor' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} cursor-pointer`}
                                    title={`${skillName} with ${partnerName} at ${format(new Date(session.date), 'p')}`}
                                >
                                    <p className="font-bold truncate">{skillName}</p>
                                    <p className="truncate">{format(new Date(session.date), 'p')} - {partnerName}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                    );
                  })}
                </div>
              ) : (
                // --- DAY / WEEK VIEW PLACEHOLDER ---
                <div className="text-center py-20 text-gray-500 border border-gray-200 rounded-lg h-96 flex items-center justify-center">
                    <p className="text-lg">
                        {currentView} View is currently displaying: <br />
                        <span className="font-semibold text-gray-700">{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>. 
                        Detailed Day/Week grid implementation goes here.
                    </p>
                </div>
              )}
            </div>

            {/* Right Column: Sessions and Requests */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Today's Sessions Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Sessions</h3>
                {todaySessions.length > 0 ? (
                    <div className="space-y-3">
                        {todaySessions.map(session => {
                          const skillName = session.skill?.name || 'Unknown Skill';
                          const studentName = session.student?.name || 'Unknown Student';
                          const instructorName = session.instructor?.name || 'Unknown Instructor';
                          const partnerName = session.role === 'instructor' ? studentName : instructorName;
                          
                          return (
                            <div key={session._id} className={`p-2 rounded-lg text-white ${session.role === 'instructor' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                <p className="font-bold text-sm truncate">{skillName}</p>
                                <p className="text-xs truncate">
                                    {format(new Date(session.date), 'p')} with {partnerName}
                                </p>
                            </div>
                          );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No sessions scheduled for today.</p>
                )}
              </div>

              {/* Booking Requests Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking Requests</h3>
                {loadingRequests ? (
                  <p className="text-sm text-gray-500">Loading requests...</p>
                ) : bookingRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">You have no pending booking requests.</p>
                ) : (
                  bookingRequests.map((request, index) => {
                    const studentName = request.student?.name || 'Unknown Student';
                    console.log('Request skill:', request.skill);
                    const skillName = request.skill?.name || 'Unknown Skill';
                    const studentId = request.student?._id || 'default';
                    
                    return (
                    <div key={request._id} className="border-b border-gray-200 last:border-b-0 pb-4 mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <img src={`https://i.pravatar.cc/32?u=${studentId}`} alt={studentName} className="h-8 w-8 rounded-full" />
                        <div>
                          <p className="font-semibold text-gray-800">{studentName}</p>
                          <p className="text-xs text-indigo-600">{skillName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {format(new Date(request.date), 'MMM d, yyyy')} at {format(new Date(request.date), 'p')}<br />
                        <span className="text-xs text-gray-500">Duration: {request.duration} minutes</span>
                      </p>
                      {request.notes && (
                        <p className="text-xs italic text-gray-500 mb-3">"{request.notes}"</p>
                      )}
                      <div className="flex justify-between space-x-2">
                        <button 
                          onClick={() => handleBookingAction(request._id, 'confirmed')}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200 text-sm font-medium">
                          Accept
                        </button>
                        <button 
                          onClick={() => handleBookingAction(request._id, 'cancelled')}
                          className="flex-1 px-3 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
                          Decline
                        </button>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
              
              {/* This Week Stats Card */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">This Week</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Teaching sessions</span>
                    <span className="font-semibold">{weekStats.teachingCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Learning sessions</span>
                    <span className="font-semibold">{weekStats.learningCount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span>Total hours</span>
                    <span className="font-semibold">{weekStats.totalHours.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-600 font-bold pt-2 border-t border-gray-200">
                    {/* <span>Earnings</span> */}
                    {/* <span>${weekStats.earnings.toFixed(2)}</span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
