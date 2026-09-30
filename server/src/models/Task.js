import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  type: { type: String, enum: ['study', 'assignment', 'reading', 'revision', 'practice'], default: 'study' },
  scheduledDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  scheduledTime: { type: String, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/ },
  estimateMinutes: { type: Number, required: true, min: 1, max: 1440, validate: Number.isInteger },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  completedAt: { type: Date, default: null }
}, { timestamps: true });
taskSchema.index({ userId: 1, scheduledDate: 1 });
taskSchema.index({ userId: 1, subjectId: 1 });
export const Task = mongoose.model('Task', taskSchema);
