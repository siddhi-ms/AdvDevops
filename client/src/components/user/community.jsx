import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiPlus, FiMessageCircle, 
  FiEye, FiThumbsUp, FiTrash2, FiX 
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import MainNavbar from '../../navbar/mainNavbar';
import { Link } from 'react-router-dom';
import { getAvatarDisplayProps } from '../../utils/avatarUtils';

// --- Static Data ---
const initialCategories = [
  { name: 'C/C++', count: 120, color: 'bg-indigo-500' },
  { name: 'Python', count: 95, color: 'bg-green-500' },
  { name: 'Java', count: 80, color: 'bg-red-500' },
  { name: 'React', count: 70, color: 'bg-purple-500' },
  { name: 'MongoDB', count: 70, color: 'bg-yellow-500' },
  { name: 'Node.js', count: 70, color: 'bg-orange-500' },
  { name: 'Express.js', count: 70, color: 'bg-blue-500' },
];

// Removed static top contributors; now fetched from API

const trendingTopics = [
  { name: 'React Hooks', count: 23 },
  { name: 'Python Basics', count: 18 },
  { name: 'Online Teaching', count: 15 },
  { name: 'Career Change', count: 12 },
  { name: 'JavaScript ES6', count: 11 },
];


// --- SUB-COMPONENTS ---

