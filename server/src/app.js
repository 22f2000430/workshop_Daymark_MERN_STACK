import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Subject } from './models/Subject.js';
import { Task } from './models/Task.js';
import { FocusSession } from './models/FocusSession.js';
import { requireAuth, setAuthCookie } from './middleware/auth.js';
import { validate } from './middleware/validate.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
app.use((req, res, next) => { req.id = randomUUID(); res.setHeader('X-Request-Id', req.id); next(); });
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true });
const id = z.string().regex(/^[a-f\d]{24}$/i);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const authSchema = z.object({ displayName: z.string().trim().min(2).max(80).optional(), email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(8).max(100) });
const subjectSchema = z.object({ name: z.string().trim().min(1).max(60), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), weeklyGoalMinutes: z.number().int().min(0).max(10080).optional() });
const taskSchema = z.object({ subjectId: id.nullable().optional(), title: z.string().trim().min(1).max(160), type: z.enum(['study', 'assignment', 'reading', 'revision', 'practice']).default('study'), scheduledDate: date, scheduledTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).optional(), estimateMinutes: z.number().int().min(1).max(1440), status: z.enum(['pending', 'completed']).optional() });
const focusSchema = z.object({ subjectId: id.nullable().optional(), startedAt: z.coerce.date(), endedAt: z.coerce.date(), durationMinutes: z.number().int().min(1).max(1440) });
const send = (res, data, status = 200) => res.status(status).json({ data });
const ownedSubject = (userId, subjectId) => subjectId ? Subject.findOne({ _id: subjectId, userId }) : null;
async function ensureSubject(userId, subjectId) { if (subjectId && !(await ownedSubject(userId, subjectId))) { const error = new Error('Subject not found'); error.status = 404; throw error; } }

app.get('/api/health', (req, res) => send(res, { status: 'ok' }));
app.post('/api/auth/register', authLimiter, validate(authSchema), async (req, res, next) => {
  try {
    if (!req.body.displayName) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Display name is required' } });
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ displayName: req.body.displayName, email: req.body.email, passwordHash, timezone: 'UTC' });
    setAuthCookie(res, user); send(res, { user: { id: user.id, displayName: user.displayName, email: user.email, timezone: user.timezone } }, 201);
  } catch (error) { next(error); }
});
app.post('/api/auth/login', authLimiter, validate(authSchema.omit({ displayName: true })), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } });
    setAuthCookie(res, user); send(res, { user: { id: user.id, displayName: user.displayName, email: user.email, timezone: user.timezone } });
  } catch (error) { next(error); }
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie('daymark_token'); send(res, { loggedOut: true }); });
app.get('/api/auth/me', requireAuth, (req, res) => send(res, { user: { id: req.user.id, displayName: req.user.displayName, email: req.user.email, timezone: req.user.timezone } }));

app.use('/api/subjects', requireAuth);
app.get('/api/subjects', async (req, res, next) => { try { send(res, await Subject.find({ userId: req.user._id }).sort({ name: 1 })); } catch (e) { next(e); } });
app.post('/api/subjects', validate(subjectSchema), async (req, res, next) => { try { send(res, await Subject.create({ ...req.body, userId: req.user._id }), 201); } catch (e) { next(e); } });
app.patch('/api/subjects/:id', validate(id, 'params'), validate(subjectSchema.partial()), async (req, res, next) => { try { const subject = await Subject.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true }); if (!subject) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found' } }); send(res, subject); } catch (e) { next(e); } });
app.delete('/api/subjects/:id', validate(id, 'params'), async (req, res, next) => { try { const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); if (!subject) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found' } }); await Task.updateMany({ userId: req.user._id, subjectId: subject._id }, { $set: { subjectId: null } }); await FocusSession.updateMany({ userId: req.user._id, subjectId: subject._id }, { $set: { subjectId: null } }); send(res, { deleted: true }); } catch (e) { next(e); } });

app.use('/api/tasks', requireAuth);
app.get('/api/tasks', async (req, res, next) => { try { const query = { userId: req.user._id }; if (req.query.from || req.query.to) query.scheduledDate = { ...(req.query.from && { $gte: req.query.from }), ...(req.query.to && { $lte: req.query.to }) }; if (req.query.subjectId) query.subjectId = req.query.subjectId; if (req.query.status) query.status = req.query.status; send(res, await Task.find(query).populate('subjectId', 'name color').sort({ scheduledDate: 1, scheduledTime: 1, createdAt: 1 })); } catch (e) { next(e); } });
app.post('/api/tasks', validate(taskSchema), async (req, res, next) => { try { await ensureSubject(req.user._id, req.body.subjectId); const payload = { ...req.body, userId: req.user._id, completedAt: req.body.status === 'completed' ? new Date() : null }; send(res, await Task.create(payload), 201); } catch (e) { next(e); } });
app.patch('/api/tasks/:id', validate(id, 'params'), validate(taskSchema.partial()), async (req, res, next) => { try { await ensureSubject(req.user._id, req.body.subjectId); const patch = { ...req.body }; if (patch.status) patch.completedAt = patch.status === 'completed' ? new Date() : null; const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, patch, { new: true, runValidators: true }).populate('subjectId', 'name color'); if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }); send(res, task); } catch (e) { next(e); } });
app.delete('/api/tasks/:id', validate(id, 'params'), async (req, res, next) => { try { const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }); send(res, { deleted: true }); } catch (e) { next(e); } });

app.use('/api/focus-sessions', requireAuth);
app.post('/api/focus-sessions', validate(focusSchema), async (req, res, next) => { try { await ensureSubject(req.user._id, req.body.subjectId); send(res, await FocusSession.create({ ...req.body, userId: req.user._id, completed: true }), 201); } catch (e) { next(e); } });
app.get('/api/analytics/weekly', requireAuth, async (req, res, next) => { try { const parsedWeekStart = date.safeParse(req.query.weekStart); const weekStart = parsedWeekStart.success ? parsedWeekStart.data : new Date().toISOString().slice(0, 10); const start = new Date(`${weekStart}T00:00:00.000Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 7); const [sessions, tasks] = await Promise.all([FocusSession.find({ userId: req.user._id, completed: true, startedAt: { $gte: start, $lt: end } }), Task.find({ userId: req.user._id, scheduledDate: { $gte: weekStart, $lt: new Date(end).toISOString().slice(0, 10) } })]); const days = Array.from({ length: 7 }, (_, index) => { const day = new Date(start); day.setUTCDate(day.getUTCDate() + index); const key = day.toISOString().slice(0, 10); return { date: key, focusMinutes: sessions.filter(s => s.startedAt.toISOString().slice(0, 10) === key).reduce((total, s) => total + s.durationMinutes, 0), completedTasks: tasks.filter(t => t.scheduledDate === key && t.status === 'completed').length, totalTasks: tasks.filter(t => t.scheduledDate === key).length }; }); send(res, { days, focusMinutes: days.reduce((n, d) => n + d.focusMinutes, 0), completedTasks: days.reduce((n, d) => n + d.completedTasks, 0) }); } catch (e) { next(e); } });

app.use(notFound);
app.use(errorHandler);
export default app;
