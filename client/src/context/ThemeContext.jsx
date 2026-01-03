import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check localStorage or system preference on load
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import toast from 'react-hot-toast';
import { Shield, Users, BookOpen, PenTool, Trash2, TrendingUp, X } from 'lucide-react';

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('courses'); 
  
  // MODAL STATE
  const [modalData, setModalData] = useState(null); 
  const [modalTitle, setModalTitle] = useState(""); 

  const [stats, setStats] = useState({ totalUsers: 0, totalInstructors: 0, totalStudents: 0, totalCourses: 0 });
  const [lists, setLists] = useState({ instructors: [], students: [], courses: [] });

  const fetchAdminData = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setLists(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load admin data");
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleDelete = async (id, type) => {
      if(!window.confirm("Are you sure? This action is permanent.")) return;
      try {
          const token = await getToken();
          const endpoint = type === 'course' 
             ? `${import.meta.env.VITE_API_URL}/api/courses/${id}` 
             : `${import.meta.env.VITE_API_URL}/api/admin/user/${id}`;
          
          await axios.delete(endpoint, { headers: { Authorization: `Bearer ${token}` }});
          toast.success("Deleted Successfully");
          fetchAdminData(); 
      } catch (err) {
          toast.error("Delete Failed");
      }
  }

  // --- HANDLERS FOR MODAL ---
  const openUploadedCourses = (titles) => {
     setModalTitle("Uploaded Courses");
     setModalData(titles);
  };

  const openEnrolledCourses = (titles) => {
     setModalTitle("Enrolled Courses");
     setModalData(titles);
  };

  const openStudentList = (students) => {
     setModalTitle("Enrolled Students");
     setModalData(students.map(s => `${s.name} (${s.email})`));
  };

  if (loading) return <div className="p-20 text-center text-orange-600 font-bold">Loading Admin Portal...</div>;

  return (
    <div className="min-h-screen bg-orange-50/50 p-8">
      
      {/* --- UNIVERSAL MODAL --- */}
      {modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl m-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
                 <button onClick={() => setModalData(null)} className="p-1 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                 {modalData.length > 0 ? (
                    modalData.map((item, i) => (
                       <div key={i} className="p-3 bg-gray-50 text-gray-800 rounded-lg font-medium text-sm border border-gray-100 flex items-start gap-2">
                          <span className="text-gray-400 text-xs mt-0.5">{i+1}.</span>
                          <span className="break-all">{item}</span>
                       </div>
                    ))
                 ) : (
                    <p className="text-gray-500 text-center py-4 italic">List is empty.</p>
                 )}
              </div>
              
              <button onClick={() => setModalData(null)} className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">Close</button>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER & STATS (Same as before) */}
        <div className="mb-10 flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Shield className="text-orange-600 fill-orange-100" size={32} /> Admin Portal</h1>
              <p className="text-gray-500 mt-1">Platform Overview & Management</p>
           </div>
           <div className="bg-white px-4 py-2 rounded-full border border-orange-100 shadow-sm text-sm font-bold text-orange-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> System Online
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           <StatCard icon={<Users/>} label="Total Users" value={stats.totalUsers} color="bg-blue-50 text-blue-600" />
           <StatCard icon={<PenTool/>} label="Instructors" value={stats.totalInstructors} color="bg-purple-50 text-purple-600" />
           <StatCard icon={<BookOpen/>} label="Active Students" value={stats.totalStudents} color="bg-green-50 text-green-600" />
           <StatCard icon={<TrendingUp/>} label="Total Courses" value={stats.totalCourses} color="bg-orange-100 text-orange-600" />
        </div>

        {/* MAIN TABLE AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
           <div className="flex border-b border-gray-100">
              <TabButton active={tab === 'courses'} onClick={() => setTab('courses')} label="Courses & Enrollments" />
              <TabButton active={tab === 'students'} onClick={() => setTab('students')} label="Students & Activity" />
              <TabButton active={tab === 'instructors'} onClick={() => setTab('instructors')} label="Instructors" />
           </div>

           <div className="p-6">
              
              {/* 1. COURSES TABLE */}
              {tab === 'courses' && (
                 <Table 
                   headers={['Course', 'Instructor', 'Price', 'Enrollments', 'Action']}
                   rows={lists.courses.map(course => [
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0"><img src={course.image} className="w-full h-full object-cover"/></div>
                         <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[150px]">{course.title}</p>
                            <p className="text-xs text-gray-500">{course.category}</p>
                         </div>
                      </div>,
                      <div><div className="font-bold text-gray-900">{course.instructorName}</div><div className="text-xs text-gray-500">{course.instructorEmail}</div></div>,
                      
                      /* [UPDATED] Currency Symbol */
                      `₹${course.price}`,
                      
                      <button 
                        onClick={() => openStudentList(course.studentsEnrolled)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full text-sm font-bold border border-blue-200 transition"
                      >
                         {course.studentsEnrolled?.length || 0} Students (View)
                      </button>,
                      <button onClick={() => handleDelete(course._id, 'course')} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                   ])}
                 />
              )}

              {/* 2. STUDENTS TABLE */}
              {tab === 'students' && (
                 <Table 
                   headers={['Student Name', 'Email', 'Courses Taken', 'Action']}
                   rows={lists.students.map(user => [
                      <div className="font-bold text-gray-900">{user.name}</div>,
                      user.email,
                      <button 
                        onClick={() => openEnrolledCourses(user.enrolledCourseTitles)}
                        className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded-full text-sm font-bold border border-green-200 transition"
                      >
                         {user.enrolledCount || 0} Courses (View)
                      </button>,
                      <button onClick={() => handleDelete(user._id, 'user')} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                   ])}
                 />
              )}

              {/* 3. INSTRUCTORS TABLE */}
              {tab === 'instructors' && (
                 <Table 
                   headers={['Name', 'Email', 'Uploaded', 'Action']}
                   rows={lists.instructors.map(user => [
                      <div className="font-bold text-gray-900">{user.name}</div>,
                      user.email,
                      <button 
                        onClick={() => openUploadedCourses(user.courseTitles)}
                        className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1 rounded-full text-sm font-bold border border-orange-200 transition"
                      >
                         {user.coursesUploaded} Courses (View)
                      </button>,
                      <button onClick={() => handleDelete(user._id, 'user')} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                   ])}
                 />
              )}

           </div>
        </div>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
     <div><h3 className="text-2xl font-bold text-gray-900">{value}</h3><p className="text-sm text-gray-500">{label}</p></div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-8 py-4 font-bold text-sm transition border-b-2 ${active ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{label}</button>
);

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto">
     <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
           <tr className="border-b border-gray-100">
              {headers.map((h, i) => <th key={i} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}
           </tr>
        </thead>
        <tbody>
           {rows.length > 0 ? rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/30 transition">
                 {row.map((cell, j) => <td key={j} className="p-4 text-sm text-gray-600 align-middle">{cell}</td>)}
              </tr>
           )) : (
              <tr><td colSpan={headers.length} className="p-10 text-center text-gray-400">No data found</td></tr>
           )}
        </tbody>
     </table>
  </div>
);

export default AdminDashboard;
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};