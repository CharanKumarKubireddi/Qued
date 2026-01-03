import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Briefcase, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast'; // <--- Import Toast

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  // Removed local 'error' state in favor of Toast
  const [role, setRole] = useState('student');

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, { 
        name, email, password, role 
      });

      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(`Welcome to SkillStream, ${res.data.user.name}!`); // <--- Success Toast

      if (res.data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed'); // <--- Error Toast
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500">Join SkillStream today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* ROLE SELECTOR */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                role === 'student' ? 'bg-blue-50 border-blue-600 text-blue-600 ring-1 ring-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <GraduationCap size={24} />
              <span className="font-bold text-sm">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition ${
                role === 'teacher' ? 'bg-blue-50 border-blue-600 text-blue-600 ring-1 ring-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={24} />
              <span className="font-bold text-sm">Teacher</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" type="text" placeholder="John Doe" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input name="email" type="email" placeholder="john@example.com" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" placeholder="••••••••" className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition transform hover:scale-[1.02]">
            Sign Up as {role === 'teacher' ? 'Instructor' : 'Student'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;