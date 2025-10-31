import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CollabLearnLanding from './components/user/landingPage';
import LoginPage from './auth/login';
import SignupPage from './auth/signup';
import Dashboard from './components/user/dashboard';
import BrowseSkills from './components/user/browseSkills';
import CalendarPage from './components/user/calendar';
import CommunityPage from './components/user/community';
import Achievements from './components/user/Achievements';
import ProfilePage from './components/user/ProfilePage';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import MessagesPage from './components/user/Messages';
import PostPage from './components/user/PostPage';
import BookingSessionPage from './components/user/bookSession';
import SettingsPage from './components/user/settingsPage';
import ManageUsers from './components/admin/manageUser';
import ManagePosts from './components/admin/ManagePosts';
import AnalyticsDashboard from './components/admin/Analytics';
import AdminSettings from './components/admin/AdminSettings';
import SkillRecommendations from './components/user/SkillRecommandation';
import VideoCall from './components/user/Videocall';
import SkillSessions from './components/user/SkillSessions';
import GetPremium from './components/user/GetPremium';
import GooglePayExample from './components/user/GooglePayExample';

function App() {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<CollabLearnLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/browse-skills" element={<ProtectedRoute><BrowseSkills /></ProtectedRoute>} />
        <Route path="/skill-recommendations" element={<ProtectedRoute><SkillRecommendations /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage/></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/book-session" element={<ProtectedRoute><BookingSessionPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />      
        <Route path="/skill-sessions" element={<ProtectedRoute><SkillSessions /></ProtectedRoute>} />
        <Route path="/video-call" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        <Route path="/video-call/:roomID" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        <Route path="/admin/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />         
        <Route path="/admin/manage-posts" element={<ProtectedRoute><ManagePosts /></ProtectedRoute>} />            
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />            
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />            
  <Route path="/get-premium" element={<ProtectedRoute><GetPremium /></ProtectedRoute>} />
  <Route path="/payment" element={<ProtectedRoute><GooglePayExample /></ProtectedRoute>} />
        </Routes> 
      {/* <SettingsPage /> */}
    </div>
  );
}

export default App;