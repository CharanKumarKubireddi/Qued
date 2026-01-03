import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, CheckCircle, User, Star } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  
  const [currentUser, setCurrentUser] = useState(null);
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const fetchCoursesAndUser = async () => {
      try {
        const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`);
        setCourses(courseRes.data);

        if (userId) {
          const token = await getToken();
          const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(userRes.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
        setLoading(false);
      }
    };
    fetchCoursesAndUser();
  }, [userId, getToken]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || course.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- 1. PROFESSIONAL BANNER WITH IMAGE BACKGROUND --- */}
      <div className="relative bg-blue-900 h-64 sm:h-80 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                alt="Banner" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center text-center z-10">
           <span className="text-blue-300 font-bold tracking-wider text-xs sm:text-sm uppercase mb-2">Grow your skills</span>
           <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
             Unlock Your Potential
           </h1>
           <p className="text-slate-200 text-sm sm:text-lg max-w-xl mx-auto">
             Access a library of top-tier courses taught by industry experts. Start learning today.
           </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 pb-20">
        
        {/* --- 2. COMPACT SEARCH BAR --- */}
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search for courses..." 
              className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-px sm:h-auto sm:w-px bg-gray-200"></div>
          <div className="relative min-w-[180px]">
             <select 
               className="w-full pl-4 pr-10 py-2.5 bg-transparent outline-none text-sm text-gray-700 cursor-pointer appearance-none"
               value={category}
               onChange={e => setCategory(e.target.value)}
             >
               <option>All Categories</option>
               <option>Development</option>
               <option>Design</option>
               <option>Business</option>
               <option>Marketing</option>
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* --- 3. COMPACT COURSE GRID (Smaller Cards) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => {
              const isEnrolled = currentUser && course.studentsEnrolled?.includes(currentUser._id);

              return (
                <Link to={`/course/${course._id}`} key={course._id} className="group">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    
                    {/* Compact Image (Reduced Height) */}
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        
                        {/* Tiny Badge */}
                        <div className="absolute top-2 left-2">
                            <span className="bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100 uppercase tracking-wider text-gray-700">
                            {course.category}
                            </span>
                        </div>
                    </div>

                    {/* Compact Content (Reduced Padding) */}
                    <div className="p-4 flex-1 flex flex-col">
                        
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-base group-hover:text-blue-600 transition-colors">
                            {course.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 mb-3">
                             <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {course.instructorName ? course.instructorName.charAt(0) : "I"}
                             </div>
                             <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                {course.instructorName || "Instructor"}
                             </span>
                        </div>

                        {/* Footer: Price & Status */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                            <span className="font-bold text-gray-900 text-lg">
                                {course.price === 0 ? 'Free' : `₹${course.price}`}
                            </span>
                            
                            {isEnrolled ? (
                                <span className="text-green-600 text-xs font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle size={12}/> Enrolled
                                </span>
                            ) : (
                                <span className="text-blue-600 text-xs font-bold group-hover:underline">
                                    View Details
                                </span>
                            )}
                        </div>
                    </div>
                    </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <BookOpen size={48} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Courses;