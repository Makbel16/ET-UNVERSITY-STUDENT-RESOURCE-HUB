import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Upload, FileText, Download, Star, BookOpen, Clock, X, Plus, Trash } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Search and Filter States
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Metadata dropdown lists
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadUni, setUploadUni] = useState('');
  const [uploadDept, setUploadDept] = useState('');
  const [uploadCourse, setUploadCourse] = useState('');
  const [uploadYear, setUploadYear] = useState(1);
  const [uploadSem, setUploadSem] = useState(1);
  const [uploadType, setUploadType] = useState('pdf');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLinks, setUploadLinks] = useState([{ label: '', url: '' }]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Read URL query params on load/change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const courseParam = params.get('course') || '';
    const uniParam = params.get('university') || '';
    const typeParam = params.get('type') || '';

    setSearch(searchParam);
    if (courseParam) setSelectedCourse(courseParam);
    if (uniParam) setSelectedUni(uniParam);
    if (typeParam) {
      if (typeParam === 'exam') {
        setSelectedType('pdf');
        setSearch('exam');
      } else if (typeParam === 'assignment') {
        setSearch('assignment');
      } else if (typeParam === 'project') {
        setSearch('project');
      } else {
        setSelectedType(typeParam);
      }
    }

    fetchResources();
  }, [location.search]);

  // Load universities
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const { data } = await API.get('/universities');
        setUniversities(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnis();
  }, []);

  // Fetch departments when university selected
  useEffect(() => {
    const fetchDepts = async () => {
      const targetUni = showUploadModal ? uploadUni : selectedUni;
      if (!targetUni) {
        if (showUploadModal) setDepartments([]);
        else setDepartments([]);
        return;
      }
      try {
        const { data } = await API.get(`/universities/${targetUni}/departments`);
        setDepartments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, [selectedUni, uploadUni, showUploadModal]);

  // Fetch courses when department selected
  useEffect(() => {
    const fetchCourses = async () => {
      const targetDept = showUploadModal ? uploadDept : selectedDept;
      if (!targetDept) {
        if (showUploadModal) setCourses([]);
        else setCourses([]);
        return;
      }
      try {
        const { data } = await API.get(`/departments/${targetDept}/courses`);
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [selectedDept, uploadDept, showUploadModal]);

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedUni) params.append('university', selectedUni);
      if (selectedDept) params.append('department', selectedDept);
      if (selectedCourse) params.append('course', selectedCourse);
      if (selectedYear) params.append('year', selectedYear);
      if (selectedSem) params.append('semester', selectedSem);
      if (selectedType) params.append('fileType', selectedType);
      if (sortBy) params.append('sort', sortBy);

      const { data } = await API.get(`/resources?${params.toString()}`);
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedUni('');
    setSelectedDept('');
    setSelectedCourse('');
    setSelectedYear('');
    setSelectedSem('');
    setSelectedType('');
    setSortBy('date');
    navigate('/resources');
  };

  const handleUploadLinkChange = (index, field, value) => {
    const updated = [...uploadLinks];
    updated[index][field] = value;
    setUploadLinks(updated);
  };

  const addUploadLinkField = () => {
    setUploadLinks([...uploadLinks, { label: '', url: '' }]);
  };

  const removeUploadLinkField = (index) => {
    setUploadLinks(uploadLinks.filter((_, i) => i !== index));
  };

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }
    if (!uploadUni || !uploadDept || !uploadCourse) {
      setUploadError('Please specify university, department, and course details');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('description', uploadDesc);
    formData.append('university', uploadUni);
    formData.append('department', uploadDept);
    formData.append('course', uploadCourse);
    formData.append('year', uploadYear);
    formData.append('semester', uploadSem);
    formData.append('fileType', uploadType);
    formData.append('file', uploadFile);
    formData.append('tutorialLinks', JSON.stringify(uploadLinks.filter(l => l.label && l.url)));

    try {
      await API.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploading(false);
      setShowUploadModal(false);
      // Reset values
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
      setUploadLinks([{ label: '', url: '' }]);
      refreshUser(); // Refresh points
      fetchResources(); // Refresh browser list
      alert(user?.role === 'admin' ? 'Resource uploaded and live!' : 'Resource submitted! Pending admin review approval.');
    } catch (err) {
      setUploading(false);
      setUploadError(err.response?.data?.message || 'File upload failed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Library Resources
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse through notes, previous exam sheets, and reference files uploaded by students and staff.
          </p>
        </div>
        {user ? (
          <button
            onClick={() => {
              setUploadUni(user.university || '');
              setUploadDept(user.department || '');
              setShowUploadModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md hover:bg-blue-500 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Upload Document
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-300 transition-colors dark:bg-slate-800 dark:text-slate-200"
          >
            <Upload className="h-5 w-5" />
            Sign in to upload
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Side: Advanced Filters Form */}
        <form onSubmit={handleFilterSubmit} className="glass-panel p-5 rounded-2xl h-fit space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-blue-600" />
              Filter Tools
            </h3>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Reset All
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Search Keywords</label>
            <input
              type="text"
              placeholder="e.g. databases, midterm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">University</label>
            <select
              value={selectedUni}
              onChange={(e) => {
                setSelectedUni(e.target.value);
                setSelectedDept('');
                setSelectedCourse('');
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Universities</option>
              {universities.map((uni) => (
                <option key={uni._id} value={uni._id}>{uni.name} ({uni.abbreviation})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedCourse('');
              }}
              disabled={!selectedUni}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-55"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!selectedDept}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-55"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.name} ({course.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All Years</option>
                {[1, 2, 3, 4, 5, 6, 7].map(y => (
                  <option key={y} value={y}>Yr {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Semester</label>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All Sems</option>
                {[1, 2, 3].map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">File Format</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">All Formats</option>
              <option value="pdf">PDF Docs</option>
              <option value="pptx">PowerPoint (PPTX)</option>
              <option value="docx">Word (DOCX)</option>
              <option value="zip">Archive (ZIP)</option>
              <option value="xlsx">Excel (XLSX)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sort Result</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="date">New Releases</option>
              <option value="downloads">Popular Downloads</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-2.5 text-xs transition-colors"
          >
            Apply Filters
          </button>
        </form>

        {/* Right Side: Resources List Results */}
        <div className="lg:col-span-3 space-y-4">
          {resources.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="font-semibold text-lg dark:text-white">No materials found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Try broadening your search or modifying filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((res) => (
                <div key={res._id} className="glass-panel p-5 rounded-2xl hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    {res.fileType}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {res.university?.abbreviation} • Year {res.year} Sem {res.semester}
                    </span>
                    <h3 className="font-semibold text-base mt-1 line-clamp-1 dark:text-white">{res.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{res.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                        {res.course?.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
                        {res.downloads}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        {res.averageRating}
                      </span>
                    </div>
                    <Link
                      to={`/resources/${res._id}`}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1 dark:text-blue-400"
                    >
                      Open Document
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Direct File Upload Modal overlay */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Upload className="h-5.5 w-5.5 text-blue-600" />
              Upload Educational Material
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Contributors receive <span className="font-semibold text-blue-600">15 points</span> immediately upon successful upload. Note: Student uploads must be vetted by administrators before publication.
            </p>

            {uploadError && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg dark:bg-red-950/20 dark:text-red-400">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Systems Midterm Exam AAU 2025"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Short Description / Contents</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the topics covered in this document..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">University</label>
                  <select
                    value={uploadUni}
                    onChange={(e) => {
                      setUploadUni(e.target.value);
                      setUploadDept('');
                      setUploadCourse('');
                    }}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Select University</option>
                    {universities.map(uni => (
                      <option key={uni._id} value={uni._id}>{uni.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <select
                    value={uploadDept}
                    onChange={(e) => {
                      setUploadDept(e.target.value);
                      setUploadCourse('');
                    }}
                    required
                    disabled={!uploadUni}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Course</label>
                  <select
                    value={uploadCourse}
                    onChange={(e) => setUploadCourse(e.target.value)}
                    required
                    disabled={!uploadDept}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">File Format</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="pdf">PDF Docs</option>
                    <option value="pptx">PowerPoint (PPTX)</option>
                    <option value="docx">Word (DOCX)</option>
                    <option value="zip">Archive (ZIP)</option>
                    <option value="xlsx">Excel (XLSX)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Year Level</label>
                  <select
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(y => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</label>
                  <select
                    value={uploadSem}
                    onChange={(e) => setUploadSem(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {[1, 2, 3].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Choose File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="mt-1 block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/40 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
              </div>

              {/* Dynamic Tutorial/Learning Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Useful Learning References / Links (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addUploadLinkField}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Link
                  </button>
                </div>
                {uploadLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. YouTube Tutorial"
                      value={link.label}
                      onChange={(e) => handleUploadLinkChange(idx, 'label', e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <input
                      type="url"
                      placeholder="e.g. https://youtube.com/..."
                      value={link.url}
                      onChange={(e) => handleUploadLinkChange(idx, 'url', e.target.value)}
                      className="flex-1.5 rounded-lg border border-slate-200 p-2 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                    {uploadLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUploadLinkField(idx)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 text-sm transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Submit Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
