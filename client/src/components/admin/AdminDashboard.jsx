import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart2, MessageSquare, Clock, LayoutDashboard, TrendingUp, TrendingDown, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../navbar/adminNavbar'; 

// --- DUMMY DATA ---
const initialSummaryData = {
    totalUsers: 0,
    newRequests: 0,
    pendingBookings: 0,
    activePosts: 0,
    instructors: 0,
    learners: 0,
    reportedPostsCount: 0,
    activeUsersCount: 0,
    monthlyData: [],
};

// Simulate monthly data for registered users and active users
const monthlyData = [
    { month: 'Jan', registered: 10, active: 8 },
    { month: 'Feb', registered: 15, active: 10 },
    { month: 'Mar', registered: 25, active: 18 },
    { month: 'Apr', registered: 40, active: 30 },
    { month: 'May', registered: 60, active: 45 },
    { month: 'Jun', registered: 85, active: 70 },
];

// --- Static Theme Classes (Light Mode) ---
const themeBg = 'bg-slate-50';
const subtleText = 'text-gray-600';
const primaryText = 'text-indigo-600';

// --- Utility Functions ---
const calculateChange = (data) => {
    if (data.length < 2) return { change: 0, icon: <TrendingUp size={20} className="text-gray-500" />, color: 'text-gray-500' };
    
    const latest = data[data.length - 1].registered;
    const previous = data[data.length - 2].registered;
    const percentage = ((latest - previous) / previous) * 100;

    if (percentage > 0) {
        return { change: percentage.toFixed(1), icon: <TrendingUp size={20} className="text-green-600" />, color: 'text-green-600' };
    } else if (percentage < 0) {
        return { change: percentage.toFixed(1), icon: <TrendingDown size={20} className="text-red-600" />, color: 'text-red-600' };
    }
    return { change: 0, icon: <TrendingUp size={20} className="text-gray-500" />, color: 'text-gray-500' };
};

