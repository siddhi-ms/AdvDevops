import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMessageCircle, FiThumbsUp, FiBookmark, FiUpload, FiArrowLeft } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import MainNavbar from '../../navbar/mainNavbar';

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentUser = () => {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const userAvatar = localStorage.getItem('userAvatar');
    if (!username || !userId) {
      return { id: 'anonymous', name: 'Anonymous User', avatar: 'https://i.pravatar.cc/150?u=default' };
    }
    return { id: userId, name: username, avatar: userAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}` };
  };

  const currentUser = getCurrentUser();

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      // Fetch post details
      const postRes = await fetch(`http://localhost:5000/api/posts/${postId}`);
      if (!postRes.ok) throw new Error(`HTTP error! status: ${postRes.status}`);
      const postData = await postRes.json();
      setPost(postData);

      // Comments are included in the post data, so we can set them directly
      setComments(postData.comments || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostAndComments();
    }
  }, [postId]);

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (!response.ok) throw new Error('Failed to like the post.');
      fetchPostAndComments(); // Refetch to update the like count
    } catch (error) {
      console.error("Error liking post:", error);
      alert("Failed to like the post. Please try again.");
    }
  };

  const handleAddComment = async (e) => {
    if ((e.type === 'click' || e.key === 'Enter') && commentText.trim()) {
      e.preventDefault();
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            author: currentUser.name,
            text: commentText,
          }),
        });
        if (!response.ok) throw new Error('Failed to add comment.');
        
        setCommentText("");
        // Refetch comments to show the new one
        fetchPostAndComments(); 
      } catch (error) {
        console.error("Error adding comment:", error);
        alert("Failed to post comment. Please try again.");
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading post...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!post) return <div className="text-center py-10">Post not found.</div>;
  if (!post) return <div className="text-center py-10">Post not found.</div>;

  return (
    <>
      <MainNavbar />
      <div className="bg-gray-50 min-h-screen font-sans pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link to="/community" className="flex items-center text-sky-600 hover:text-sky-800 mb-4">
              <FiArrowLeft className="mr-2" />
              Back to Community
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Post Header */}
              <div className="flex items-start space-x-4">
                <img src={post.avatar} alt={post.author} className="w-11 h-11 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">{post.author}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        · {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      #{post.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Body */}
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                <p className="text-gray-700 mt-2 text-base">{post.excerpt}</p>
              </div>

              {/* Tags */}
              <div className="mt-4 flex items-center flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Bar */}
              <div className="mt-5 flex items-center text-gray-500 border-t border-b py-3">
                <div className="flex items-center space-x-5">
                  <span className="flex items-center space-x-1.5">
                    <FiMessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{comments.length} Comments</span>
                  </span>
                  <button onClick={handleLike} className="flex items-center space-x-1.5 hover:text-sky-600 cursor-pointer">
                    <FiThumbsUp className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.stats.likes}</span>
                  </button>
                </div>
              </div>

              {/* Comment Input */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Leave a comment</h3>
                <div className="flex items-start space-x-3">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <textarea
                      placeholder={`Comment as ${currentUser.name}...`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={handleAddComment}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                      rows="3"
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        className="px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 shadow-sm disabled:bg-sky-300 disabled:cursor-not-allowed"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  All Comments ({comments.length})
                </h3>
                <div className="space-y-5">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <img src={comment.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(comment.author)}`} alt={comment.author} className="w-9 h-9 rounded-full" />
                        <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt || Date.now()), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostPage;
