import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Bookmark, Clock, Settings, Zap, Award, Edit3, ShieldAlert } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'bookmarks';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Settings states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/auth/me');
      setProfileData(data);
      setEditName(data.name);
      setEditEmail(data.email);
      setEditAvatar(data.avatar);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { data } = await API.put('/auth/profile', {
        name: editName,
        email: editEmail,
        avatar: editAvatar,
      });
      setUser(data);
      setSaving(false);
      setSaveSuccess(true);
      fetchProfile();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold dark:text-white">Access Denied</h2>
        <p className="text-slate-500 mt-1 mb-4">Please log in to view your profile statistics.</p>
        <Link to="/login" className="rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      {profileData && (
        <section className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
          <img
            src={profileData.avatar}
            alt={profileData.name}
            className="h-24 w-24 rounded-full object-cover border-2 border-blue-500 shadow-md"
          />
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
              {profileData.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {profileData.university?.name || 'AAU'} • {profileData.department?.name || 'Computer Science'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              {profileData.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-full"
                >
                  <Award className="h-3 w-3" />
                  {badge}
                </span>
              ))}
              {profileData.badges.length === 0 && (
                <span className="text-xs text-slate-400 italic">No badges earned yet. Upload files to earn badges!</span>
              )}
            </div>
          </div>
          {/* Points Card */}
          <div className="rounded-2xl bg-amber-400/10 border border-amber-400/30 p-5 text-center flex flex-col justify-center items-center w-36 shadow-xs">
            <Zap className="h-7 w-7 text-amber-500 fill-amber-500" />
            <span className="font-display font-extrabold text-2xl text-amber-600 dark:text-amber-400 mt-1">{profileData.points}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Points</span>
          </div>
        </section>
      )}

      {/* Tabs list navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'bookmarks', label: 'My Bookmarks', icon: Bookmark },
          { id: 'history', label: 'Download History', icon: Clock },
          { id: 'settings', label: 'Account Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
                currentTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex h-36 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : currentTab === 'bookmarks' ? (
          <div className="space-y-4">
            {!profileData?.bookmarks || profileData.bookmarks.length === 0 ? (
              <p className="text-slate-400 text-xs py-8">You haven't bookmarked any resources yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profileData.bookmarks.map((res) => (
                  <div key={res._id} className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{res.fileType}</span>
                      <h4 className="font-semibold text-sm line-clamp-1 dark:text-white mt-0.5">{res.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{res.description}</p>
                    </div>
                    <Link
                      to={`/resources/${res._id}`}
                      className="text-xs font-bold text-blue-600 hover:underline mt-4 inline-block"
                    >
                      Open Document
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : currentTab === 'history' ? (
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-2">Downloaded Materials Log</h3>
            {!profileData?.downloadHistory || profileData.downloadHistory.length === 0 ? (
              <p className="text-slate-400 text-xs py-6">No downloads tracked yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {profileData.downloadHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <div className="min-w-0 flex-1 pr-4">
                      <Link to={`/resources/${item.resource?._id}`} className="font-semibold hover:underline truncate block dark:text-slate-200">
                        {item.resource?.title || 'Unknown Resource'}
                      </Link>
                      <p className="text-[10px] text-slate-400">File Type: {item.resource?.fileType || 'pdf'}</p>
                    </div>
                    <span className="text-slate-400 shrink-0">{new Date(item.downloadedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl max-w-lg">
            <h3 className="font-semibold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-1.5">
              <Edit3 className="h-4.5 w-4.5 text-blue-500" />
              Update Account Information
            </h3>

            {saveSuccess && (
              <div className="mb-4 text-xs bg-emerald-50 text-emerald-700 p-3 rounded-lg dark:bg-emerald-950/20 dark:text-emerald-400">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Avatar Image URL</label>
                <input
                  type="url"
                  required
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 text-xs transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving changes...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
