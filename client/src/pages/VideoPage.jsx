import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, PlayCircle, CheckCircle, Clock, Menu } from 'lucide-react';

const VideoPage = ({ user }) => {
  const { courseId, lectureIdx } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Toggle sidebar for "Theater Mode"
  
  // Ref to auto-scroll to active lesson
  const activeLessonRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`);
        const found = res.data.find(c => c._id === courseId);
        
        if (found) {
          const isEnrolled = found.studentsEnrolled?.includes(user?._id);
          const isTeacher = user?.role === 'teacher';
          const isAdmin = user?.role === 'admin';

          if (!isEnrolled && !isTeacher && !isAdmin) {
             alert("You must enroll to watch this.");
             navigate(`/course/${courseId}`);
             return;
          }

          setCourse(found);
          setCurrentLecture(found.lectures[lectureIdx]);
        }
      } catch (err) {
        console.error("Error loading video");
      }
    };
    if (user) fetchCourse();
  }, [courseId, lectureIdx, user, navigate]);

  // Scroll to active lesson when loaded
  useEffect(() => {
    if (activeLessonRef.current) {
      activeLessonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLecture]);

  if (!course || !currentLecture) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading Class...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      
      {/* LEFT: Video Player Main Area */}
      <div className="flex-1 flex flex-col relative transition-all duration-300">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-800 bg-gray-900 flex items-center px-6 justify-between shadow-md z-20">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-0.5">{course.title}</h1>
              <h2 className="font-bold text-lg leading-none truncate max-w-md">{currentLecture.title}</h2>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition"
          >
            {sidebarOpen ? 'Focus Mode' : 'Show Lessons'} <Menu size={18} />
          </button>
        </div>
        
        {/* VIDEO PLAYER CONTAINER */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden group">
          <video 
            key={currentLecture._id || lectureIdx} 
            className="w-full h-full max-h-[85vh] object-contain focus:outline-none"
            controls 
            autoPlay
            controlsList="nodownload"
            src={currentLecture.videoUrl}
            onError={(e) => {
               // Fallback if video fails
               e.target.onerror = null; 
               e.target.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* RIGHT: Playlist Sidebar */}
      <div className={`
          bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'}
      `}>
        <div className="p-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <h2 className="font-bold text-lg mb-1">Course Content</h2>
          <p className="text-xs text-gray-400 font-medium">{course.lectures.length} Lessons</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {course.lectures.map((lec, idx) => {
            const isActive = idx === parseInt(lectureIdx);
            return (
              <Link key={idx} to={`/video/${courseId}/${idx}`}>
                <div 
                  ref={isActive ? activeLessonRef : null}
                  className={`
                    p-4 border-b border-gray-700/50 hover:bg-gray-700/50 transition cursor-pointer flex gap-4 group
                    ${isActive ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                  `}
                >
                  <div className="mt-1">
                    {isActive ? (
                      <PlayCircle size={18} className="text-blue-400 fill-blue-400/20" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-600 group-hover:border-gray-400 transition" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate mb-1 ${isActive ? 'text-blue-200' : 'text-gray-300 group-hover:text-white'}`}>
                      {idx + 1}. {lec.title}
                    </h3>
                    
                    {/* DURATION: Only shows if it exists! */}
                    {lec.duration && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{lec.duration} mins</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default VideoPage;