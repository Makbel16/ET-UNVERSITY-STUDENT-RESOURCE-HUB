import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Bookmark,
  Share2,
  AlertTriangle,
  Star,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  ThumbsUp,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [ratingScore, setRatingScore] = useState(5);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  // Document slide preview simulation state
  const [previewPage, setPreviewPage] = useState(1);
  const totalPreviewPages = 5;

  // AI Panel states
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [aiQuiz, setAiQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIdx: selectedOptionIdx }
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchResourceDetails();
  }, [id]);

  useEffect(() => {
    if (user && resource) {
      setHasBookmarked(user.bookmarks.includes(resource._id));
    }
  }, [user, resource]);

  const fetchResourceDetails = async () => {
    try {
      const { data } = await API.get(`/resources/${id}`);
      setResource(data);
      if (data.aiSummary) {
        setAiSummary(data.aiSummary);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    try {
      // Trigger download tracking
      await API.post(`/resources/${id}/download`);
      refreshUser();
      
      // Update UI count
      setResource((prev) => ({ ...prev, downloads: prev.downloads + 1 }));

      // Create a hidden link to download the actual file
      const link = document.createElement('a');
      link.href = resource.fileUrl.startsWith('http') 
        ? resource.fileUrl 
        : `http://localhost:5000${resource.fileUrl}`;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err.message);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await API.post(`/resources/${id}/bookmark`);
      setHasBookmarked(data.isBookmarked);
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateSubmit = async (score) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await API.post(`/resources/${id}/rate`, { score });
      setRatingScore(score);
      setResource((prev) => ({ ...prev, averageRating: data.averageRating }));
      refreshUser();
      alert('Thank you for rating!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const { data } = await API.post(`/resources/${id}/comment`, { text: commentText });
      setResource((prev) => ({
        ...prev,
        comments: [...prev.comments, { ...data, user: { _id: user._id, name: user.name, avatar: user.avatar } }],
      }));
      setCommentText('');
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reportReason.trim()) return;

    try {
      await API.post(`/resources/${id}/report`, { reason: reportReason });
      alert('Report submitted. Administrators will review the material.');
      setReportReason('');
      setShowReportForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleAISummarize = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoadingSummary(true);
    try {
      const { data } = await API.post(`/ai/summarize/${id}`);
      setAiSummary(data.summary);
      setLoadingSummary(false);
    } catch (err) {
      console.error(err);
      setLoadingSummary(false);
    }
  };

  const handleAIGenerateQuiz = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoadingQuiz(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
    try {
      const { data } = await API.post(`/ai/quiz/${id}`);
      setAiQuiz(data.quiz);
      setLoadingQuiz(false);
    } catch (err) {
      console.error(err);
      setLoadingQuiz(false);
    }
  };

  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const getCorrectAnswersCount = () => {
    if (!aiQuiz) return 0;
    return aiQuiz.reduce((count, q, idx) => {
      return count + (quizAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold dark:text-white">Resource not found</h2>
        <Link to="/resources" className="text-blue-600 hover:underline mt-2 inline-block">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Library
        </Link>

        {/* Bookmark & Report buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBookmarkToggle}
            className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
              hasBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/20'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${hasBookmarked ? 'fill-amber-500' : ''}`} />
            {hasBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Report Form Drawer Overlay */}
      {showReportForm && (
        <form onSubmit={handleReportSubmit} className="glass-panel p-4 rounded-xl border border-red-200 dark:border-red-900/40 space-y-3">
          <h4 className="font-semibold text-sm text-red-700 dark:text-red-400">Report Resource: Describe the issue</h4>
          <div className="flex gap-3">
            <input
              type="text"
              required
              placeholder="e.g. Broken file download, wrong course, inappropriate document contents..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold px-4 text-xs transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Info and Action Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded dark:bg-blue-950/40 dark:text-blue-400">
                {resource.fileType}
              </span>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {resource.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {resource.description}
              </p>
            </div>

            {/* Structured Details Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs border border-slate-100 dark:border-slate-800/80">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider">University</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{resource.university?.name}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider">Department</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{resource.department?.name}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider">Course</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{resource.course?.name}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider">Size / Downloads</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{resource.fileSize} / {resource.downloads} DLs</p>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 shadow-md transition-colors"
            >
              <Download className="h-5 w-5" />
              Download Document File
            </button>
          </div>

          {/* Interactive Simulated Previewer */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Document Live Previewer
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  disabled={previewPage === 1}
                  onClick={() => setPreviewPage((p) => p - 1)}
                  className="rounded bg-slate-100 hover:bg-slate-200 p-1 dark:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button>
                <span className="dark:text-slate-300">Page {previewPage} of {totalPreviewPages}</span>
                <button
                  disabled={previewPage === totalPreviewPages}
                  onClick={() => setPreviewPage((p) => p + 1)}
                  className="rounded bg-slate-100 hover:bg-slate-200 p-1 dark:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Document page canvas simulation */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8 min-h-[300px] flex flex-col justify-between text-slate-800 dark:text-slate-200 shadow-inner">
              <div className="space-y-4 font-mono text-xs">
                <div className="border-b border-slate-200 pb-2 flex justify-between uppercase tracking-wider text-[10px] text-slate-400">
                  <span>{resource.title}</span>
                  <span>PREVIEW DECK</span>
                </div>
                {previewPage === 1 && (
                  <div className="space-y-2">
                    <p className="font-bold text-sm">CHAPTER 1: Introduction to core syllabus</p>
                    <p>This resource covers the fundamental theories, architectural layouts, and implementation patterns aligned with the official course outline.</p>
                    <p>Key topics include schema design, object encapsulation hierarchy, functional relations, and design methodologies.</p>
                  </div>
                )}
                {previewPage === 2 && (
                  <div className="space-y-2">
                    <p className="font-bold text-sm">SECTION 1.2: Advanced Framework parameters</p>
                    <p>Students must analyze the differences between conceptual structures and logical models.</p>
                    <p>Example: Relational structures enforce constraint boundaries, whereas object models support inheritance mappings.</p>
                  </div>
                )}
                {previewPage >= 3 && (
                  <div className="space-y-2">
                    <p className="font-bold text-sm">SAMPLE QUESTIONS FOR WORKSHOP REVIEW</p>
                    <p>Question {previewPage - 1}: Discuss the performance implications of indexing schemas relative to write operations.</p>
                    <p>Question {previewPage}: Design a standard normalized schema map for a distributed library database portal.</p>
                  </div>
                )}
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest">- End of page {previewPage} preview -</p>
            </div>
          </div>
        </div>

        {/* Right Side Column: AI Assistant (Quiz, Summary) & Comments */}
        <div className="space-y-6">
          {/* AI Helper Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              AI Resource Tools
            </h3>

            {/* AI Summary View */}
            <div className="space-y-2">
              <button
                onClick={handleAISummarize}
                disabled={loadingSummary}
                className="w-full text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 py-2 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900 transition-colors disabled:opacity-50"
              >
                {loadingSummary ? 'Analyzing document...' : aiSummary ? 'Re-Generate AI Summary' : 'Generate AI Summary'}
              </button>

              {aiSummary && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    AI Concept Summary
                  </h4>
                  <div className="prose prose-xs dark:prose-invert">
                    {aiSummary.split('\n').map((para, i) => (
                      <p key={i} className="mb-1">{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Quiz Generator View */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleAIGenerateQuiz}
                disabled={loadingQuiz}
                className="w-full text-xs font-semibold rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-700 py-2 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 transition-colors disabled:opacity-50"
              >
                {loadingQuiz ? 'Generating test...' : aiQuiz ? 'Re-Generate Quiz Questions' : 'Generate AI Quiz Questions'}
              </button>

              {aiQuiz && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300 space-y-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                    Self-Test Quiz
                  </h4>

                  {aiQuiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2">
                      <p className="font-semibold text-slate-800 dark:text-white">{qIdx + 1}. {q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = optIdx === q.correctIndex;
                          let btnClass = "border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800";
                          
                          if (isSelected) {
                            btnClass = "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
                          }
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnClass = "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";
                            } else if (isSelected) {
                              btnClass = "bg-red-100 border-red-300 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-colors ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {quizSubmitted ? (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <p className="font-bold text-center text-sm dark:text-white">
                        Your Score: {getCorrectAnswersCount()} / {aiQuiz.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="mt-2 w-full text-center text-xs font-semibold text-blue-500 hover:underline"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < aiQuiz.length}
                      className="w-full rounded-lg bg-slate-900 text-white font-semibold py-2.5 text-xs transition-colors disabled:opacity-50"
                    >
                      Submit Quiz Answers
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Useful Learning Links List */}
          {resource.tutorialLinks && resource.tutorialLinks.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                Related Learning References
              </h3>
              <div className="space-y-2 text-xs">
                {resource.tutorialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate mr-2">{link.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Review Ratings and Comment board section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 text-blue-500" />
              Student Feedback ({resource.comments.length})
            </h3>

            {/* Quick Ratings Widget */}
            <div className="flex items-center gap-1.5 py-1 text-xs">
              <span className="font-semibold text-slate-500">Rate resource:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateSubmit(star)}
                    className="text-slate-300 hover:text-amber-400"
                  >
                    <Star className={`h-4.5 w-4.5 ${star <= ratingScore ? 'text-amber-500 fill-amber-500' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {resource.comments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No feedback written yet.</p>
              ) : (
                resource.comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs border-b border-slate-50 dark:border-slate-850 pb-2 mb-2">
                    <img src={comment.userAvatar || comment.user?.avatar} alt={comment.userName} className="h-7 w-7 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold dark:text-white">{comment.userName || comment.user?.name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Share your thoughts about this doc..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 p-2 text-xs focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 text-xs transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
