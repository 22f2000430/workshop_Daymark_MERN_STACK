import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export function signUser(user) { return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, { expiresIn: '7d' }); }
export function setAuthCookie(res, user) { res.cookie('daymark_token', signUser(user), { httpOnly: true, sameSite: 'lax', secure: env.production, maxAge: 7 * 24 * 60 * 60 * 1000 }); }
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.daymark_token;
    if (!token) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in' } });
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in' } });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in' } }); }
}
