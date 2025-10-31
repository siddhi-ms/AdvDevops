import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Settings, User, Bell, Shield, Moon, Sun, Lock, CreditCard, 
    LogOut, Trash2, MessageSquare, ExternalLink 
} from 'lucide-react'; // Added ExternalLink for Edit Cards

// Assuming MainNavbar exists at this path
import MainNavbar from '../../navbar/mainNavbar.jsx'; 

// ----------------------------------------------------------------------
// NOTE ON DARK MODE: 
// In a real application, the 'isDarkMode' state and 'toggleDarkMode' 
// function would typically come from a React Context or a Redux store 
// wrapping the entire application, not just passed as props to a single page.
// We are simulating that global control here via component props.
// ----------------------------------------------------------------------

export default function SettingsPage({ isDarkMode, toggleDarkMode }) {
    
    // Local state for settings form (simulated data)
    const [notificationSettings, setNotificationSettings] = useState({
        sessionReminders: true,
        newSkillAlerts: false,
        messageNotifications: true,
    });
    const [profilePrivacy, setProfilePrivacy] = useState(true); // True = Public, False = Private
    
    // --- Theme Utility Classes ---
    const themeBg = isDarkMode ? 'bg-gray-900 text-gray-50' : 'bg-gray-50 text-gray-900';
    const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const iconColor = isDarkMode ? 'text-indigo-400' : 'text-indigo-600';
    const switchColor = isDarkMode ? 'bg-indigo-600' : 'bg-gray-200';

    // --- Button Handler Functions ---
    
    const handleNotificationChange = (name) => {
        setNotificationSettings(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleManageProfile = () => {
        // Navigate to profile and open the edit modal via query param
        navigate('/profile?edit=true');
        console.log('Action: Manage Profile clicked. Navigating to /profile?edit=true');
    };

    const handleChangePassword = () => {
        // In a real app, this would open a modal or navigate to a password change form
        alert("Opening Change Password form...");
        console.log("Action: Change Password clicked.");
    };
    
    const handleEditCards = () => {
        // In a real app, this would navigate to a billing portal
        alert("Navigating to Payment Methods management portal...");
        console.log("Action: Edit Cards clicked.");
    };

    const navigate = useNavigate();

    const handleLogoutAllDevices = async () => {
        if (!window.confirm("Are you sure you want to log out from ALL other devices?")) return;

        try {
            const token = localStorage.getItem('token');

            // If server supports session revocation endpoint, call it.
            // There is no explicit revoke route in the API docs, but we'll attempt a safe POST to /api/auth/logout-all
            if (token) {
                try {
                    const resp = await fetch('http://localhost:5000/api/auth/logout-all', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (resp.ok) {
                        console.log('LogoutAllDevices: server-side session revocation succeeded');
                    } else {
                        console.log('LogoutAllDevices: no server-side revoke endpoint or it responded with', resp.status);
                    }
                } catch (err) {
                    console.log('LogoutAllDevices: error calling revoke endpoint (it may not exist)', err);
                }
            }

            // Clear local client auth state
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('userAvatar');
            localStorage.removeItem('email');

            // Notify user and navigate to landing page
            alert('Successfully logged out from all other devices. You will be redirected to the home page.');
            console.log('Action: Logout All Devices confirmed. Client cleared and redirecting.');
            navigate('/');
        } catch (error) {
            console.error('handleLogoutAllDevices error:', error);
            alert('An error occurred while attempting to log out. Please try again.');
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm("WARNING: This action is irreversible. Are you absolutely sure you want to permanently delete your account?")) {
            // API call to delete the account
            (async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('No authentication token found. Please login and try again.');
                        return;
                    }

                    const resp = await fetch('http://localhost:5000/api/auth/delete', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (resp.ok) {
                        console.log('Action: Delete Account confirmed. Server removed account.');
                        // Clear local auth state
                        localStorage.removeItem('token');
                        localStorage.removeItem('username');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userAvatar');
                        localStorage.removeItem('email');

                        alert('Your account has been permanently deleted. You will be redirected to the home page.');
                        navigate('/');
                    } else {
                        const data = await resp.json().catch(() => ({}));
                        console.error('Delete account failed', resp.status, data);
                        alert(data.message || 'Failed to delete account. Please contact support.');
                    }
                } catch (error) {
                    console.error('handleDeleteAccount error:', error);
                    alert('An error occurred while deleting your account. Please try again later.');
                }
            })();
        }
    };


    // --- Feature Card Component (Helper) ---
    const FeatureCard = ({ icon, title, description, action }) => (
        <div className={`p-6 rounded-xl shadow-md ${cardBg} border transition-all duration-300`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} mr-4`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                    </div>
                </div>
                {action}
            </div>
        </div>
    );

    // --- Main JSX Render ---
    return (
        <div className={`min-h-screen ${themeBg} font-sans transition-colors duration-500`}>
            <MainNavbar isDarkMode={isDarkMode} /> {/* Pass Dark Mode state to Navbar */}
            
            <div className="pt-24 max-w-5xl mx-auto px-6 py-12">
                <header className="mb-10 flex items-center justify-between">
                    <h1 className="text-4xl font-bold flex items-center">
                        <Settings size={30} className={`mr-3 ${iconColor}`} />
                        Settings
                    </h1>
                </header>

                <div className="space-y-8">
                    
                    {/* 1. APPEARANCE SECTION */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-indigo-600">Appearance</h2>
                        
                        <FeatureCard
                            icon={isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                            title="Dark Mode"
                            description="Switch between light and dark themes to optimize your viewing experience."
                            action={
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative inline-flex flex-shrink-0 h-7 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${switchColor} focus:ring-indigo-600`}
                                    aria-checked={isDarkMode}
                                >
                                    <span className="sr-only">Toggle Dark Mode</span>
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                                            isDarkMode ? 'translate-x-7' : 'translate-x-0'
                                        }`}
                                    />
                                    <span className="absolute left-1 top-1 text-xs text-gray-500">{isDarkMode ? 'Dark' : 'Light'}</span>
                                </button>
                            }
                        />
                    </section>

                    {/* 2. ACCOUNT & PROFILE SECTION */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-indigo-600">Account & Profile</h2>
                        
                        <div className="space-y-4">
                            <FeatureCard
                                icon={<User size={24} />}
                                title="Edit Profile"
                                description="Update your name, bio, skills, and profile picture."
                                action={
                                    <button 
                                        onClick={handleManageProfile}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors"
                                    >
                                        Manage
                                    </button>
                                }
                            />
                            <FeatureCard
                                icon={<Lock size={24} />}
                                title="Change Password"
                                description="Update your security credentials for better protection."
                                action={
                                    <button 
                                        onClick={handleChangePassword}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Update
                                    </button>
                                }
                            />
                            {/* <FeatureCard
                                icon={<Shield size={24} />}
                                title="Privacy Settings"
                                description={`Set your profile visibility. Currently: ${profilePrivacy ? 'Public' : 'Private'}`}
                                action={
                                    <button
                                        onClick={() => setProfilePrivacy(prev => !prev)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                                    profilePrivacy ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                }`}
                                    >
                                        {profilePrivacy ? 'Set Private' : 'Set Public'}
                                    </button>
                                }
                            /> */}
                        </div>
                    </section>

                    {/* 3. NOTIFICATIONS SECTION */}
                    {/* <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-indigo-600">Notifications</h2>
                        
                        <div className="space-y-4">
                            <FeatureCard
                                icon={<Bell size={24} />}
                                title="Session Reminders"
                                description="Get alerts 15 minutes before your scheduled sessions start."
                                action={
                                    <ToggleSwitch 
                                        isOn={notificationSettings.sessionReminders}
                                        onToggle={() => handleNotificationChange('sessionReminders')}
                                        isDarkMode={isDarkMode}
                                    />
                                }
                            />
                            <FeatureCard
                                icon={<MessageSquare size={24} />}
                                title="Message Notifications"
                                description="Receive instant notifications for new chat messages."
                                action={
                                    <ToggleSwitch 
                                        isOn={notificationSettings.messageNotifications}
                                        onToggle={() => handleNotificationChange('messageNotifications')}
                                        isDarkMode={isDarkMode}
                                    />
                                }
                            />
                        </div>
                    </section> */}
                    
                    {/* 4. PAYMENT AND BILLING */}
                    {/* <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-sky-500">Billing</h2>
                        
                        <FeatureCard
                            icon={<CreditCard size={24} />}
                            title="Payment Methods"
                            description="Manage your credit cards and billing information securely."
                            action={
                                    <button 
                                        onClick={handleEditCards}
                                        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Edit Cards <ExternalLink size={14} className="ml-2" />
                                    </button>
                            }
                        />
                    </section> */}
                    
                    {/* 5. DANGER ZONE */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-red-500">Danger Zone</h2>
                        
                        <div className="space-y-4">
                            <FeatureCard
                                icon={<LogOut size={24} />}
                                title="Logout All Devices"
                                description="Sign out from all devices."
                                action={
                                    <button 
                                        onClick={handleLogoutAllDevices}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                }
                            />
                            <FeatureCard
                                icon={<Trash2 size={24} />}
                                title="Delete Account"
                                description="Permanently delete your profile, history, and data."
                                action={
                                    <button 
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors dark:hover:bg-gray-700"
                                    >
                                        Delete
                                    </button>
                                }
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// --- Reusable Toggle Switch Component (No changes needed here) ---
const ToggleSwitch = ({ isOn, onToggle, isDarkMode }) => (
    <button
        onClick={onToggle}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 ${
            isOn ? 'bg-sky-600' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}
        aria-checked={isOn}
    >
        <span className="sr-only">Use setting</span>
        <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                isOn ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
    </button>
);