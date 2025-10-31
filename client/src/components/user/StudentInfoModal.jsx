import React, { useState, useEffect } from 'react';

const StudentInfoModal = ({ student, skill, onClose, onMessage }) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      fetchStudentDetails();
    }
  }, [student]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !student?.id) {
        return;
      }

      // Fetch student details from API
      const response = await fetch(`http://localhost:5000/api/dashboard/student/${student.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudentDetails({
            ...data.data.student,
            ...data.data.stats,
            learningGoals: data.data.learningGoals,
            achievements: data.data.achievements
          });
          setSessions(data.data.sessionHistory);
        }
      } else {
        // Fallback to mock data if API fails
        setStudentDetails({
          ...student,
          joinDate: new Date(2024, 0, 15),
          totalSessions: Math.floor(Math.random() * 50) + 10,
          completedSessions: Math.floor(Math.random() * 30) + 5,
          averageRating: (Math.random() * 2 + 3).toFixed(1),
          currentStreak: Math.floor(Math.random() * 15) + 1,
          achievements: ['Quick Learner', 'Consistent Student', 'Problem Solver'],
          learningGoals: [
            { skill: skill?.name, progress: Math.floor(Math.random() * 80) + 20, target: 'Advanced' },
            { skill: 'Problem Solving', progress: Math.floor(Math.random() * 60) + 30, target: 'Expert' }
          ]
        });

        setSessions([
          { 
            id: 1, 
            date: new Date(2024, 9, 5), 
            skill: skill?.name, 
            duration: 60, 
            status: 'completed',
            rating: 5,
            notes: 'Great progress on advanced concepts'
          },
          { 
            id: 2, 
            date: new Date(2024, 9, 12), 
            skill: skill?.name, 
            duration: 90, 
            status: 'completed',
            rating: 4,
            notes: 'Worked on practical exercises'
          },
          { 
            id: 3, 
            date: new Date(2024, 9, 19), 
            skill: skill?.name, 
            duration: 60, 
            status: 'scheduled',
            notes: 'Next: Advanced project work'
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching student details:', error);
      // Fallback to mock data on error
      setStudentDetails({
        ...student,
        joinDate: new Date(2024, 0, 15),
        totalSessions: Math.floor(Math.random() * 50) + 10,
        completedSessions: Math.floor(Math.random() * 30) + 5,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        currentStreak: Math.floor(Math.random() * 15) + 1,
        achievements: ['Quick Learner', 'Consistent Student', 'Problem Solver'],
        learningGoals: [
          { skill: skill?.name, progress: Math.floor(Math.random() * 80) + 20, target: 'Advanced' },
          { skill: 'Problem Solving', progress: Math.floor(Math.random() * 60) + 30, target: 'Expert' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
  <div className="bg-gradient-to-r from-sky-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
                {student.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name || 'Unknown Student'}</h2>
                <p className="text-sky-100">Learning {skill?.name || 'Unknown Skill'}</p>
                <p className="text-sm text-sky-200">
                  Student since {studentDetails?.joinDate ? formatDate(studentDetails.joinDate) : 'Unknown'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student details...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{studentDetails?.totalSessions || 0}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{studentDetails?.completedSessions || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{studentDetails?.averageRating || '0.0'}</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{studentDetails?.currentStreak || 0}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Progress */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="material-icons-outlined text-xl mr-2">📊</span>
                  Learning Progress
                </h3>
                
                {studentDetails?.learningGoals?.map((goal, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-700">{goal.skill}</p>
                      <span className="text-sm text-gray-500">Target: {goal.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{goal.progress}% Complete</p>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="material-icons-outlined text-xl mr-2">🏆</span>
                  Achievements
                </h3>
                
                <div className="space-y-2">
                  {studentDetails?.achievements?.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="bg-yellow-100 text-yellow-600 rounded-full p-2">
                        <span className="text-lg">🏆</span>
                      </div>
                      <p className="font-medium text-gray-700">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Session History */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="material-icons-outlined text-xl mr-2">📅</span>
                Session History
              </h3>
              
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          session.status === 'completed' ? 'bg-green-500' : 
                          session.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-800">{session.skill}</p>
                          <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{session.duration} minutes</p>
                        {session.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span className="text-sm text-gray-600">{session.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-500 mt-2 pl-7">{session.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => onMessage && onMessage(student)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Send Message
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Schedule Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInfoModal;