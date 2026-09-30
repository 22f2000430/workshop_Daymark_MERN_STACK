import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  color: { type: String, default: '#9dc9df', match: /^#[0-9a-fA-F]{6}$/ },
  weeklyGoalMinutes: { type: Number, default: 120, min: 0, validate: Number.isInteger }
}, { timestamps: true });
subjectSchema.index({ userId: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
export const Subject = mongoose.model('Subject', subjectSchema);
