import express from 'express';
import db from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM shopping_list WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return res.json(rows);
});

router.patch('/:id', (req, res) => {
  db.prepare('UPDATE shopping_list SET done = ? WHERE id = ? AND user_id = ?').run(req.body.done ? 1 : 0, req.params.id, req.user.id);
  return res.json({ message: 'Updated' });
});

export default router;
