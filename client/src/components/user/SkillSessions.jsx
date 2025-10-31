import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Star, 
  Award, 
  CheckCircle, 
  User,
  Upload,
  FileText,
  Download,
  Trash2,
  MessageCircle,
  Plus,
  X
} from 'lucide-react';
import MainNavbar from '../../navbar/mainNavbar';
import { formatINR } from '../../utils/currencyUtils';

const SkillSessions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { skill } = location.state || {};
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [instructorInfo, setInstructorInfo] = useState(null);
  const [showFinishCourseModal, setShowFinishCourseModal] = useState(false);
  const [courseRating, setCourseRating] = useState(5);
  const [courseReview, setCourseReview] = useState('');
  
  // Skill-level document upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [skillDocuments, setSkillDocuments] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!skill || !skill._id) {
      console.error('Invalid skill data received:', skill);
      setError('Invalid skill data. Please try again from the dashboard.');
      setLoading(false);
      return;
    }
    fetchSessions();
  }, [skill]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      setCurrentUser(userData.user);
      
      // Determine user role for this skill by checking if user appears as instructor in any session
      // Try both endpoints to determine role
      const instructorResponse = await fetch(`http://localhost:5000/api/booking/instructor/${userData.user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const studentResponse = await fetch(`http://localhost:5000/api/booking/student/${userData.user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let role = 'student'; // default
      let allSessions = [];
      let instructor = null;
      
      if (instructorResponse.ok) {
        const instructorData = await instructorResponse.json();
        const instructorSessions = instructorData.bookings?.filter(
          booking => booking && booking.skill && booking.skill._id === skill._id
        ) || [];
        
        if (instructorSessions.length > 0) {
          role = 'instructor';
          allSessions = instructorSessions;
        }
      }
      
      if (allSessions.length === 0 && studentResponse.ok) {
        const studentData = await studentResponse.json();
        const studentSessions = studentData.bookings?.filter(
          booking => booking && booking.skill && booking.skill._id === skill._id
        ) || [];
        
        if (studentSessions.length > 0) {
          role = 'student';
          allSessions = studentSessions;
          // Get instructor info from the first session
          if (studentSessions[0] && studentSessions[0].instructor) {
            instructor = studentSessions[0].instructor;
          }
        }
      }
      
      setUserRole(role);
      setSessions(allSessions);
      setInstructorInfo(instructor);
      
      // Get skill-level documents from the first session (they're shared across all sessions for this skill)
      if (allSessions.length > 0 && allSessions[0].sessionDocuments) {
        setSkillDocuments(allSessions[0].sessionDocuments);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    return sessions.filter(session => {
      if (activeTab === 'ongoing') {
        return true; // Show all sessions
      } else if (activeTab === 'completed') {
        return true; // Show all sessions (for progress view)
      }
      return true;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUploadSkillDocument = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDocumentTitle(file.name.split('.').slice(0, -1).join('.'));
    }
  };

  const uploadSkillDocument = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    if (sessions.length === 0) {
      setError('No sessions available to upload documents to');
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('title', documentTitle.trim());
    formData.append('uploadedBy', userRole);

    try {
      // Upload to the first session (skill-level documents)
      const response = await fetch(`http://localhost:5000/api/booking/${sessions[0]._id}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSkillDocuments(result.sessionDocuments);
        setShowUploadModal(false);
        setSelectedFile(null);
        setDocumentTitle('');
        fetchSessions(); // Refresh sessions
        alert('Skill resource uploaded successfully!');
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (err) {
      setError('Failed to upload document: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const deleteSkillDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this skill resource?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/booking/${sessions[0]._id}/delete-document/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSkillDocuments(result.sessionDocuments);
        fetchSessions(); // Refresh sessions
        alert('Skill resource deleted successfully!');
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (err) {
      setError('Failed to delete document: ' + err.message);
    }
  };

  const downloadDocument = (document) => {
    const downloadUrl = `http://localhost:5000/uploads/sessions/${document.filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = document.title || document.filename;
    link.click();
  };

  const getFileIcon = (filename) => {
    const extension = filename?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'mov':
      case 'avi': return '🎥';
      default: return '📎';
    }
  };

  const handleFinishCourse = () => {
    setShowFinishCourseModal(true);
  };

  const submitCourseRating = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/booking/complete-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillId: skill._id,
          userId: currentUser.id,
          rating: courseRating,
          review: courseReview
        })
      });

      if (response.ok) {
        setShowFinishCourseModal(false);
        alert('Course completed successfully! Thank you for your feedback.');
        fetchSessions(); // Refresh sessions
      } else {
        throw new Error('Failed to complete course');
      }
    } catch (err) {
      setError('Failed to complete course');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredSessions = getFilteredSessions();

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="flex-1 flex flex-col overflow-auto">
        <MainNavbar />
        
        <main className="flex-1 p-6 bg-gray-100 pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {skill?.name} Sessions
                </h1>
                <p className="text-gray-600">
                  {userRole === 'instructor' 
                    ? 'Manage your teaching sessions and course materials for this skill' 
                    : instructorInfo 
                      ? `Learning from ${instructorInfo.name}`
                      : 'Learning sessions for this skill'
                  }
                </p>
              </div>
            </div>

            {/* Skill Info Card */}
            <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 mb-6 ${
              userRole === 'instructor' ? 'border-indigo-600' : 'border-purple-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`text-white rounded-full h-16 w-16 flex items-center justify-center font-bold text-xl ${
                    userRole === 'instructor' ? 'bg-indigo-600' : 'bg-purple-600'
                  }`}>
                    {skill?.name?.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{skill?.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          userRole === 'instructor' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></span>
                        {userRole === 'instructor' ? 'Teaching' : 'Learning'} 
                        {userRole === 'student' && instructorInfo && 
                          ` from ${instructorInfo.name}`
                        }
                        {userRole === 'instructor' && sessions.length > 0 && sessions[0].student &&
                          ` with ${sessions[0].student.name}`
                        }
                      </span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        {sessions.length} total sessions
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {skill?.offering?.rating?.toFixed(1) || '0.0'} rating
                      </span>
                    </div>
                    {/* Show instructor info prominently for students */}
                    {userRole === 'student' && instructorInfo && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <div className="bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm">
                            {instructorInfo.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-800">Your Instructor</p>
                            <p className="text-sm text-purple-600">{instructorInfo.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {userRole === 'instructor' 
                        ? `${formatINR(skill?.offering?.price || 0)}/hr` 
                        : `${sessions.filter(s => s.status === 'completed').length}/${sessions.length}`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {userRole === 'instructor' ? 'Rate' : 'Progress'}
                    </p>
                  </div>
                  
                  {/* Skill-level Action Buttons - Available to Both Roles */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleUploadSkillDocument}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Resource</span>
                    </button>
                    
                    {/* Finish Course Button for Both Roles */}
                    <button
                      onClick={handleFinishCourse}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>
                        {userRole === 'instructor' ? 'Mark Complete' : 'Finish Course'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('ongoing')}
                  className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'ongoing'
                      ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>All Sessions</span>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {sessions.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Course Progress</span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) || 0}%
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Skill Resources Section */}
          {skillDocuments.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                  Course Resources ({skillDocuments.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillDocuments.map((doc, index) => (
                    <div 
                      key={doc._id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {getFileIcon(doc.filename)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-800 truncate" title={doc.title}>
                              {doc.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                              <span>Uploaded by {doc.uploadedBy}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {doc.filename?.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteSkillDocument(doc._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, index) => {
                if (!session || !session.student || !session.skill) {
                  return null;
                }
                
                const otherParticipant = userRole === 'instructor' ? session.student : session.instructor;
                
                return (
                <div 
                  key={session._id || index} 
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:border-indigo-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`text-white rounded-full h-12 w-12 flex items-center justify-center font-semibold text-lg ${
                        userRole === 'instructor' 
                          ? 'bg-gradient-to-r from-indigo-400 to-purple-400' 
                          : 'bg-gradient-to-r from-purple-400 to-pink-400'
                      }`}>
                        {otherParticipant?.name?.charAt(0).toUpperCase() || (userRole === 'instructor' ? 'S' : 'T')}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {userRole === 'instructor' 
                            ? `Session with ${otherParticipant?.name || 'Unknown Student'}`
                            : `Learning from ${otherParticipant?.name || 'Unknown Instructor'}`
                          }
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(session.date)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {session.duration} minutes
                          </span>
                          {session.sessionCount && (
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              Session {session.sessionCount.current || 1} of {session.sessionCount.total || 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'ongoing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status?.charAt(0).toUpperCase() + session.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <div className="bg-gray-100 text-gray-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No sessions found
                </h3>
                <p className="text-gray-600">
                  You don't have any sessions for this skill yet.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Fixed Finish Course Button at Bottom - Visible for Both Roles */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleFinishCourse}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 text-base font-semibold border-2 border-green-400"
        >
          <Award className="w-5 h-5" />
          <span>
            {userRole === 'instructor' ? 'Mark Course Complete' : 'Finish Course'}
          </span>
        </button>
        {/* Debug info */}
        <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded">
          Role: {userRole || 'loading...'}
        </div>
      </div>

      {/* Finish Course Modal - Available for Both Roles */}
      {showFinishCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {userRole === 'instructor' ? 'Mark Course as Complete' : 'Finish Course'}
            </h3>
            <p className="text-gray-600 mb-4">
              {userRole === 'instructor' 
                ? `You're about to mark the ${skill?.name} course as complete. Please provide your overall assessment of the teaching experience.`
                : `You're about to complete your learning journey for ${skill?.name}${instructorInfo ? ` with ${instructorInfo.name}` : ''}. Please rate your overall experience with this course.`
              }
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall {userRole === 'instructor' ? 'Teaching Experience' : 'Course'} Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCourseRating(star)}
                    className={`text-2xl ${
                      star <= courseRating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {userRole === 'instructor' ? 'Teaching Experience Review' : 'Course Review'} (Optional)
              </label>
              <textarea
                value={courseReview}
                onChange={(e) => setCourseReview(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
                placeholder={
                  userRole === 'instructor' 
                    ? "Share your experience teaching this course..."
                    : "Share your overall experience with this course..."
                }
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowFinishCourseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitCourseRating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {userRole === 'instructor' ? 'Mark Complete' : 'Complete Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Skill Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Upload Course Resource</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDocumentTitle('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Upload a resource for the entire {skill?.name} course. This will be accessible to all participants.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter resource title..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDocumentTitle('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadSkillDocument}
                disabled={!selectedFile || !documentTitle.trim() || uploadingFile}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploadingFile ? 'Uploading...' : 'Upload Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSessions;