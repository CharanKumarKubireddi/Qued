import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, SignIn, SignUp, useAuth, useUser } from "@clerk/clerk-react";
import axios from 'axios';

// Pages
import Navbar from "./components/Navbar";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CoursePage from "./pages/CoursePage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import Courses from './pages/Courses';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; 
import VideoPage from "./pages/VideoPage"; 
import SelectRole from "./pages/SelectRole"; 

const App = () => {
  const { getToken, isSignedIn } = useAuth();
  const { isLoaded } = useUser(); // Clerk's loading state
  
  const [dbUser, setDbUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true); // [NEW] Track MongoDB Sync

  useEffect(() => {
    const syncUser = async () => {
      // 1. Wait for Clerk to load first
      if (!isLoaded) return;

      // 2. If user is logged out, stop syncing immediately
      if (!isSignedIn) {
        setDbUser(null);
        setIsSyncing(false);
        return;
      }

      // 3. If logged in, fetch Mongo User
      try {
        const token = await getToken();
        
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDbUser(res.data);
        } catch (err) {
          // If 404 (User not found in DB), create them with SELECTED ROLE
          if (err.response && err.response.status === 404) {
             const storedRole = localStorage.getItem('selectedRole') || 'student';
             
             const createRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/sync`, 
               { role: storedRole }, 
               { headers: { Authorization: `Bearer ${token}` } }
             );
             
             setDbUser(createRes.data);
             localStorage.removeItem('selectedRole'); // Cleanup
          }
        }
      } catch (error) {
        console.error("Sync failed", error);
      } finally {
        // [NEW] Sync is done (success or fail), safe to render routes now
        setIsSyncing(false); 
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, getToken]);

  // [NEW] GLOBAL LOADING GUARD
  // This prevents the "Refresh -> Redirect" bug by waiting until 
  // BOTH Clerk (isLoaded) and MongoDB (isSyncing) are ready.
  if (!isLoaded || isSyncing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold text-lg">
        <div className="animate-pulse">Loading App...</div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <Routes>
        {/* Hide Navbar on Video Page */}
        <Route path="/video/*" element={null} /> 
        <Route path="*" element={<Navbar user={dbUser} />} />
      </Routes>

      <Routes>
        <Route path="/" element={<Home user={dbUser} />} />
        <Route path="/courses" element={<Courses />} />
        
        {/* [UPDATED] CHANGED forceRedirectUrl TO "/" (Home) */}
        <Route path="/login/*" element={<div className="flex justify-center h-screen pt-20"><SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl="/"/></div>} />
        <Route path="/register/*" element={<div className="flex justify-center h-screen pt-20"><SignUp routing="path" path="/register" signInUrl="/login" forceRedirectUrl="/"/></div>} />
        
        {/* NEW ROLE SELECTION PAGE */}
        <Route path="/role-selection" element={<SelectRole />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>{dbUser ? <Dashboard user={dbUser} /> : <div className="p-20 text-center">Loading...</div>}</SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />
        <Route
          path="/course/:id"
          element={
            <>
              <SignedIn>{dbUser ? <CoursePage user={dbUser} /> : <div className="p-20 text-center">Loading...</div>}</SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />
        
        <Route
          path="/video/:courseId/:lectureIdx"
          element={
            <>
              <SignedIn>{dbUser ? <VideoPage user={dbUser} /> : <div className="bg-gray-900 h-screen text-white p-20 text-center">Loading Class...</div>}</SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />

        <Route
          path="/teacher"
          element={
            <>
              <SignedIn>{dbUser ? <TeacherDashboard user={dbUser} /> : <div className="p-20 text-center">Loading...</div>}</SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />
        <Route
          path="/profile"
          element={
             <>
              <SignedIn>{dbUser ? <ProfilePage user={dbUser} /> : <div className="p-20 text-center">Loading...</div>}</SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              <SignedIn><CartPage /></SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              {/* Now checks role securely because we waited for sync */}
              <SignedIn>{dbUser?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />}</SignedIn>
              <SignedOut><Navigate to="/login" /></SignedOut>
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;