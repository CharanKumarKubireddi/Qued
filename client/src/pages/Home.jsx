import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Video, Award, CheckCircle, ArrowRight, LayoutDashboard, Star, Users } from 'lucide-react';

const Home = ({ user }) => {
  return (
    <div className="bg-white dark:bg-gray-900 font-sans transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <header className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pb-32 pt-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-700 text-blue-200">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              New: Instructor Studio is Live!
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Master New Skills <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">
                Build Your Future
              </span>
            </h1>
            
            <p className="text-xl text-blue-100/90 max-w-lg leading-relaxed">
              Unlock your potential with expert-led video courses in coding, design, business, and marketing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {user ? (
                <Link to="/dashboard">
                  <button className="w-full sm:w-auto bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                    <LayoutDashboard size={22} /> Go to Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <button className="w-full sm:w-auto bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-400 transition shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1">
                      Get Started Free
                    </button>
                  </Link>
                  <Link to="/courses">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/30 hover:bg-white/10 transition flex items-center justify-center gap-2">
                      Browse Courses <ArrowRight size={20} />
                    </button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-blue-200/80 pt-4">
               <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-blue-900"></div>)}
               </div>
               <p>Joined by 10,000+ students</p>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-40 transform rotate-6"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80" 
              alt="Learning" 
              className="relative rounded-2xl shadow-2xl border-4 border-white/10 transform hover:scale-[1.02] transition duration-500 object-cover h-[500px] w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
               <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-600 dark:text-green-300"><CheckCircle /></div>
               <div>
                 <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Success Rate</p>
                 <p className="text-gray-900 dark:text-white font-bold text-lg">98%</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FLOATING STATS */}
      <section className="relative -mt-16 max-w-6xl mx-auto px-6 z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 p-10 border border-gray-100 dark:border-gray-700 text-center transition-colors duration-300">
          <div className="space-y-1">
            <Users className="mx-auto text-blue-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">10k+</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Active Students</p>
          </div>
          <div className="space-y-1">
            <Video className="mx-auto text-purple-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">500+</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Video Courses</p>
          </div>
          <div className="space-y-1">
            <Award className="mx-auto text-orange-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">120+</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Expert Instructors</p>
          </div>
          <div className="space-y-1">
            <Star className="mx-auto text-yellow-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">4.9</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Average Rating</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Qued?</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">We provide the tools and resources you need to upgrade your career and skills.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Video, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-gray-800", title: "HD Video Content", desc: "Learn at your own pace with high-definition video lectures available on any device." },
            { icon: BookOpen, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-gray-800", title: "Resources & Notes", desc: "Access downloadable PDF notes, source code, and project files for every lesson." },
            { icon: Award, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-gray-800", title: "Certification", desc: "Earn certificates of completion to showcase your new skills to employers." }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-xl hover:shadow-blue-500/5 transition duration-300 group bg-white dark:bg-gray-800">
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300`}>
                <feature.icon className={feature.color} size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOOTER - UPDATED LOGO SIZE */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <img 
               src="/logo-transparent.png" 
               alt="Qued Logo" 
               className="h-16 w-auto object-contain" // Changed from h-10 to h-16
             />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">© 2026 Qued Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;