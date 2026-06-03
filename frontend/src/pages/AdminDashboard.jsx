import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileCheck, AlertTriangle, Building, BarChart2, CheckCircle, Trash, Plus } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [reported, setReported] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add University states
  const [uniName, setUniName] = useState('');
  const [uniAbbr, setUniAbbr] = useState('');
  const [uniDesc, setUniDesc] = useState('');

  // Add Department states
  const [selectedUni, setSelectedUni] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Add Course states
  const [selectedDept, setSelectedDept] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseYear, setCourseYear] = useState(1);
  const [courseSem, setCourseSem] = useState(1);

  // List of all universities for select options
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user]);

  // Load departments when selectedUni changes
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
        console.error(err);
      }
    };
    fetchDepts();
  }, [selectedUni]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, pendingRes, reportedRes, unisRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/pending'),
        API.get('/admin/reports'),
        API.get('/universities'),
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
      setReported(reportedRes.data);
      setUniversities(unisRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/approve/${id}`);
      setPending(pending.filter(item => item._id !== id));
      alert('Resource approved!');
      fetchAdminData();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await API.delete(`/admin/resources/${id}`);
      setPending(pending.filter(item => item._id !== id));
      setReported(reported.filter(item => item._id !== id));
      alert('Resource deleted');
      fetchAdminData();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const handleDismissReports = async (id) => {
    try {
      await API.put(`/admin/reports/dismiss/${id}`);
      setReported(reported.filter(item => item._id !== id));
      alert('Reports dismissed!');
      fetchAdminData();
    } catch (err) {
      alert('Dismiss failed');
    }
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    try {
      await API.post('/universities', {
        name: uniName,
        abbreviation: uniAbbr,
        description: uniDesc,
      });
      setUniName('');
      setUniAbbr('');
      setUniDesc('');
      alert('University added successfully!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add university');
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!selectedUni) {
      alert('Select a university first');
      return;
    }
    try {
      await API.post(`/universities/${selectedUni}/departments`, {
        name: deptName,
        code: deptCode,
      });
      setDeptName('');
      setDeptCode('');
      alert('Department added successfully!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add department');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedDept) {
      alert('Select a department first');
      return;
    }
    try {
      await API.post(`/departments/${selectedDept}/courses`, {
        name: courseName,
        code: courseCode,
        year: Number(courseYear),
        semester: Number(courseSem),
      });
      setCourseName('');
      setCourseCode('');
      alert('Course added successfully!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add course');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          Admin Management Terminal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Perform administrative database actions, moderate files, and monitor campus metrics.
        </p>
      </div>

      {/* Analytics Stats Grid */}
      {stats && (
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Downloads', value: stats.totalDownloads, icon: BarChart2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
            { label: 'Total Materials', value: stats.totalResources, icon: FileCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Registered Students', value: stats.totalUsers, icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
            { label: 'Pending Approvals', value: stats.pendingResources, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className="font-display font-extrabold text-2xl text-slate-800 dark:text-white mt-1">{card.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${card.color} shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns: Moderation (Approvals & Reports) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Approvals Section */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <CheckCircle className="h-4.5 w-4.5 text-blue-500" />
              Pending Upload Approvals ({pending.length})
            </h3>
            
            {pending.length === 0 ? (
              <p className="text-xs text-slate-400 py-6">No uploads requiring review.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((res) => (
                  <div key={res._id} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 text-xs space-y-2 dark:bg-slate-900/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{res.title}</h4>
                        <p className="text-slate-400">Contributor: {res.uploadedBy?.name || 'Unknown Student'} ({res.uploadedBy?.email})</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                        {res.fileType}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 dark:text-slate-400 italic">"{res.description}"</p>
                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        onClick={() => handleApprove(res._id)}
                        className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 hover:shadow-xs transition-all"
                      >
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleDelete(res._id)}
                        className="rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-red-600 font-semibold px-3 py-1.5 transition-all dark:border-slate-800"
                      >
                        Reject & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports Section */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500 animate-pulse" />
              Reported Materials ({reported.length})
            </h3>
            
            {reported.length === 0 ? (
              <p className="text-xs text-slate-400 py-6">No reported items.</p>
            ) : (
              <div className="space-y-3">
                {reported.map((res) => (
                  <div key={res._id} className="p-4 rounded-xl border border-red-150 dark:border-red-950/20 text-xs space-y-2 dark:bg-slate-900/40">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{res.title}</h4>
                      <span className="text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                        Reported
                      </span>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-950/10 p-2.5 rounded-lg border border-red-100 dark:border-red-900/20 space-y-1">
                      <p className="font-bold text-red-700 dark:text-red-400 text-[10px] uppercase">Report Details:</p>
                      {res.reports.map((r, i) => (
                        <p key={i} className="text-slate-600 dark:text-slate-350">
                          - <span className="font-semibold">{r.user?.name || 'Student'}:</span> {r.reason}
                        </p>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        onClick={() => handleDismissReports(res._id)}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 dark:bg-slate-800 dark:text-slate-200 transition-all"
                      >
                        Dismiss Reports
                      </button>
                      <button
                        onClick={() => handleDelete(res._id)}
                        className="rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1.5 transition-all"
                      >
                        Delete Document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Catalog Forms Constructor */}
        <div className="space-y-6">
          
          {/* University Addition */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-semibold text-slate-850 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-blue-500" />
              Add University
            </h3>
            <form onSubmit={handleAddUniversity} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="University Full Name"
                value={uniName}
                onChange={(e) => setUniName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="text"
                required
                placeholder="Abbreviation (e.g. AAU)"
                value={uniAbbr}
                onChange={(e) => setUniAbbr(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <textarea
                placeholder="Short Description"
                value={uniDesc}
                onChange={(e) => setUniDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800 font-semibold py-2 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Add University
              </button>
            </form>
          </div>

          {/* Department Addition */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-semibold text-slate-850 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-amber-500" />
              Add Department
            </h3>
            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">Select University</option>
                {universities.map(uni => (
                  <option key={uni._id} value={uni._id}>{uni.name}</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Department Name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="text"
                required
                placeholder="Dept Code (e.g. CS)"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800 font-semibold py-2 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Add Department
              </button>
            </form>
          </div>

          {/* Course Addition */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="font-semibold text-slate-850 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-500" />
              Add Course
            </h3>
            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">Select University First</option>
                {universities.map(uni => (
                  <option key={uni._id} value={uni._id}>{uni.name}</option>
                ))}
              </select>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
                disabled={!selectedUni}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="text"
                required
                placeholder="Course Code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={courseYear}
                  onChange={(e) => setCourseYear(e.target.value)}
                  className="rounded-lg border border-slate-200 p-2 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
                <select
                  value={courseSem}
                  onChange={(e) => setCourseSem(e.target.value)}
                  className="rounded-lg border border-slate-200 p-2 focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                >
                  {[1, 2, 3].map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800 font-semibold py-2 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Add Course
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
