import express from 'express';
import dayjs from 'dayjs';
import db from '../db/database.js';
import { lookupBarcode } from '../services/barcodeService.js';

const router = express.Router();

const toStatus = (expiryDate) => {
  if (dayjs(expiryDate).isBefore(dayjs(), 'day')) return 'expired';
  return 'active';
};

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM inventory_items WHERE user_id = ? ORDER BY expiry_date ASC').all(req.user.id);
  return res.json(items);
});

router.post('/', async (req, res) => {
  let { name, category, expiry_date, barcode } = req.body;
  if (barcode && !name) {
    const product = await lookupBarcode(barcode);
    name = product.name;
    category = category || product.category;
  }

  const status = toStatus(expiry_date);
  const result = db
    .prepare(`INSERT INTO inventory_items (user_id, name, category, expiry_date, barcode, status)
      VALUES (?, ?, ?, ?, ?, ?)`)
    .run(req.user.id, name, category, expiry_date, barcode || null, status);

  return res.json({ id: result.lastInsertRowid, name, category, expiry_date, barcode, status });
});

router.put('/:id', (req, res) => {
  const { name, category, expiry_date, status = toStatus(req.body.expiry_date) } = req.body;
  db.prepare(`UPDATE inventory_items SET name=?, category=?, expiry_date=?, status=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=? AND user_id=?`).run(name, category, expiry_date, status, req.params.id, req.user.id);
  return res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM inventory_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return res.json({ message: 'Deleted' });
});

router.post('/:id/finish', (req, res) => {
  const item = db.prepare('SELECT * FROM inventory_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ message: 'Not found' });

  db.prepare('UPDATE inventory_items SET status = ? WHERE id = ?').run('finished', req.params.id);
  db.prepare(`INSERT INTO shopping_list (user_id, item_name, category, source_item_id, reason)
    VALUES (?, ?, ?, ?, ?)`)
    .run(req.user.id, item.name, item.category, item.id, 'finished');

  return res.json({ message: 'Moved to shopping list' });
});

router.get('/barcode/:code', async (req, res) => {
  const product = await lookupBarcode(req.params.code);
  return res.json(product);
});

export default router;
