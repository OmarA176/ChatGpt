import dayjs from 'dayjs';
import db from '../db/database.js';

export const processNotifications = () => {
  const dueItems = db.prepare(`
    SELECT id, user_id, name, expiry_date
    FROM inventory_items
    WHERE status='active' AND date(expiry_date) = date('now', '+3 day')
  `).all();

  const insert = db.prepare(`
    INSERT OR IGNORE INTO notifications (user_id, inventory_item_id, channel, message)
    VALUES (@user_id, @inventory_item_id, @channel, @message)
  `);

  dueItems.forEach((item) => {
    const msg = `${item.name} expires on ${dayjs(item.expiry_date).format('YYYY-MM-DD')}`;
    insert.run({ user_id: item.user_id, inventory_item_id: item.id, channel: 'browser', message: msg });
    insert.run({ user_id: item.user_id, inventory_item_id: item.id, channel: 'email', message: msg });
  });

  return dueItems.length;
};
