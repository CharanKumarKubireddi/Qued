import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import { useCart } from '../context/CartContext'; 
import toast from 'react-hot-toast';
import { 
  PlayCircle, Lock, ShoppingCart, Check, Globe, 
  Award, FileText, Video, AlertCircle, Download
} from 'lucide-react';

const CoursePage = ({ user }) => { 
  const { id } = useParams();
  const { getToken } = useAuth();
  const { addToCart } = useCart(); 
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false); 

  const isEnrolled = course?.studentsEnrolled?.includes(user?._id);
  const isOwner = user?.role === 'teacher' && course?.instructorId === user?._id;
  const isAdmin = user?.role === 'admin';
  const canAccessResources = isEnrolled || isOwner || isAdmin;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`);
        const found = res.data.find(c => c._id === id);
        setCourse(found);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load course");
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // --- PAYMENT LOGIC ---
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async () => {
    if (!user) return toast.error("Please login to enroll");
    setEnrollLoading(true);
    
    try {
      const token = await getToken();
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded) {
        toast.error("Payment SDK failed to load.");
        setEnrollLoading(false);
        return;
      }

      // 1. Create Order
      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/checkout`, 
        { courseIds: [course._id] }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount } = orderRes.data;

      // 2. Razorpay Options
      const options = {
        key: "rzp_test_Rx7exkp3lmF0cN", // ✅ Your Test Key
        amount: amount * 100, 
        currency: "INR",
        name: "SkillStream",
        description: `Enrollment: ${course.title}`,
        order_id: orderId,
        handler: async function (response) {
           try {
              await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
                 courseIds: [course._id]
              }, { headers: { Authorization: `Bearer ${token}` } });

              toast.success("Welcome to the course!");
              window.location.reload(); 
           } catch (verifyErr) {
              toast.error("Payment Verification Failed");
           }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#111827" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error("Payment initiation failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!course) return <div className="p-20 text-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- 1. DARK HERO HEADER --- */}
      <div className="bg-[#1c1d1f] text-white py-10 lg:py-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-20 flex flex-col lg:flex-row gap-12">
          
          {/* Left Side Info */}
          <div className="lg:w-2/3 space-y-5">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-300">
               <span className="uppercase tracking-wider">{course.category}</span>
               <span>›</span>
               <span className="text-white">Overview</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{course.title}</h1>
            <p className="text-lg text-white leading-relaxed max-w-2xl">{course.description.substring(0, 150)}...</p>

            {/* REAL Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
               {course.studentsEnrolled?.length > 10 && (
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs">Bestseller</span>
               )}
               <span className="text-white font-medium">{course.studentsEnrolled?.length || 0} students enrolled</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-white pt-2">
               <span className="text-gray-300">Created by</span>
               <span className="underline text-purple-300 cursor-pointer">{course.instructorName}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-white">
               <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white rounded-full flex items-center justify-center"><AlertCircle size={10} className="text-black"/></div> Last updated recently</div>
               <div className="flex items-center gap-2"><Globe size={14}/> English</div>
            </div>
          </div>

        </div>
      </div>

      {/* --- 2. MAIN CONTENT & STICKY SIDEBAR --- */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
             
             {/* What you'll learn */}
             <div className="border border-gray-300 p-6 bg-white shadow-sm rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                   <div className="flex gap-2 items-start"><Check size={16} className="text-gray-800 shrink-0 mt-0.5"/> <span>Master the core concepts of {course.title}</span></div>
                   <div className="flex gap-2 items-start"><Check size={16} className="text-gray-800 shrink-0 mt-0.5"/> <span>Build real-world applications from scratch</span></div>
                   <div className="flex gap-2 items-start"><Check size={16} className="text-gray-800 shrink-0 mt-0.5"/> <span>Understand industry best practices</span></div>
                   <div className="flex gap-2 items-start"><Check size={16} className="text-gray-800 shrink-0 mt-0.5"/> <span>Get certified and job-ready</span></div>
                </div>
             </div>

             {/* Course Content */}
             <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Content</h2>
                <div className="text-sm text-gray-500 mb-2 flex gap-2">
                   <span>{course.lectures.length} lectures</span>
                </div>
                <div className="border border-gray-300 bg-white rounded-lg overflow-hidden">
                   {course.lectures.map((lec, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <Video size={16} className="text-gray-500"/>
                            <span className="text-gray-800 text-sm group-hover:text-blue-600 group-hover:underline">{lec.title}</span>
                         </div>
                         <div className="text-gray-500 text-xs flex gap-4 items-center">
                            {isEnrolled ? (
                               <Link to={`/video/${course._id}/${i}`} className="text-blue-600 font-bold hover:underline">Play</Link>
                            ) : <Lock size={14}/>}
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* --- PDF RESOURCES SECTION (FIXED & VISIBLE) --- */}
             {course.pdfNotes?.length > 0 && (
                <div>
                   <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Resources</h2>
                   <div className="grid gap-2">
                      {canAccessResources ? (
                         course.pdfNotes.map((note, idx) => (
                            <a 
                               key={idx} 
                               href={note.url} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition group"
                            >
                               <div className="flex items-center gap-3">
                                  <FileText className="text-red-500" size={20}/>
                                  <span className="font-medium text-gray-700 group-hover:text-blue-600">{note.title}</span>
                               </div>
                               <Download size={16} className="text-gray-400 group-hover:text-blue-600"/>
                            </a>
                         ))
                      ) : (
                         <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                            <Lock className="mx-auto text-gray-400 mb-2" size={24}/>
                            <p className="font-bold text-gray-700">Resources Locked</p>
                            <p className="text-sm text-gray-500">Enroll in the course to access {course.pdfNotes.length} downloadable files.</p>
                         </div>
                      )}
                   </div>
                </div>
             )}

             {/* Description */}
             <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
                <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                   {course.description}
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN (FLOATING CARD) */}
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-24">
                <div className="bg-white shadow-xl border border-gray-200 overflow-hidden lg:-mt-96 z-30 relative w-full max-w-sm mx-auto lg:mx-0 rounded-lg">
                   
                   {/* Video Preview Area (FIXED: Native Player) */}
                   <div className="relative bg-black aspect-video">
                      {course.previewVideo ? (
                         <video 
                            src={course.previewVideo} 
                            className="w-full h-full object-contain" 
                            controls 
                            controlsList="nodownload"
                         />
                      ) : (
                         <div className="relative w-full h-full">
                            <img src={course.image} className="w-full h-full object-cover opacity-80" alt="preview" />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <PlayCircle size={40} className="text-white drop-shadow-md"/>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>

                   <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                         <span className="text-3xl font-bold text-gray-900">₹{course.price}</span>
                         <span className="text-gray-500 line-through text-md">₹{course.price * 5}</span>
                         <span className="text-green-600 text-md font-bold">80% off</span>
                      </div>

                      {/* Buy Buttons */}
                      <div className="space-y-3">
                         {isEnrolled ? (
                            <Link to={`/video/${course._id}/0`}>
                               <button className="w-full bg-purple-600 text-white py-3 font-bold hover:bg-purple-700 transition rounded-md">
                                  Go to Course
                               </button>
                            </Link>
                         ) : (
                            <>
                               <button 
                                  onClick={handleEnroll} 
                                  disabled={enrollLoading}
                                  className="w-full bg-purple-600 text-white py-3 font-bold hover:bg-purple-700 transition rounded-md disabled:opacity-70"
                               >
                                  {enrollLoading ? 'Processing...' : 'Buy Now'}
                               </button>
                               <button 
                                  onClick={() => addToCart(course)}
                                  className="w-full border border-gray-800 text-gray-800 py-3 font-bold hover:bg-gray-50 transition rounded-md"
                               >
                                  Add to Cart
                               </button>
                            </>
                         )}
                      </div>

                      <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
                         <p>7-Day Money-Back Guarantee</p>
                         <p>Full Lifetime Access</p>
                         <p>Access on Mobile and TV</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoursePage;