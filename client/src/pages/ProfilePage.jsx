import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Shield, BookOpen, DollarSign, Users, TrendingUp, Mail, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react"; 

const ProfilePage = ({ user }) => { 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const [stats, setStats] = useState({ totalStudents: 0, totalEarnings: 0, totalCourses: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; 

      try {
        const token = await getToken();
        
        if (user.role === 'teacher') {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setData(res.data); 

          let students = 0;
          let earnings = 0;
          res.data.forEach(course => {
            const count = course.studentsEnrolled?.length || 0;
            students += count;
            earnings += count * course.price;
          });

          setStats({
            totalStudents: students,
            totalEarnings: earnings,
            totalCourses: res.data.length
          });

        } else {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`);
          const myCourses = res.data.filter(course => 
            course.studentsEnrolled && course.studentsEnrolled.includes(user._id)
          );
          setData(myCourses);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, getToken]);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* --- HERO BANNER --- */}
      <div className="bg-[#1e293b] text-white pt-12 pb-24 px-6 relative">
         <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Account Overview</h1>
            <p className="text-gray-400">Manage your profile and view your activity.</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: PROFILE CARD --- */}
        <div className="lg:col-span-1 h-fit">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="px-6 pb-6 text-center -mt-12">
               <div className="w-24 h-24 bg-white p-1 rounded-full mx-auto shadow-md">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 uppercase">
                     {user.name?.charAt(0)}
                  </div>
               </div>
               
               <h2 className="text-xl font-bold text-gray-900 mt-4">{user.name}</h2>
               <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-1">
                  <Mail size={14}/> {user.email}
               </div>

               <div className="mt-6 flex justify-center">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${user.role === 'teacher' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                     {user.role} Account
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: DASHBOARD --- */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* TEACHER STATS GRID */}
           {user.role === 'teacher' && (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-32">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-blue-300 transition">
                   <div className="p-2 bg-green-50 text-green-600 rounded-full mb-2"><DollarSign size={20}/></div>
                   <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">Total Earnings</p>
                   <h3 className="text-xl font-extrabold text-gray-900 mt-1">₹{stats.totalEarnings}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-blue-300 transition">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-full mb-2"><Users size={20}/></div>
                   <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">Total Students</p>
                   <h3 className="text-xl font-extrabold text-gray-900 mt-1">{stats.totalStudents}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-blue-300 transition">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-full mb-2"><BookOpen size={20}/></div>
                   <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">Courses Published</p>
                   <h3 className="text-xl font-extrabold text-gray-900 mt-1">{stats.totalCourses}</h3>
                </div>
             </div>
           )}

           {/* CONTENT LIST */}
           {/* UPDATED: Added conditional mt-32 for student role to prevent overlap */}
           <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${user.role === 'student' ? 'mt-32' : ''}`}>
             <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   {user.role === 'teacher' ? <TrendingUp size={18} className="text-blue-600"/> : <BookOpen size={18} className="text-blue-600"/>}
                   {user.role === 'teacher' ? 'Course Performance' : 'Enrolled Courses'}
                </h3>
             </div>
             
             {loading ? <div className="p-10 text-center text-gray-400">Loading data...</div> : (
               data.length > 0 ? (
                 <div className="divide-y divide-gray-100">
                   {data.map(course => (
                     <div key={course._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition group">
                       <div className="flex items-center gap-4 mb-4 sm:mb-0">
                         <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                           {course.image ? <img src={course.image} className="w-full h-full object-cover" alt="thumb"/> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">{course.title}</h4>
                           <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{course.category}</span>
                              <span>•</span>
                              <span>₹{course.price}</span>
                           </p>
                         </div>
                       </div>
                       
                       {/* Action / Stats Area */}
                       {user.role === 'teacher' ? (
                         <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <span className="block font-bold text-gray-900">{course.studentsEnrolled?.length || 0}</span>
                              <span className="text-xs text-gray-400">Students</span>
                            </div>
                            <div className="text-center">
                              <span className="block font-bold text-green-600">₹{(course.studentsEnrolled?.length || 0) * course.price}</span>
                              <span className="text-xs text-gray-400">Revenue</span>
                            </div>
                         </div>
                       ) : (
                         <Link to={`/course/${course._id}`}>
                           <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm">
                             Continue Learning
                           </button>
                         </Link>
                       )}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <BookOpen size={24} className="text-gray-400"/>
                    </div>
                    <h3 className="text-gray-900 font-bold mb-1">No Activity Yet</h3>
                    <p className="text-gray-500 text-sm mb-4">{user.role === 'teacher' ? "You haven't published any courses." : "You haven't enrolled in any courses."}</p>
                    {user.role === 'student' && (
                       <Link to="/courses" className="text-blue-600 font-bold hover:underline text-sm">Browse Courses</Link>
                    )}
                 </div>
               )
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;