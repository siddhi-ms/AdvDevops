import React, { useState, useEffect } from 'react';
import { Settings, Lock, Database, Globe, RefreshCw, AlertTriangle, Save, Loader, CheckCircle, XCircle } from 'lucide-react';
import AdminNavbar from '../../navbar/adminNavbar.jsx';

// --- Static Theme Classes ---
const themeBg = 'bg-gray-100 text-gray-900';
const subtleText = 'text-gray-600';
const primaryText = 'text-indigo-600';

// --- Main Component: AdminSettings Page ---
export default function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: 'CollabLearn',
        maintenanceMode: false,
        minPasswordLength: 8,
    });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'success', 'error'

    // Fetch initial settings on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setSettings(result.data);
                } else {
                    console.error("Failed to fetch settings:", result.message);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveStatus('saving');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            const result = await response.json();

            if (result.success) {
                setSaveStatus('success');
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            setSaveStatus('error');
            console.error('Failed to save settings:', error);
        } finally {
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };
    
    // NOTE: These data actions are simulated. Real implementation requires complex backend logic.
    const handleDataAction = (actionName) => {
        alert(`Simulating '${actionName}'. In a real app, this would trigger a secure backend process.`);
    };

    const SettingsSection = ({ icon: Icon, title, description, children }) => (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="flex items-center mb-4 border-b pb-3">
                <Icon size={24} className={`mr-3 ${primaryText}`} />
                <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <p className={`mb-6 text-sm ${subtleText}`}>{description}</p>
            {children}
        </div>
    );

    if (loading) {
        return (
            <div className={`min-h-screen ${themeBg} flex items-center justify-center`}>
                <Loader size={48} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeBg} font-sans`}>
            <AdminNavbar /> 
            
            <div className="pt-24 max-w-7xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold flex items-center">
                        <Settings size={30} className={`mr-3 ${primaryText}`} />
                        Admin Settings
                    </h1>
                </header>

                <form onSubmit={handleSave}>
                    <SettingsSection 
                        icon={Globe} 
                        title="General Platform Settings" 
                        description="Control basic platform identity and operational status."
                    >
                        <div className="mb-4">
                            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                            <input
                                type="text"
                                id="siteName"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                            <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 flex items-center">
                                <AlertTriangle size={16} className="text-red-500 mr-2" />
                                Enable Maintenance Mode
                            </label>
                            <input
                                type="checkbox"
                                id="maintenanceMode"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                        </div>
                    </SettingsSection>

                    <SettingsSection 
                        icon={Lock} 
                        title="Security and Access" 
                        description="Configure parameters affecting user and admin account security."
                    >
                        <div className="mb-4">
                            <label htmlFor="minPasswordLength" className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                            <input
                                type="number"
                                id="minPasswordLength"
                                name="minPasswordLength"
                                value={settings.minPasswordLength}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 max-w-sm"
                                min="6"
                                max="16"
                                required
                            />
                        </div>
                    </SettingsSection>

                    <SettingsSection 
                        icon={Database} 
                        title="Data Management Tools" 
                        description="Perform administrative actions related to system data and caching. These actions are simulated."
                    >
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => handleDataAction('Full Database Backup')}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Database size={18} className="mr-2" />
                                Backup DB
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDataAction('Clear Application Cache')}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <RefreshCw size={16} className="mr-2" />
                                Clear Cache
                            </button>
                        </div>
                    </SettingsSection>
                    
                    <div className="flex items-center justify-end mt-8">
                        {saveStatus && (
                            <div className={`flex items-center font-medium mr-4 ${saveStatus === 'success' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : 'text-indigo-600'}`}>
                                {saveStatus === 'saving' && <Loader size={18} className="animate-spin mr-2" />}
                                {saveStatus === 'success' && <CheckCircle size={18} className="mr-2" />}
                                {saveStatus === 'error' && <XCircle size={18} className="mr-2" />}
                                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Settings Saved!' : 'Save Failed!'}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={saveStatus === 'saving'}
                            className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                        >
                            <Save size={20} className="mr-2" />
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

