import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  timezone: { type: String, default: 'UTC' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
