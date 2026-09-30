import mongoose from 'mongoose';

const focusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true, validate: { validator: function(value) { return !this.startedAt || value >= this.startedAt; }, message: 'End must follow start' } },
  durationMinutes: { type: Number, required: true, min: 1, max: 1440, validate: Number.isInteger },
  completed: { type: Boolean, default: true }
}, { timestamps: true });
export const FocusSession = mongoose.model('FocusSession', focusSchema);
