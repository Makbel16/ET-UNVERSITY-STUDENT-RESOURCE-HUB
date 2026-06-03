import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import Community from './pages/Community';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Tutorials from './pages/Tutorials';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen flex bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
            {/* Left Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Right side contents */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top sticky navbar */}
              <Navbar toggleSidebar={toggleSidebar} />

              {/* Main content frame */}
              <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:pl-72 max-w-7xl mx-auto w-full">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/resources/:id" element={<ResourceDetail />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tutorials" element={<Tutorials />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
