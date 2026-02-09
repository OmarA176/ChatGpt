import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, language = 'en' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash, language) VALUES (?, ?, ?, ?)')
      .run(name, email, passwordHash, language);
    const user = { id: result.lastInsertRowid, name, email, language };
    return res.json({ token: generateToken(user), user });
  } catch {
    return res.status(409).json({ message: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  return res.json({
    token: generateToken(user),
    user: { id: user.id, name: user.name, email: user.email, language: user.language }
  });
});

export default router;
