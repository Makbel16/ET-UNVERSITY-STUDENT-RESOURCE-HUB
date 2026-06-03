import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Search, LogOut, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, notifications, logout, markNotificationsAsRead } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 shadow-xs dark:border-slate-800 dark:bg-slate-950/80">
      
      {/* Left side mobile toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block relative w-72 md:w-96">
          <input
            type="text"
            placeholder="Search notes, past exams, study topics..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-10 rounded-full border border-slate-200 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
        </form>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        
        {/* Mobile Search Button */}
        <button 
          onClick={() => navigate('/resources')}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Icon & Popover */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">No notifications yet</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`rounded-lg p-2 text-xs transition-colors ${
                          notif.isRead
                            ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                            : 'bg-blue-50/50 text-slate-800 border-l-2 border-blue-500 dark:bg-blue-950/20 dark:text-slate-200'
                        }`}
                      >
                        <p className="font-medium">{notif.title}</p>
                        <p className="mt-0.5 text-slate-500 dark:text-slate-400">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User profile dropdown or SignIn buttons */}
        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
            title="Log Out"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
              Logout
            </span>
            <LogOut className="h-4.5 w-4.5 text-slate-400" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Sign Up
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