const PostCard = ({ post, handleDeletePost, currentUserId, fetchPosts, currentUser }) => {
  const [commentText, setCommentText] = useState("");
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get avatar display props for the post author
  const avatarProps = getAvatarDisplayProps(
    { 
      name: post.author, 
      avatar: post.userInfo?.avatar || post.authorAvatar || post.avatar 
    }, 
    44
  );

  const handleLike = async () => {
    await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });
    fetchPosts();
  };

  const handleAddComment = async (e) => {
    if (e.key === "Enter" && commentText.trim()) {
      await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          author: currentUser.name,
          text: commentText,
        }),
      });
      setCommentText("");
      fetchPosts();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeletePost(post._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
          {avatarProps.hasCustom && avatarProps.avatarUrl ? (
            <img 
              src={avatarProps.avatarUrl} 
              alt={post.author} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ${avatarProps.hasCustom && avatarProps.avatarUrl ? 'hidden' : 'flex'}`}
            style={{ backgroundColor: avatarProps.initialsColor }}
          >
            {avatarProps.initials}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-900">{post.author}</span>
              <span className="text-sm text-gray-500 ml-2">
                · {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {post.isHot && (
                <div className="flex items-center space-x-1 text-orange-500">
                  <FaFire />
                  <span className="text-sm font-semibold">Hot</span>
                </div>
              )}
              {(post.userId === currentUserId || post.userId?.toString() === currentUserId || post.userId === currentUserId?.toString()) && (
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`transition-colors duration-200 p-1 rounded-full ${
                    isDeleting 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isDeleting ? "Deleting..." : "Delete post"}
                >
                  <FiTrash2 size={18} className={isDeleting ? 'animate-pulse' : ''} />
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-2 flex items-center flex-wrap gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                post.authorRole === "Expert Teacher" ? "bg-indigo-100 text-indigo-800"
                : post.authorRole === "Community Star" ? "bg-indigo-100 text-indigo-800"
                : post.authorRole === "New Contributor" ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
              }`}
            >
              {post.authorRole}
            </span>
            <span className="bg-indigo-100 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              #{post.category}
            </span>
          </div>

          <Link to={`/post/${post._id}`}>
            <h3 className="text-lg font-bold text-gray-900 mt-1 cursor-pointer hover:text-indigo-600">
              {post.title}
            </h3>
            <p className="text-gray-600 mt-1 text-sm">{post.excerpt}</p>
          </Link>

          <div className="mt-4 flex items-center flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center text-gray-500">
            <div className="flex items-center space-x-5">
                <button
                onClick={() => setIsCommentVisible(!isCommentVisible)}
                className="flex items-center space-x-1.5 cursor-pointer hover:text-indigo-600"
              >
                <FiMessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{post.stats.comments}</span>
              </button>
              <button
                onClick={handleLike}
                className="flex items-center space-x-1.5 hover:text-indigo-600 cursor-pointer"
              >
                <FiThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{post.stats.likes}</span>
              </button>
              <span className="flex items-center space-x-1.5">
                <FiEye className="w-4 h-4" />
                <span className="text-sm font-medium">{post.stats.views}</span>
              </span>
            </div>
          </div>

          {isCommentVisible && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleAddComment}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
              <div className="mt-2 text-sm text-gray-700 space-y-2">
                {post.comments && post.comments.slice(-2).map((c, idx) => {
                  const commentAvatarProps = getAvatarDisplayProps({ name: c.author }, 24);
                  return (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                        {commentAvatarProps.hasCustom && commentAvatarProps.avatarUrl ? (
                          <img 
                            src={commentAvatarProps.avatarUrl} 
                            alt={c.author} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs ${commentAvatarProps.hasCustom && commentAvatarProps.avatarUrl ? 'hidden' : 'flex'}`}
                          style={{ backgroundColor: commentAvatarProps.initialsColor }}
                        >
                          {commentAvatarProps.initials}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">{c.author}</span>: {c.text}
                      </div>
                    </div>
                  );
                })}
                {post.stats.comments > 2 && (
                  <div className="text-xs text-gray-500">
                    ...and {post.stats.comments - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarCard = ({ title, children }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm">
    <h3 className="font-bold text-gray-800 text-md mb-4">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const NewPostModal = ({ onAddPost, onClose, currentUser }) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');

  const availableCategories = [
    "C/C++",
    "Java",
    "Python",
    "React",
    "MongoDB",
    "Node.js",
    "Express.js",
    "General Discussion",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !category) {
      alert("Please fill in the title, content, and select a category.");
      return;
    }
    onAddPost({
      author: currentUser.name,
      title,
      excerpt,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      authorRole: 'New Contributor',
      category,
      userId: currentUser.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Create a New Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" placeholder="What's on your mind?" />
            </div>
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" placeholder="Elaborate on your topic..."></textarea>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
              <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" placeholder="e.g., react, tailwind, webdev" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category (Required)</label>
              {category && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {category}
                    <button type="button" onClick={() => setCategory('')} className="ml-2 text-indigo-500 hover:text-indigo-700">
                      <FiX size={16} />
                    </button>
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} disabled={!!category} className={`px-3 py-1 border rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center p-5 border-t space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-sm">Publish Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CommunityPage = () => {
  
  const [allPosts, setAllPosts] = useState([]); // Holds posts loaded so far (paginated)
  const [filteredPosts, setFilteredPosts] = useState([]); // Holds posts to be displayed
  const [selectedCategory, setSelectedCategory] = useState('All Posts'); // For filtering
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const POSTS_PAGE_SIZE = 10;
  
  
  // Create a dynamic list of categories including "All Posts"
  const categoriesForFilter = [
      { name: 'All Posts', count: allPosts.length, color: 'bg-sky-500' },
      ...initialCategories
  ];

  const getCurrentUser = () => {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    if (!username || !userId) {
      return { id: 'anonymous', name: 'Anonymous User', avatar: null };
    }
    return { id: userId, name: username, avatar: null };
  };

  // Fetch current user data including avatar
  const fetchCurrentUser = async () => {
    const localUser = getCurrentUser();
    if (localUser.id === 'anonymous') {
      setCurrentUser(localUser);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/user/${localUser.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.name,
            avatar: data.user.avatar,
            avatarUrl: data.user.avatarUrl
          });
        } else {
          setCurrentUser(localUser);
        }
      } else {
        setCurrentUser(localUser);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setCurrentUser(localUser);
    }
  };

  const fetchPosts = async (page = 1, append = false) => {
    try {
      setLoadingPosts(true);
      const response = await fetch(`http://localhost:5000/api/posts?page=${page}&limit=${POSTS_PAGE_SIZE}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const incoming = data?.posts || [];
      setAllPosts(prev => append ? [...prev, ...incoming] : incoming);
      setHasMorePosts(((data?.page || 1) * (data?.limit || POSTS_PAGE_SIZE)) < (data?.total || 0));
      setPostsPage(data?.page || page);
    } catch (error) {
      // Silently fail to avoid noisy console logs
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts/top-contributors?limit=3');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const contributors = (data && data.contributors) ? data.contributors : [];
      // Ensure sorted descending by totalPosts just in case
      contributors.sort((a, b) => (b.totalPosts || 0) - (a.totalPosts || 0));
      setTopContributors(contributors);
    } catch (error) {
      setTopContributors([]);
    }
  };

  useEffect(() => {
    // Fire initial requests in parallel for better TTFB
    fetchCurrentUser();
    fetchTopContributors();
    fetchPosts(1, false);
  }, []);

  // Keep top contributors dynamic with a light polling interval
  useEffect(() => {
    const id = setInterval(() => {
      fetchTopContributors();
    }, 60000); // 60s
    return () => clearInterval(id);
  }, []);
  
  // NEW useEffect for filtering posts when selectedCategory or allPosts changes
  useEffect(() => {
    if (selectedCategory === 'All Posts') {
      setFilteredPosts(allPosts);
    } else {
      setFilteredPosts(allPosts.filter(post => post.category === selectedCategory));
    }
  }, [selectedCategory, allPosts]);

  const handleAddPost = async (newPostData) => {
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchPosts(1, false);
      fetchTopContributors();
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to add post. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user-id': currentUser?.id || ''
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Show success message
        const result = await response.json();
        
        // Refresh posts
        fetchPosts(1, false);
        // Refresh top contributors dynamically
        fetchTopContributors();
      } catch (error) {
        alert(`Failed to delete post: ${error.message}. Please try again.`);
      }
    }
  };

  return (
    <>
      {/* Add animation styles */}
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>

      <MainNavbar />
      <div className="bg-gray-50 min-h-screen font-sans pt-17">
        <div className="container mx-auto px-4 py-8">
          
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <main className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                <div className="relative w-full sm:w-auto flex-grow">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search discussions..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {/* <button className="flex items-center justify-center w-1/2 sm:w-auto space-x-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition">
                    <FiFilter className="text-gray-600" />
                    <span className="text-gray-700 font-medium">Filter</span>
                  </button> */}
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-1/2 sm:w-auto space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition shadow-sm">
                    <FiPlus />
                    <span className="font-medium">New Post</span>
                  </button>
                </div>
              </div>

              {/* Tabs removed: showing all posts by default */}

              <div className="space-y-6">
                {/* Skeletons while loading first page */}
                {loadingPosts && allPosts.length === 0 && (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-3">
                          <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                          <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                          <div className="w-full h-4 bg-gray-200 rounded"></div>
                          <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {currentUser && filteredPosts.map((post) => (
                  <PostCard key={post._id} post={post} handleDeletePost={handleDeletePost} currentUserId={currentUser.id} fetchPosts={(...args) => fetchPosts(1, false)} currentUser={currentUser} />
                ))}

                {/* Load more */}
                {hasMorePosts && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => fetchPosts(postsPage + 1, true)}
                      disabled={loadingPosts}
                      className={`px-4 py-2 rounded-lg border ${loadingPosts ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700'} `}
                    >
                      {loadingPosts ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </div>
            </main>

            <aside className="space-y-6">
              <SidebarCard title="Categories">
                {categoriesForFilter.map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex justify-between items-center text-sm p-2 rounded-md transition-all duration-200 ${selectedCategory === cat.name ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-3 ${cat.color}`}></span>
                      <span className={`${selectedCategory === cat.name ? 'font-semibold' : 'font-normal'}`}>{cat.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedCategory === cat.name ? 'bg-sky-200 text-sky-800' : 'bg-gray-200 text-gray-700'}`}>
                        {cat.name === 'All Posts' ? allPosts.length : allPosts.filter(p => p.category === cat.name).length}
                    </span>
                  </button>
                ))}
              </SidebarCard>

              <SidebarCard title="Top Contributors">
                {topContributors.length === 0 && (
                  <div className="text-sm text-gray-500">No contributors yet</div>
                )}
                {topContributors.slice(0,3).map((user, idx) => {
                  const avatarProps = getAvatarDisplayProps({ name: user.name, avatar: user.avatar, avatarUrl: user.avatarUrl }, 36);
                  return (
                    <div key={user.userId || idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                          {avatarProps.hasCustom && avatarProps.avatarUrl ? (
                            <img 
                              src={avatarProps.avatarUrl} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs ${avatarProps.hasCustom && avatarProps.avatarUrl ? 'hidden' : 'flex'}`}
                            style={{ backgroundColor: avatarProps.initialsColor }}
                          >
                            {avatarProps.initials}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-sky-600">{user.totalPosts}</span>
                    </div>
                  );
                })}
              </SidebarCard>

            </aside>
          </div>
        </div>
      </div>

      {isModalOpen && currentUser && (
        <NewPostModal 
          onAddPost={handleAddPost} 
          onClose={() => setIsModalOpen(false)} 
          currentUser={currentUser} 
        />
      )}
    </>
  );
};

export default CommunityPage;
