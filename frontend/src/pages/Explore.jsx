import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School, BookOpen, Layers, ArrowRight } from 'lucide-react';
import API from '../services/api';

const Explore = () => {
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [activeUni, setActiveUni] = useState(null);
  const [activeDept, setActiveDept] = useState(null);

  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const { data } = await API.get('/universities');
        setUniversities(data);
        if (data.length > 0) {
          setActiveUni(data[0]);
        }
      } catch (err) {
        console.error('Failed to load universities:', err.message);
      }
    };
    fetchUnis();
  }, []);

  useEffect(() => {
    const fetchDepts = async () => {
      if (!activeUni) return;
      try {
        const { data } = await API.get(`/universities/${activeUni._id}/departments`);
        setDepartments(data);
        if (data.length > 0) {
          setActiveDept(data[0]);
        } else {
          setActiveDept(null);
          setCourses([]);
        }
      } catch (err) {
        console.error('Failed to load departments:', err.message);
      }
    };
    fetchDepts();
  }, [activeUni]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!activeDept) return;
      try {
        const { data } = await API.get(`/departments/${activeDept._id}/courses`);
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err.message);
      }
    };
    fetchCourses();
  }, [activeDept]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Explore Academic Catalog
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Navigate through universities, departments, and course curricula to find specific files.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1: Universities */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col h-[500px]">
          <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <School className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            1. Select University
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {universities.map((uni) => (
              <button
                key={uni._id}
                onClick={() => {
                  setActiveUni(uni);
                  setActiveDept(null);
                  setCourses([]);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                  activeUni?._id === uni._id
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <img src={uni.logo} alt={uni.name} className="h-8 w-8 rounded-full object-cover shadow-xs bg-white" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{uni.name}</p>
                  <p className={`text-xs ${activeUni?._id === uni._id ? 'text-blue-200' : 'text-slate-400'} font-bold uppercase`}>
                    {uni.abbreviation}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Departments */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col h-[500px]">
          <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-amber-500" />
            2. Select Department
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {!activeUni ? (
              <p className="text-center text-xs text-slate-400 py-12">Please select a university first</p>
            ) : departments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No departments registered yet</p>
            ) : (
              departments.map((dept) => (
                <button
                  key={dept._id}
                  onClick={() => setActiveDept(dept)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                    activeDept?._id === dept._id
                      ? 'bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{dept.name}</p>
                    <p className={`text-xs ${activeDept?._id === dept._id ? 'text-amber-100' : 'text-slate-400'} font-bold uppercase`}>
                      Code: {dept.code}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Courses */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col h-[500px]">
          <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-emerald-500" />
            3. Choose Course & Browse
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {!activeDept ? (
              <p className="text-center text-xs text-slate-400 py-12">Please select a department first</p>
            ) : courses.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No courses registered yet</p>
            ) : (
              courses.map((course) => (
                <Link
                  key={course._id}
                  to={`/resources?course=${course._id}`}
                  className="block p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xs transition-all dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate dark:text-white">{course.name}</p>
                      <p className="text-xs text-slate-400">
                        Code: <span className="font-medium text-slate-600 dark:text-slate-300">{course.code}</span> • Year {course.year}, Sem {course.semester}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-500 shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
