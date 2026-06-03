import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  School,
  BookOpen,
  Layers,
  FileText,
  Youtube,
  FileQuestion,
  Briefcase,
  Code,
  Award,
  ExternalLink,
  MessageSquare,
  Bookmark,
  User,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: School },
    { name: 'Browse Resources', path: '/resources', icon: FileText },
    { name: 'Previous Exams', path: '/resources?type=exam', icon: FileQuestion },
    { name: 'Assignments', path: '/resources?type=assignment', icon: Briefcase },
    { name: 'Projects & Reports', path: '/resources?type=project', icon: Code },
    { name: 'Tutorials', path: '/tutorials', icon: Youtube },
    { name: 'Community Forum', path: '/community', pathMatches: '/community', icon: MessageSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'My Bookmarks', path: '/profile?tab=bookmarks', icon: Bookmark },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 text-slate-700 transition-transform duration-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-brand-blue dark:text-blue-400" />
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
              EthioStudyHub
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => isOpen && toggleSidebar()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-brand-blue border-l-4 border-brand-blue dark:bg-blue-950/40 dark:text-blue-400'
                      : 'hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          {/* Admin Section Gate */}
          {user && user.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Administration
              </span>
              <NavLink
                to="/admin"
                onClick={() => isOpen && toggleSidebar()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 mt-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-500 dark:bg-red-950/20 dark:text-red-400'
                      : 'hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }`
                }
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Admin Dashboard</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer User Profile Summary */}
        {user ? (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate dark:text-white">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-500 truncate dark:text-slate-400 font-medium">
                  {user.points} Points
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <NavLink
              to="/login"
              className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none"
            >
              Sign In
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
