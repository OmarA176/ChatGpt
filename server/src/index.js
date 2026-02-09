import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cron from 'node-cron';
import { initDb } from './db/database.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import shoppingRoutes from './routes/shoppingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { processNotifications } from './services/notificationService.js';

const app = express();
const PORT = process.env.PORT || 4000;

initDb();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/shopping-list', authMiddleware, shoppingRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

cron.schedule('0 * * * *', () => {
  processNotifications();
});

app.listen(PORT, () => {
  console.log(`Expiry Radar API running on ${PORT}`);
});
