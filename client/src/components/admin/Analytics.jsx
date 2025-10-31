import React, { useState, useEffect } from 'react';
import { Users, BarChart2, CheckCircle, X, MessageSquare, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import AdminNavbar from '../../navbar/adminNavbar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Static Theme Classes (Light Mode) ---
const themeBg = 'bg-gray-100 text-gray-900';
const subtleText = 'text-gray-600';
const primaryText = 'text-indigo-600';

// --- Utility Functions ---
const calculateChange = (data) => {
    if (!data || data.length < 2) return { change: 0, icon: <TrendingUp size={20} className="text-gray-500" />, color: 'text-gray-500' };
    
    const latest = data[data.length - 1].registered;
    const previous = data[data.length - 2].registered;

    if (previous === 0) return { change: latest > 0 ? 100 : 0, icon: <TrendingUp size={20} className="text-green-600" />, color: 'text-green-600' };

    const percentage = ((latest - previous) / previous) * 100;

    if (percentage > 0) {
        return { change: percentage.toFixed(1), icon: <TrendingUp size={20} className="text-green-600" />, color: 'text-green-600' };
    } else if (percentage < 0) {
        return { change: Math.abs(percentage).toFixed(1), icon: <TrendingDown size={20} className="text-red-600" />, color: 'text-red-600' };
    }
    return { change: 0, icon: <TrendingUp size={20} className="text-gray-500" />, color: 'text-gray-500' };
};

// --- Sub-Component: Bar Chart using react-chartjs-2 ---
const MonthlyUserChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => d.month),
        datasets: [
            {
                label: 'Registered Users',
                data: data.map(d => d.registered),
                backgroundColor: 'rgba(129, 140, 248, 0.6)', // Indigo-300
                borderColor: 'rgba(99, 102, 241, 1)', // Indigo-500
                borderWidth: 1,
            },
            {
                label: 'Active Users',
                data: data.map(d => d.active),
                backgroundColor: 'rgba(79, 70, 229, 0.8)', // Indigo-600
                borderColor: 'rgba(67, 56, 202, 1)', // Indigo-700
                borderWidth: 1,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Registered vs. Active Users',
                font: { size: 18 }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Number of Users' }
            },
            x: {
                title: { display: true, text: 'Month' }
            }
        }
    };

    return (
        <div className="relative h-96">
            <Bar options={options} data={chartData} />
        </div>
    );
};

// --- Main Component: Analytics Dashboard Page ---
export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setAnalytics(result.data);
                } else {
                    console.error("Failed to fetch analytics:", result.message);
                }
            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen ${themeBg} flex items-center justify-center`}>
                <Loader size={48} className="animate-spin text-indigo-600" />
            </div>
        );
    }
    
    if (!analytics) {
        return (
             <div className={`min-h-screen ${themeBg} flex items-center justify-center`}>
                <div className="text-center">
                    <X size={48} className="mx-auto text-red-500" />
                    <h2 className="mt-4 text-xl font-semibold">Could not load analytics data.</h2>
                    <p className="text-gray-600">Please try refreshing the page.</p>
                </div>
            </div>
        );
    }

    const { totalUsers, activeUsers, instructors, learners, reportedPostsCount, monthlyData } = analytics;
    const userGrowthChange = calculateChange(monthlyData);
    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(0) : 0;
    const instructorPercent = totalUsers > 0 ? (instructors / totalUsers * 100).toFixed(0) : 0;
    const learnerPercent = totalUsers > 0 ? (learners / totalUsers * 100).toFixed(0) : 0;

    const dataCards = [
        { title: "Total Users", value: totalUsers, icon: <Users size={24} />, color: 'text-indigo-600', footer: `${userGrowthChange.change}% vs. last month`, footerColor: userGrowthChange.color, footerIcon: userGrowthChange.icon },
        { title: "Active Users", value: activeUsers, icon: <CheckCircle size={24} />, color: 'text-green-600', footer: `${engagementRate}% engagement rate`, footerColor: 'text-gray-500', footerIcon: <span className="w-4"></span> },
        { title: "Reported Posts", value: reportedPostsCount, icon: <MessageSquare size={24} />, color: 'text-red-600', footer: `Requires moderation`, footerColor: 'text-red-600', footerIcon: <X size={20} /> },
        { title: "Total Instructors", value: instructors, icon: <BarChart2 size={24} />, color: 'text-yellow-600', footer: `${instructorPercent}% of users`, footerColor: 'text-gray-500', footerIcon: <span className="w-4"></span> },
    ];
    
    return (
        <div className={`min-h-screen ${themeBg} font-sans`}>
            <AdminNavbar /> 
            
            <div className="pt-24 max-w-7xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold flex items-center">
                        <BarChart2 size={30} className={`mr-3 ${primaryText}`} />
                        Platform Analytics & User Growth
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {dataCards.map((card, index) => (
                        <div key={index} className="p-6 rounded-xl shadow-lg bg-white border border-gray-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-grow">
                                    <p className={`text-lg font-medium ${subtleText}`}>{card.title}</p>
                                    <p className="text-4xl font-extrabold mt-1">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${card.color} bg-gray-100`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className={`flex items-center text-sm font-semibold pt-3 border-t border-gray-100 ${card.footerColor}`}>
                                {card.footerIcon}
                                <span className="ml-1">{card.footer}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-8 rounded-xl shadow-lg bg-white border border-gray-200 mb-12">
                    <MonthlyUserChart data={monthlyData} />
                </div>

                <div className="p-8 rounded-xl shadow-lg bg-white border border-gray-200">
                    <h3 className="text-2xl font-bold mb-6 border-b pb-3">User Role Distribution</h3>
                    <div className="flex flex-col lg:flex-row items-center justify-around">
                        <div className="text-center p-4 w-full lg:w-1/3">
                            <p className="text-sm uppercase font-semibold text-indigo-600">Instructors</p>
                            <p className="text-6xl font-extrabold text-indigo-500 my-3">{instructors}</p>
                            <p className="text-lg font-medium opacity-80">({instructorPercent}% of total)</p>
                        </div>
                        <div className="flex-shrink-0 mx-8 hidden lg:block">
                            <Users size={48} className="text-gray-400" />
                        </div>
                        <div className="w-full lg:hidden border-b border-gray-200 my-4"></div>
                        <div className="text-center p-4 w-full lg:w-1/3">
                            <p className="text-sm uppercase font-semibold text-purple-600">Learners</p>
                            <p className="text-6xl font-extrabold text-purple-500 my-3">{learners}</p>
                            <p className="text-lg font-medium opacity-80">({learnerPercent}% of total)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

