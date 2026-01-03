import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, PlayCircle, ArrowRight, Video } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react"; 

const Dashboard = ({ user }) => { 
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth(); 

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;

      try {
        const token = await getToken(); 
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
             headers: { Authorization: `Bearer ${token}` } 
        });
        
        const myCourses = res.data.filter(course => 
          course.studentsEnrolled && course.studentsEnrolled.includes(user._id)
        );
        setCourses(myCourses);
      } catch (err) {
        console.error("Error fetching courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, [user, getToken]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!user) return <div className="p-20 text-center font-bold text-red-500">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- 1. DASHBOARD HEADER --- */}
      <div className="bg-[#111827] text-white py-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight">My Learning</h1>
                    <p className="text-gray-400">Welcome back, <span className="text-white font-semibold">{user.name}</span>! Ready to continue?</p>
                </div>
                
                {/* Simple Stat */}
                <div className="flex items-center gap-4 bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-700">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <BookOpen size={20}/>
                    </div>
                    <div>
                        <p className="font-bold text-2xl text-white leading-none">{courses.length}</p>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mt-1">Enrolled Courses</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {courses.length === 0 ? (
             /* --- EMPTY STATE --- */
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                 <BookOpen size={40} className="text-blue-500" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses enrolled yet</h2>
               <p className="text-gray-500 mb-8 max-w-md">You haven't started any courses. Explore our library to find your next skill.</p>
               <Link to="/courses">
                 <button className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2">
                    Explore Courses <ArrowRight size={20}/>
                 </button>
               </Link>
             </div>
        ) : (
           /* --- COURSE GRID --- */
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <Link to={`/course/${course._id}`} key={course._id} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    
                    {/* Image with Play Overlay */}
                    <div className="h-44 bg-gray-900 relative overflow-hidden">
                      {course.image ? <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500" /> : null}
                      
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-[1px]">
                         <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-2xl border border-white/30">
                            <PlayCircle size={32} className="text-white fill-current" />
                         </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {course.title}
                      </h3>
                      
                      <div className="text-xs text-gray-500 mb-6 flex items-center gap-2">
                         <span>{course.instructorName || "Instructor"}</span> 
                         <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <span className="flex items-center gap-1"><Video size={12}/> {course.lectures?.length || 0} Lessons</span>
                      </div>

                      {/* Action Button */}
                      <button className="w-full mt-auto bg-gray-50 border border-gray-200 text-gray-900 py-3 rounded-lg font-bold text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                          <PlayCircle size={16}/> Continue Learning
                      </button>
                    </div>
                  </div>
              </Link>
            ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;