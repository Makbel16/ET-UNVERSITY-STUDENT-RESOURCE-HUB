import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications if user is logged in
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Refetch notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, university, department, year, semester) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/register', {
        name,
        email,
        password,
        university,
        department,
        year,
        semester,
      });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('userInfo');
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/auth/me');
      // Merge updated profile fields with token
      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email,
        role: data.role,
        points: data.points,
        badges: data.badges,
        avatar: data.avatar,
        university: data.university?._id || data.university,
        department: data.department?._id || data.department,
        year: data.year,
        semester: data.semester,
      };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to refresh user stats:', err.message);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;
    try {
      await API.put('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        notifications,
        login,
        register,
        logout,
        refreshUser,
        fetchNotifications,
        markNotificationsAsRead,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
