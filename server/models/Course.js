const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String, default: "0" }, // e.g. "10:05"
  freePreview: { type: Boolean, default: false },
});

// [NEW] Schema for PDF Files
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Original filename
  url: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  
  instructorId: { type: String, required: true },
  instructorName: { type: String, required: true },
  
  image: { type: String }, // Thumbnail
  
  // [NEW] Optional Preview Video (Free for all)
  previewVideo: { type: String, default: "" }, 
  
  lectures: [lectureSchema],
  
  // [NEW] PDF Notes
  pdfNotes: [noteSchema], 
  
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);