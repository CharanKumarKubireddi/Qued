import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Layout, DollarSign, Image as ImageIcon, UploadCloud, Video, FileText, Edit, X } from 'lucide-react';

const TeacherDashboard = ({ user }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // State for List of My Courses
  const [myCourses, setMyCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [course, setCourse] = useState({
    title: '', description: '', price: '', category: 'Development',
    image: '', previewVideo: '', lectures: [], pdfNotes: []
  });

  const [newLecture, setNewLecture] = useState({ title: '', videoUrl: '', duration: '' });

  // 1. Fetch Teacher's Courses on Load
  const fetchMyCourses = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/stats`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      setMyCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);


  // --- HELPERS ---
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (type === 'thumbnail') setCourse(prev => ({ ...prev, image: res.data.url }));
      else if (type === 'preview') setCourse(prev => ({ ...prev, previewVideo: res.data.url }));
      else if (type === 'pdf') {
         setCourse(prev => ({ ...prev, pdfNotes: [...prev.pdfNotes, { title: file.name, url: res.data.url }] }));
      } else if (type === 'video') setNewLecture(prev => ({ ...prev, videoUrl: res.data.url }));
      
      toast.success("Uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLecture = () => {
    if (!newLecture.title || !newLecture.videoUrl) return toast.error("Add title and video");
    setCourse({ ...course, lectures: [...course.lectures, newLecture] });
    setNewLecture({ title: '', videoUrl: '', duration: '' }); 
  };

  const handleRemoveItem = (index, type) => {
    if (type === 'lecture') {
      const updated = course.lectures.filter((_, i) => i !== index);
      setCourse({ ...course, lectures: updated });
    } else if (type === 'pdf') {
      const updated = course.pdfNotes.filter((_, i) => i !== index);
      setCourse({ ...course, pdfNotes: updated });
    }
  };

  // --- ACTIONS: EDIT & DELETE ---
  const handleEditClick = (c) => {
    setIsEditing(true);
    setEditingId(c._id);
    setCourse(c); // Populate form
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setCourse({ title: '', description: '', price: '', category: 'Development', image: '', previewVideo: '', lectures: [], pdfNotes: [] });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
        const token = await getToken();
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Course Deleted");
        fetchMyCourses(); // Refresh list
    } catch (err) {
        toast.error("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      
      if (isEditing) {
         // UPDATE EXISTING
         await axios.put(`${import.meta.env.VITE_API_URL}/api/courses/${editingId}`, course, {
            headers: { Authorization: `Bearer ${token}` }
         });
         toast.success("Course Updated!");
         setIsEditing(false);
         setEditingId(null);
      } else {
         // CREATE NEW
         await axios.post(`${import.meta.env.VITE_API_URL}/api/courses`, course, {
            headers: { Authorization: `Bearer ${token}` }
         });
         toast.success("Course Published!");
      }
      
      // Reset & Refresh
      setCourse({ title: '', description: '', price: '', category: 'Development', image: '', previewVideo: '', lectures: [], pdfNotes: [] });
      fetchMyCourses();

    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* --- HERO BANNER (Added for consistency) --- */}
      <div className="bg-[#1e293b] text-white pt-12 pb-24 px-6 relative">
         <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold flex items-center gap-3">
               <Layout className="text-blue-400" /> Instructor Studio
            </h1>
            <p className="text-gray-400 mt-2 ml-10">Create, manage, and publish your courses.</p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 space-y-12">
        
        {/* --- MAIN FORM --- */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* EDITING BANNER */}
          {isEditing && (
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex justify-between items-center text-yellow-800 shadow-sm">
                <span className="font-bold flex items-center gap-2"><Edit size={18}/> Editing: {course.title}</span>
                <button type="button" onClick={handleCancelEdit} className="text-sm font-bold underline hover:text-red-600">Cancel Edit</button>
             </div>
          )}

          {/* 1. DETAILS FORM */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">Course Details</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                <input type="text" required placeholder="e.g. Advanced React Patterns" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" value={course.title} onChange={e => setCourse({...course, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={course.category} onChange={e => setCourse({...course, category: e.target.value})}>
                      <option>Development</option><option>Design</option><option>Business</option><option>Marketing</option><option>Others</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                    <input type="number" required placeholder="499" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={course.price} onChange={e => setCourse({...course, price: e.target.value})} />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea required className="w-full border border-gray-300 p-3 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="What will students learn..." value={course.description} onChange={e => setCourse({...course, description: e.target.value})} />
              </div>
              
              {/* Media Uploads */}
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                 <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Thumbnail</label>
                    <div className="flex items-center gap-3">
                       <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 px-4 py-3 rounded-xl text-sm font-medium flex-1 text-center transition flex items-center justify-center gap-2 text-gray-600">
                          <ImageIcon size={18} /> {course.image ? "Change Image" : "Upload Image"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                       </label>
                       {course.image && <img src={course.image} className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"/>}
                    </div>
                 </div>
                 <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Preview Video</label>
                     <label className={`cursor-pointer border border-dashed px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 w-full transition ${course.previewVideo ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-600'}`}>
                          <Video size={18}/> {course.previewVideo ? "Video Uploaded" : "Upload Preview"}
                          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'preview')} />
                     </label>
                 </div>
              </div>
            </div>
          </div>

          {/* 2. CURRICULUM & RESOURCES */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">Curriculum & Resources</h2>
             
             {/* Lectures List */}
             <div className="space-y-3 mb-6">
                {course.lectures.length === 0 && <p className="text-sm text-gray-400 italic">No lectures added yet.</p>}
                {course.lectures.map((l, i) => (
                   <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-800 text-sm flex items-center gap-3">
                        <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs border border-gray-200 shadow-sm">{i+1}</span> 
                        {l.title}
                      </span>
                      <button type="button" onClick={() => handleRemoveItem(i, 'lecture')} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18}/></button>
                   </div>
                ))}
             </div>
             
             {/* Add Lecture */}
             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-8">
                <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-3 block">Add New Lecture</label>
                <div className="flex flex-col sm:flex-row gap-3">
                   <input placeholder="Lecture Title" className="border border-gray-300 p-3 rounded-lg flex-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newLecture.title} onChange={e => setNewLecture({...newLecture, title: e.target.value})} />
                   <div className="flex gap-2">
                       <input placeholder="Dur." className="border border-gray-300 p-3 rounded-lg w-20 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newLecture.duration} onChange={e => setNewLecture({...newLecture, duration: e.target.value})} />
                       <label className={`cursor-pointer p-3 rounded-lg border flex items-center justify-center transition ${newLecture.videoUrl ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-500'}`}>
                         <UploadCloud size={20}/>
                         <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')}/>
                       </label>
                       <button type="button" onClick={handleAddLecture} className="bg-gray-900 hover:bg-black text-white p-3 rounded-lg transition shadow-md"><Plus size={20}/></button>
                   </div>
                </div>
             </div>

             {/* PDFs */}
             <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-sm text-gray-700">PDF Notes</h3>
                   <label className="cursor-pointer text-blue-600 text-sm font-bold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                      <Plus size={14}/> Add PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'pdf')} />
                   </label>
                </div>
                <div className="space-y-2">
                    {course.pdfNotes.length === 0 && <p className="text-sm text-gray-400 italic">No notes added.</p>}
                    {course.pdfNotes.map((n, i) => (
                       <div key={i} className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800">
                          <span className="flex items-center gap-2 font-medium"><FileText size={16}/> {n.title}</span>
                          <button type="button" onClick={() => handleRemoveItem(i, 'pdf')} className="text-orange-400 hover:text-red-500 transition"><X size={16}/></button>
                       </div>
                    ))}
                </div>
             </div>
          </div>

          <button type="submit" disabled={loading || uploading} className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-[0.99] ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
            {loading ? 'Processing...' : (isEditing ? 'Update Course' : 'Publish Course')}
          </button>
        </form>

        {/* 4. LIST OF MY COURSES */}
        <div>
           <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-200">Your Published Courses</h2>
           {myCourses.length === 0 ? (
             <div className="text-gray-500 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <Layout className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>You haven't published anything yet.</p>
             </div>
           ) : (
             <div className="grid gap-4">
                {myCourses.map(c => (
                   <div key={c._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:border-blue-300 transition gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                            <img src={c.image || 'https://via.placeholder.com/50'} className="w-full h-full object-cover" alt="Course" />
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{c.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                               <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{c.category}</span>
                               <span>•</span>
                               <span className="text-green-600 font-bold">₹{c.price}</span>
                            </p>
                         </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                         <button onClick={() => handleEditClick(c)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => handleDelete(c._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;