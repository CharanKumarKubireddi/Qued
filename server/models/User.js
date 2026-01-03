const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // <--- NEW FIELD
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  // We don't need 'password' anymore because Clerk handles it!
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);