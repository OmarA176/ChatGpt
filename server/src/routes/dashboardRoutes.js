import express from 'express';
import dayjs from 'dayjs';
import db from '../db/database.js';
import { generateRecipes } from '../services/recipeService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM inventory_items WHERE user_id = ? AND status != ?').all(req.user.id, 'finished');
  const now = dayjs();

  const urgent = [];
  const soon = [];
  const safe = [];

  items.forEach((item) => {
    const diff = dayjs(item.expiry_date).diff(now, 'hour');
    if (diff <= 48) urgent.push(item);
    else if (diff <= 24 * 7) soon.push(item);
    else safe.push(item);

    if (diff < 0 && item.status !== 'expired') {
      db.prepare('UPDATE inventory_items SET status = ? WHERE id = ?').run('expired', item.id);
      db.prepare(`INSERT INTO shopping_list (user_id, item_name, category, source_item_id, reason)
        VALUES (?, ?, ?, ?, ?)`)
        .run(req.user.id, item.name, item.category, item.id, 'expired');
    }
  });

  const chart = [
    { name: 'Urgent', value: urgent.length, fill: '#dc2626' },
    { name: 'Expiring Soon', value: soon.length, fill: '#f59e0b' },
    { name: 'Safe', value: safe.length, fill: '#16a34a' }
  ];

  return res.json({ urgent, soon, safe, chart, recipes: generateRecipes([...urgent, ...soon]) });
});

export default router;
