import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PenTool } from 'lucide-react';

const SelectRole = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // 1. Save choice to LocalStorage
    localStorage.setItem('selectedRole', role);
    // 2. Redirect to Clerk Register Page
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join SkillStream</h1>
        <p className="text-gray-500 mb-12 text-lg">How do you want to use the platform?</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* STUDENT CARD */}
          <button 
            onClick={() => handleRoleSelect('student')}
            className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-600 hover:shadow-xl transition group text-left"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm a Student</h2>
            <p className="text-gray-500">I want to browse courses, watch lessons, and learn new skills.</p>
          </button>

          {/* TEACHER CARD */}
          <button 
            onClick={() => handleRoleSelect('teacher')}
            className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-purple-600 hover:shadow-xl transition group text-left"
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <PenTool size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm an Instructor</h2>
            <p className="text-gray-500">I want to create courses, upload videos, and teach students.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;