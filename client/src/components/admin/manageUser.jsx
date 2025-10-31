import React, { useState, useEffect } from 'react';
import { Users, Loader, Crown, X, CheckCircle, AlertCircle } from 'lucide-react';
import AdminNavbar from '../../navbar/adminNavbar'; // Corrected import path

// --- Static Theme Classes (Light Mode) ---
const themeBg = 'bg-gray-100 text-gray-900';
const subtleText = 'text-gray-600';
const primaryText = 'text-indigo-600';

// --- Main Component: Manage Users Page ---
export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Tracks which user's action is loading
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newSubscription, setNewSubscription] = useState('free');
    const [notification, setNotification] = useState(null); // For success/error messages

    // Fetches all users from the backend when the component mounts.
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setUsers(result.data);
                } else {
                    console.error("Failed to fetch users:", result.message);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // --- Admin Actions ---
    const blockUser = async (userId) => {
        setActionLoading(userId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/block`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                // Update state locally for instant UI feedback
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, status: 'Blocked' } : user
                ));
            } else {
                console.error("Failed to block user:", result.message);
            }
        } catch (error) {
            console.error("Error blocking user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const unblockUser = async (userId) => {
        setActionLoading(userId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/unblock`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                // Update state locally for instant UI feedback
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, status: 'Active' } : user
                ));
            } else {
                console.error("Failed to unblock user:", result.message);
            }
        } catch (error) {
            console.error("Error unblocking user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    // --- Subscription Management ---
    const openSubscriptionModal = (user) => {
        setSelectedUser(user);
        setNewSubscription(user.isPremium ? 'premium' : 'free');
        setShowSubscriptionModal(true);
    };

    const closeSubscriptionModal = () => {
        setShowSubscriptionModal(false);
        setSelectedUser(null);
        setNewSubscription('free');
    };

    const updateSubscription = async () => {
        if (!selectedUser) return;
        
        setActionLoading(selectedUser.id);
        try {
            const token = localStorage.getItem('token');
            console.log('Updating subscription for user:', selectedUser.id);
            console.log('New subscription:', newSubscription);
            console.log('Sending isPremium:', newSubscription === 'premium');
            
            const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}/subscription`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isPremium: newSubscription === 'premium' })
            });
            
            const result = await response.json();
            console.log('Update response:', result);
            
            if (result.success) {
                // Update state locally for instant UI feedback
                setUsers(users.map(user =>
                    user.id === selectedUser.id ? { ...user, isPremium: newSubscription === 'premium' } : user
                ));
                
                // Show success notification
                setNotification({
                    type: 'success',
                    message: `Successfully updated ${selectedUser.name}'s subscription to ${newSubscription === 'premium' ? 'Premium' : 'Free'}`
                });
                
                closeSubscriptionModal();
                
                // Auto-hide notification after 3 seconds
                setTimeout(() => setNotification(null), 3000);
            } else {
                console.error("Failed to update subscription:", result.message);
                setNotification({
                    type: 'error',
                    message: result.message || 'Failed to update subscription'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (error) {
            console.error("Error updating subscription:", error);
            setNotification({
                type: 'error',
                message: 'Network error. Please try again.'
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setActionLoading(null);
        }
    };

    // --- Render ---
    return (
        <div className={`min-h-screen ${themeBg} font-sans transition-colors duration-500`}>
            <AdminNavbar />
            
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
                        notification.type === 'success' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                    }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle size={24} />
                        ) : (
                            <AlertCircle size={24} />
                        )}
                        <p className="font-medium">{notification.message}</p>
                    </div>
                </div>
            )}
            
            <div className="pt-24 max-w-7xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold flex items-center">
                        <Users size={30} className={`mr-3 ${primaryText}`} />
                        User Management
                    </h1>
                </header>

                <div className={`shadow-xl rounded-xl p-6 bg-white border border-gray-200 overflow-x-auto`}>
                    <h3 className="text-xl font-bold mb-6">Registered Users ({users.length})</h3>
                    
                    {loading ? (
                         <div className="text-center py-10">
                            <Loader size={32} className="animate-spin inline text-indigo-600" />
                            <p className="mt-2">Loading users...</p>
                         </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    {['Name', 'Email', 'Role', 'Subscription', 'Registered', 'Status', 'Actions'].map(header => (
                                        <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${subtleText}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className={user.status === 'Blocked' ? 'bg-red-50 opacity-70' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${user.role === 'Instructor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => openSubscriptionModal(user)}
                                                className="flex items-center gap-1 group"
                                            >
                                                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold leading-5 rounded-full transition-all ${
                                                    user.isPremium
                                                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' 
                                                        : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                                }`}>
                                                    {user.isPremium && <Crown size={12} className="mr-1" />}
                                                    {user.isPremium ? 'PREMIUM' : 'FREE'}
                                                </span>
                                                <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Change
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.registered).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`font-semibold ${user.status === 'Blocked' ? 'text-red-600' : 'text-green-600'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {user.status === 'Blocked' ? (
                                                <button
                                                    onClick={() => unblockUser(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                                >
                                                    {actionLoading === user.id ? '...' : 'Unblock'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => blockUser(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                >
                                                    {actionLoading === user.id ? '...' : 'Block'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Subscription Change Modal */}
            {showSubscriptionModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                        <button
                            onClick={closeSubscriptionModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            Change Subscription
                        </h2>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">User</p>
                            <p className="text-lg font-semibold text-gray-900">{selectedUser.name}</p>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Subscription Plan
                            </label>
                            
                            <div className="space-y-3">
                                {/* Free Plan Option */}
                                <div
                                    onClick={() => setNewSubscription('free')}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                        newSubscription === 'free'
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Free Plan</h3>
                                            <p className="text-sm text-gray-600">Basic features access</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            newSubscription === 'free'
                                                ? 'border-indigo-500 bg-indigo-500'
                                                : 'border-gray-300'
                                        }`}>
                                            {newSubscription === 'free' && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Plan Option */}
                                <div
                                    onClick={() => setNewSubscription('premium')}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                        newSubscription === 'premium'
                                            ? 'border-amber-500 bg-gradient-to-br from-yellow-50 to-amber-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Crown size={20} className="text-amber-500" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Premium Plan</h3>
                                                <p className="text-sm text-gray-600">Full features & priority support</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            newSubscription === 'premium'
                                                ? 'border-amber-500 bg-amber-500'
                                                : 'border-gray-300'
                                        }`}>
                                            {newSubscription === 'premium' && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeSubscriptionModal}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateSubscription}
                                disabled={actionLoading === selectedUser.id}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === selectedUser.id ? 'Updating...' : 'Update Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

