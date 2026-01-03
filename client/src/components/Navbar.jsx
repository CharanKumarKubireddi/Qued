import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, PenTool, Shield, User } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudent = !isTeacher && !isAdmin;

  const isActive = (path) => location.pathname === path
    ? "text-blue-600 font-bold bg-blue-50/50 rounded-lg px-3 py-1.5"
    : "text-gray-600 font-medium hover:text-blue-600 px-3 py-1.5 transition";

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/40 shadow-sm backdrop-blur-md bg-white/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

        {/* --- CHANGED: LOGO SECTION --- */}
        <Link to="/" className="flex items-center hover:opacity-80 transition h-full">
          <img
            src="/logo-transparent.png"  // Make sure this is your TRANSPARENT image in the public folder
            alt="Qued Logo"
            className="h-16 w-auto object-contain" // h-16 makes it nice and big
          />
        </Link>
        {/* ----------------------------- */}

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={isActive('/')}>Home</Link>

          {/* STUDENT LINKS */}
          {isStudent && (
            <>
              <Link to="/courses" className={isActive('/courses')}>Browse</Link>
              <SignedIn>
                <Link to="/dashboard" className={isActive('/dashboard')}>My Learning</Link>
              </SignedIn>
            </>
          )}

          <SignedIn>
            {/* TEACHER LINK */}
            {isTeacher && (
              <Link to="/teacher" className={`flex items-center gap-1 ${isActive('/teacher')}`}>
                <PenTool size={16} /> Teach
              </Link>
            )}

            {/* ADMIN LINK */}
            {isAdmin && (
              <Link to="/admin" className={`flex items-center gap-1 ${isActive('/admin')}`}>
                <Shield size={16} /> Admin
              </Link>
            )}

            {/* SHARED LINKS */}
            <Link to="/profile" className={isActive('/profile')}>Profile</Link>

            {/* CART (Students Only) */}
            {isStudent && (
              <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600 transition relative mx-1" title="Cart">
                <ShoppingCart size={22} />
              </Link>
            )}

            {/* USER INFO SECTION */}
            <div className="ml-3 pl-4 border-l border-gray-300 flex items-center gap-4">
              
              {/* ROLE BADGE */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                 isTeacher ? "bg-purple-100 text-purple-700" : 
                 isAdmin ? "bg-red-100 text-red-700" : 
                 "bg-blue-100 text-blue-700"
              }`}>
                 {isAdmin ? "Admin" : (isTeacher ? "Instructor" : "Student")}
              </div>

              {/* CLERK BUTTON */}
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold transition">Log In</Link>
              <Link to="/role-selection">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Get Started
                </button>
              </Link>
            </div>
          </SignedOut>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden text-gray-600 p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 shadow-xl absolute w-full left-0 animate-fade-in z-50">
           <Link to="/" className="block text-gray-700 font-medium p-2 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>Home</Link>
           
           {isStudent && (
             <Link to="/courses" className="block text-gray-700 font-medium p-2 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>Browse</Link>
           )}

           <SignedIn>
             {isStudent && <Link to="/dashboard" className="block text-blue-600 font-medium p-2 hover:bg-blue-50 rounded" onClick={() => setIsOpen(false)}>My Learning</Link>}
             {isTeacher && <Link to="/teacher" className="block text-blue-600 font-medium p-2 hover:bg-blue-50 rounded" onClick={() => setIsOpen(false)}>Instructor Studio</Link>}
             
             <Link to="/profile" className="block text-gray-600 font-medium p-2 hover:bg-gray-50 rounded" onClick={() => setIsOpen(false)}>My Profile</Link>
             
             <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-4">
               <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded text-gray-500">
                 {isTeacher ? "Instructor" : "Student"}
               </span>
               <UserButton afterSignOutUrl="/" />
             </div>
           </SignedIn>
           <SignedOut>
             <div className="space-y-3 pt-2">
               <Link to="/login" onClick={() => setIsOpen(false)}><button className="w-full border border-gray-300 py-3 rounded-xl font-bold text-gray-700">Log In</button></Link>
               <Link to="/role-selection" onClick={() => setIsOpen(false)}><button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md">Get Started</button></Link>
             </div>
           </SignedOut>
        </div>
      )}
    </nav>
  );
};

export default Navbar;