import React, { useState, useEffect } from 'react';
import { Trash2, Loader, MessageSquare } from 'lucide-react';
import AdminNavbar from '../../navbar/adminNavbar'; // Corrected import path

// --- Static Theme Classes (Light Mode) ---
const themeBg = 'bg-gray-100 text-gray-900';
const subtleText = 'text-gray-600';
const primaryText = 'text-indigo-600';

// --- Main Component: Manage Posts Page ---
export default function ManagePosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // To disable only the clicked button

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/posts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setPosts(result.data);
                } else {
                    console.error("Failed to fetch posts:", result.message);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // --- Admin Actions ---
    const deletePost = async (postId) => {
        setActionLoading(postId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success) {
                setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
            } else {
                console.error("Failed to delete post:", result.message);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        } finally {
            setActionLoading(null);
        }
    };

    // --- Render ---
    return (
        <div className={`min-h-screen ${themeBg} font-sans transition-colors duration-500`}>
            <AdminNavbar /> 
            
            <div className="pt-24 max-w-7xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold flex items-center">
                        <MessageSquare size={30} className={`mr-3 ${primaryText}`} />
                        Post Management
                    </h1>
                </header>

                <div className={`shadow-xl rounded-xl p-6 bg-white border border-gray-200 overflow-x-auto`}>
                    <h3 className="text-xl font-bold mb-6">Community Posts ({posts.length})</h3>
                    
                    {loading ? (
                         <div className="text-center py-10">
                            <Loader size={32} className="animate-spin inline text-indigo-600" />
                            <p className="mt-2">Loading posts...</p>
                         </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    {['Author', 'Content Preview', 'Reports', 'Date', 'Actions'].map(header => (
                                        <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${subtleText}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {posts.map(post => (
                                    <tr 
                                        key={post.id} 
                                        className={post.reports > 0 ? 'bg-red-50 hover:bg-red-100 transition-colors' : 'hover:bg-gray-100 transition-colors'}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{post.author}</td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm">
                                            {post.content}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                            <span className={post.reports > 0 ? 'text-red-600' : 'text-gray-500'}>
                                                {post.reports}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                disabled={actionLoading === post.id}
                                                className="text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {actionLoading === post.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                {actionLoading === post.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

