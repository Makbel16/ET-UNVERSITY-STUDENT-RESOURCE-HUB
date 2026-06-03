import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, AlertCircle } from 'lucide-react';
import API from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  // Load universities
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const { data } = await API.get('/universities');
        setUniversities(data);
      } catch (err) {
        console.error('Failed to load universities:', err.message);
      }
    };
    fetchUnis();
  }, []);

  // Load departments when university changes
  useEffect(() => {
    const fetchDepts = async () => {
      if (!selectedUni) {
        setDepartments([]);
        return;
      }
      try {
        const { data } = await API.get(`/universities/${selectedUni}/departments`);
        setDepartments(data);
      } catch (err) {
        console.error('Failed to load departments:', err.message);
      }
    };
    fetchDepts();
  }, [selectedUni]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedUni || !selectedDept) {
      setErrorMsg('Please select your university and department');
      return;
    }
    try {
      await register(name, email, password, selectedUni, selectedDept, Number(year), Number(semester));
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <School className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create student account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Or{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
            sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abenezer Yosef"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu.et"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  University
                </label>
                <select
                  value={selectedUni}
                  onChange={(e) => setSelectedUni(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="">Select University</option>
                  {universities.map((uni) => (
                    <option key={uni._id} value={uni._id}>
                      {uni.name} ({uni.abbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  disabled={!selectedUni}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-55"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  {[1, 2, 3].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Registering Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Register;
