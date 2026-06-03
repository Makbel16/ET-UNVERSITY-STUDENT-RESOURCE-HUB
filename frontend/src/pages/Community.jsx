import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Plus, X, CornerDownRight, Tag } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('new');

  // New Post Form states
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('General');

  // Reply state
  const [activeReplyPostId, setActiveReplyPostId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchForumPosts();
  }, [categoryFilter, sortBy]);

  const fetchForumPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (sortBy) params.append('sort', sortBy);

      const { data } = await API.get(`/forum?${params.toString()}`);
      setPosts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await API.post('/forum', {
        title: postTitle,
        content: postContent,
        category: postCategory,
      });
      setShowPostModal(false);
      setPostTitle('');
      setPostContent('');
      setPostCategory('General');
      refreshUser(); // update points for starting discussion
      fetchForumPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (postId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const { data } = await API.post(`/forum/${postId}/reply`, { content: replyContent });
      
      // Update local state list
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === postId) {
            return {
              ...p,
              replies: [...p.replies, { ...data, author: { _id: user._id, name: user.name, avatar: user.avatar } }],
            };
          }
          return p;
        })
      );
      setReplyContent('');
      setActiveReplyPostId(null);
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (postId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await API.post(`/forum/${postId}/upvote`);
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === postId) {
            // Update upvotes array locally
            const isUpvotedNow = data.isUpvoted;
            const updatedUpvotes = isUpvotedNow
              ? [...p.upvotes, user._id]
              : p.upvotes.filter((id) => id.toString() !== user._id.toString());
            return { ...p, upvotes: updatedUpvotes };
          }
          return p;
        })
      );
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Student Community Forum
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Ask questions, share syllabus resources, explain difficult topics, and exchange feedback.
          </p>
        </div>
        {user ? (
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Start Discussion
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-300 transition-colors dark:bg-slate-800 dark:text-slate-200"
          >
            <Plus className="h-5 w-5" />
            Sign in to Ask
          </Link>
        )}
      </div>

      {/* Categories & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-950">
        <div className="flex gap-2 flex-wrap">
          {['', 'General', 'Exam Prep', 'Coding', 'Mathematics', 'Engineering'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300'
              }`}
            >
              {cat === '' ? 'All Topics' : cat}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-slate-200 p-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="new">New Discussions</option>
          <option value="popular">Most Liked</option>
        </select>
      </div>

      {/* Discussions List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <MessageSquare className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-semibold text-lg dark:text-white">No discussions yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const hasLiked = user && post.upvotes.includes(user._id);
            return (
              <div key={post._id} className="glass-panel p-6 rounded-2xl space-y-4 hover:shadow-xs transition-shadow">
                {/* Author Metadata */}
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar || post.author?.avatar} alt={post.authorName} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <h3 className="text-sm font-semibold dark:text-white">{post.authorName || post.author?.name}</h3>
                    <p className="text-[10px] text-slate-400">
                      {post.author?.role === 'admin' ? 'Faculty Moderator' : 'Student'} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                    <Tag className="h-3 w-3" />
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">{post.title}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-b border-slate-50 dark:border-slate-850/80 py-2.5">
                  <button
                    onClick={() => handleUpvote(post._id)}
                    className={`flex items-center gap-1.5 font-semibold hover:text-blue-500 ${
                      hasLiked ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-blue-500/20' : ''}`} />
                    <span>{post.upvotes.length} Likes</span>
                  </button>
                  <button
                    onClick={() => {
                      if (activeReplyPostId === post._id) setActiveReplyPostId(null);
                      else setActiveReplyPostId(post._id);
                    }}
                    className="flex items-center gap-1.5 font-semibold hover:text-blue-500"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.replies.length} Replies</span>
                  </button>
                </div>

                {/* Replies Board */}
                {post.replies.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2 border-slate-100 dark:border-slate-850">
                    {post.replies.map((rep) => (
                      <div key={rep._id} className="flex gap-2.5 items-start text-xs">
                        <CornerDownRight className="h-4 w-4 text-slate-300 mt-1" />
                        <img src={rep.authorAvatar || rep.author?.avatar} alt={rep.authorName} className="h-6 w-6 rounded-full object-cover" />
                        <div className="min-w-0 flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold dark:text-white">{rep.authorName || rep.author?.name}</span>
                            <span className="text-[9px] text-slate-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-1 font-light leading-relaxed">{rep.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Input Form */}
                {activeReplyPostId === post._id && (
                  <div className="flex gap-2 pl-4">
                    <input
                      type="text"
                      required
                      placeholder="Write your answer or explanation here..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 p-2 text-xs focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddReply(post._id)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 text-xs transition-colors"
                    >
                      Post Answer
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Discussion Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-5.5 w-5.5 text-blue-600" />
              Ask a Study Question
            </h2>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Query</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does functional dependency relate to 2NF?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Explain your question</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your doubt in detail so fellow students can help you out..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Topic Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="General">General Campus Chat</option>
                  <option value="Exam Prep">Exam Preparation</option>
                  <option value="Coding">Computer Programming</option>
                  <option value="Mathematics">Calculus & Algebra</option>
                  <option value="Engineering">Applied Sciences</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 text-sm transition-colors"
                >
                  Post Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Community;
