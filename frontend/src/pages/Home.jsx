import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, Flame, Eye, ArrowRight, Library, CheckCircle, HelpCircle } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [nlQuery, setNlQuery] = useState('');
  const [nlResults, setNlResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [recentResources, setRecentResources] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [universities, setUniversities] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, popularRes, uniRes] = await Promise.all([
          API.get('/resources?limit=3'),
          API.get('/resources?sort=downloads&limit=3'),
          API.get('/universities'),
        ]);
        setRecentResources(recentRes.data);
        setPopularResources(popularRes.data);
        setUniversities(uniRes.data);
      } catch (err) {
        console.error('Failed to load home page metrics:', err.message);
      }
    };
    fetchData();
  }, []);

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setSearching(true);
    setNlResults(null);
    try {
      const { data } = await API.post('/ai/search', { query: nlQuery });
      setNlResults(data);
      setSearching(false);
    } catch (err) {
      console.error(err);
      setSearching(false);
    }
  };

  const handleFillSampleQuery = (q) => {
    setNlQuery(q);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl py-12 px-8 md:px-12">
        <div className="absolute right-0 top-0 h-64 w-64 bg-amber-400 opacity-20 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Ethiopian University Students
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Access Free Academic Resources & Notes Instantly
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl font-light">
            Download lecture slides, past exam sheets, assignment samples, and lab manuals from top campuses across Ethiopia.
          </p>

          {/* AI Search Bar */}
          <div className="pt-2">
            <form onSubmit={handleAISearch} className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Ask AI: 'Show me database exams from Addis Ababa University'..."
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                className="w-full h-14 rounded-full pl-6 pr-32 text-slate-800 text-sm md:text-base font-medium shadow-lg border-2 border-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-2 top-2 h-10 px-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                {searching ? 'Analyzing...' : 'Ask AI'}
              </button>
            </form>

            {/* Prompt Helper */}
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-blue-200">Try asking:</span>
              <button
                onClick={() => handleFillSampleQuery('Find Java notes for second year students')}
                className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-blue-100 transition-colors"
              >
                "Find Java notes for second year students"
              </button>
              <button
                onClick={() => handleFillSampleQuery('Show database exams from Addis Ababa University')}
                className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-blue-100 transition-colors"
              >
                "Database exams from Addis Ababa University"
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Search Output Results Section */}
      {nlResults && (
        <section className="glass-panel rounded-2xl p-6 shadow-md border border-blue-200 dark:border-blue-900/40">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 animate-bounce" />
              AI Search Results
            </h3>
            <button
              onClick={() => setNlResults(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear Results
            </button>
          </div>

          <div className="mb-3 text-xs bg-blue-50 text-blue-800 p-2.5 rounded-lg dark:bg-blue-950/20 dark:text-blue-300">
            <span className="font-bold">AI Intent Query Model:</span> {JSON.stringify(nlResults.query)}
          </div>

          {nlResults.results.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No matching materials found for this request. Try browsing manually.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nlResults.results.map((res) => (
                <div key={res._id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-shadow dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md dark:bg-blue-950/40 dark:text-blue-400">
                      {res.fileType}
                    </span>
                    <span className="text-xs text-slate-400">{res.university?.abbreviation}</span>
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-1 dark:text-white">{res.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">{res.description}</p>
                  <Link
                    to={`/resources/${res._id}`}
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View resource <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Universities */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Supported Universities</h2>
          <Link to="/explore" className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {universities.map((uni) => (
            <Link
              key={uni._id}
              to={`/resources?university=${uni._id}`}
              className="glass-panel flex flex-col items-center text-center p-5 rounded-2xl hover:translate-y-[-4px] transition-all hover:shadow-md"
            >
              <img src={uni.logo} alt={uni.name} className="h-12 w-12 rounded-full object-cover shadow-inner mb-3" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate w-full">{uni.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase">{uni.abbreviation}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Resources Split Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Popular Downloads */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
            Popular Downloads
          </h2>
          <div className="space-y-3">
            {popularResources.map((res) => (
              <div key={res._id} className="glass-panel p-4 rounded-xl flex justify-between items-center hover:shadow-xs transition-shadow">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate dark:text-white">{res.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="font-semibold uppercase text-blue-600 dark:text-blue-400">{res.fileType}</span>
                    <span>•</span>
                    <span>{res.downloads} downloads</span>
                  </div>
                </div>
                <Link
                  to={`/resources/${res._id}`}
                  className="ml-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-2"
                >
                  <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Uploaded */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Library className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Recently Uploaded
          </h2>
          <div className="space-y-3">
            {recentResources.map((res) => (
              <div key={res._id} className="glass-panel p-4 rounded-xl flex justify-between items-center hover:shadow-xs transition-shadow">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate dark:text-white">{res.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{res.university?.abbreviation}</span>
                    <span>•</span>
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  to={`/resources/${res._id}`}
                  className="ml-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-2"
                >
                  <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Announcements / Instructions */}
      <section className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white mb-4">📢 System Announcements</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm dark:text-white">AI Assistant Live</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Our AI Study Helper chatbot is active. Open resources to generate multi-choice quizzes instantly or summarize lecture notes.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm dark:text-white">Contributor Gamification points</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload approved learning notes to earn points. Reach top contributor badge titles and see your name on the campus leaderboard!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