// --- Sub-Component: Simple Bar Chart for Monthly Activity ---
const MonthlyUserChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.registered));
    
    return (
        <div className="h-64 pt-6">
            <h4 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Monthly User Registration & Activity</h4>
            <div className="flex justify-between items-end h-48 space-x-4">
                {data.map((d, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
                        <div className="text-xs text-gray-500 mb-1">{d.registered}</div>
                        {/* Registered Bar (indigo light) */}
                        <div 
                            className="w-full bg-indigo-200 rounded-t-lg transition-all duration-700 hover:bg-indigo-300 relative" 
                            style={{ height: `${(d.registered / maxVal) * 80 + 10}%` }}
                        >
                            {/* Active Bar (indigo dark) */}
                            <div 
                                className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-700 rounded-t-lg" 
                                style={{ height: `${(d.active / d.registered) * 100}%` }}
                                title={`Active: ${d.active}`}
                            />
                        </div>
                        <span className="text-sm font-medium mt-1">{d.month}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-4 space-x-6 text-sm py-5">
                <div className="flex items-center"><span className="w-3 h-3 bg-indigo-200 mr-2 border"></span>Registered</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-indigo-600 mr-2"></span>Active</div>
            </div>
        </div>
    );
}

// --- Main Component: Admin Dashboard (Unified) ---
export default function AdminDashboard() {
    const [summaryData, setSummaryData] = useState(initialSummaryData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const result = await response.json();
                if (result.success) {
                    setSummaryData(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const userGrowthChange = calculateChange(summaryData.monthlyData);

    // Unified List of All 8 Metrics
    // Unified neutral style for all metric cards to match project theme
    const defaultBorder = 'border-l-indigo-500';
    const defaultIconColor = 'text-indigo-600';
    const defaultFooterColor = 'text-gray-500';

    const allMetrics = [
        { 
            title: "Total Registered Users", 
            value: summaryData.totalUsers, 
            detail: "All accounts, active and inactive.", 
            icon: <Users size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: `${(summaryData.totalUsers > 0 ? (summaryData.activeUsers / summaryData.totalUsers * 100).toFixed(0) : 0)}% are active`,
            footerColor: defaultFooterColor,
            footerIcon: <span className="w-4"></span>
        },
        { 
            title: "Pending Bookings", 
            value: summaryData.pendingBookings, 
            detail: "Sessions awaiting instructor confirmation.", 
            icon: <Clock size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: "Immediate action required.",
            footerColor: defaultFooterColor,
            footerIcon: <span className="w-4"></span>
        },
        { 
            title: "New Reports/Requests", 
            value: summaryData.newRequests + summaryData.reportedPostsCount, // Combining requests and reported posts
            detail: "Items requiring moderation/response.", 
            icon: <MessageSquare size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: `${summaryData.reportedPostsCount} reported posts`,
            footerColor: defaultFooterColor,
            footerIcon: <X size={20} />
        },
        { 
            title: "Active Skills/Posts", 
            value: summaryData.activePosts, 
            detail: "Total number of live offerings.", 
            icon: <FileText size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: "Platform content health is good.",
            footerColor: defaultFooterColor,
            footerIcon: <CheckCircle size={20} />
        },
        { 
            title: "Active Users (Current)", 
            value: summaryData.activeUsers, 
            detail: "Users logged in the last 7 days.", 
            icon: <CheckCircle size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: `${(summaryData.activeUsers / summaryData.totalUsers * 100).toFixed(0)}% engagement rate`,
            footerColor: defaultFooterColor,
            footerIcon: <span className="w-4"></span>
        },
        { 
            title: "Total Instructors", 
            value: summaryData.instructors, 
            detail: "Users registered as skill providers.", 
            icon: <BarChart2 size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: `${(summaryData.instructors / summaryData.totalUsers * 100).toFixed(0)}% of total users`,
            footerColor: defaultFooterColor,
            footerIcon: <span className="w-4"></span>
        },
        { 
            title: "User Growth (MoM)", 
            value: `${userGrowthChange.change}%`, 
            detail: "New user registrations vs. last month.", 
            icon: userGrowthChange.icon, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: `vs. last month (${summaryData.monthlyData.slice(-2)[0]?.registered || 0} users)`,
            footerColor: defaultFooterColor,
            footerIcon: userGrowthChange.icon
        },
        { 
            title: "Learners", 
            value: summaryData.learners, 
            detail: "Users primarily seeking sessions.", 
            icon: <Users size={24} />, 
            iconColor: defaultIconColor,
            borderColor: defaultBorder,
            footer: `${(summaryData.learners / summaryData.totalUsers * 100).toFixed(0)}% of total users`,
            footerColor: defaultFooterColor,
            footerIcon: <span className="w-4"></span>
        },
    ];

    const instructorPercent = (summaryData.instructors / summaryData.totalUsers * 100).toFixed(0);
    const learnerPercent = (summaryData.learners / summaryData.totalUsers * 100).toFixed(0);


    return (
        <div className={`min-h-screen ${themeBg} font-sans`}>
            <AdminNavbar /> 
            
            <main className="pt-24 max-w-7xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                        <LayoutDashboard size={30} className={`mr-3 ${primaryText}`} />
                        Admin Dashboard & Platform Metrics
                    </h1>
                    <p className={`mt-2 ${subtleText}`}>
                        The central control panel showing key performance indicators, operational metrics, and user analytics.
                    </p>
                </header>

                {/* --- UNIFIED PLATFORM METRICS KPI SECTION --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Platform Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {allMetrics.map((card, index) => (
                        <div 
                            key={`metric-${index}`} 
                            // New Unified Card Styling: Clean BG, Shadow, Border-Left Color
                            className={`p-5 rounded-xl shadow-lg bg-white border border-gray-200 border-l-4 ${card.borderColor || 'border-l-indigo-500'} flex flex-col justify-between transition-shadow duration-300 hover:shadow-xl`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-grow">
                                    <p className={`text-sm font-medium ${subtleText}`}>{card.title}</p>
                                    {/* Main metric value should be plain black to match UI */}
                                    <p className="text-3xl font-extrabold mt-1 text-black">
                                        {card.value}
                                    </p>
                                </div>
                                {/* Icon with a neutral gray background circle */}
                                <div className={`p-2 rounded-full ${card.iconColor || 'text-indigo-600'} bg-gray-100 flex-shrink-0`}>
                                    {card.icon}
                                </div>
                            </div>
                            
                            {/* Card Footer/Detail */}
                            <div className={`flex items-center text-xs font-semibold pt-3 border-t border-gray-100 ${card.footerColor}`}>
                                {card.footerIcon}
                                <span className="ml-1">{card.footer}</span>
                            </div>
                        </div>
                    ))}
                </div>


                {/* --- CHARTING SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly User Activity Chart */}
                    <div className={`lg:col-span-2 p-8 rounded-xl shadow-lg bg-white border border-gray-200`}>
                        <MonthlyUserChart data={summaryData.monthlyData.length > 0 ? summaryData.monthlyData : monthlyData} />
                    </div>

                    {/* User Role Breakdown Section */}
                    <div className={`p-8 rounded-xl shadow-lg bg-white border border-gray-200 flex flex-col justify-between`}>
                        <h3 className="text-xl font-bold mb-4 border-b pb-3 text-gray-800">User Role Distribution</h3>
                        
                        <div className="flex flex-col flex-grow items-center justify-around space-y-4">
                            
                            {/* Instructor Card */}
                            <div className="text-center p-4 border border-indigo-200 rounded-lg w-full hover:shadow-md transition-shadow">
                                <p className="text-sm uppercase font-semibold text-indigo-600">Instructors</p>
                                <p className="text-5xl font-extrabold text-indigo-500 my-2">{summaryData.instructors}</p>
                                <p className="text-base font-medium opacity-80">({instructorPercent}% of total)</p>
                            </div>

                            {/* Learner Card */}
                            <div className="text-center p-4 border border-purple-200 rounded-lg w-full hover:shadow-md transition-shadow">
                                <p className="text-sm uppercase font-semibold text-purple-600">Learners</p>
                                <p className="text-5xl font-extrabold text-purple-500 my-2">{summaryData.learners}</p>
                                <p className="text-base font-medium opacity-80">({learnerPercent}% of total)</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}