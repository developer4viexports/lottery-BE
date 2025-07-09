import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize'; // ✅ Import Op for date comparisons

import routes from './routes/index.js';
import winningTickets from './routes/winningTickets.js';
import adminRoutes from './routes/adminRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import winningComboRoutes from './routes/winningComboRoutes.js';

import { sequelize, WinningCombination } from './models/index.js'; // ✅ Include model

import './models/Admin.js';
import './models/Ticket.js';
import './models/Claim.js';
import './models/WinningTicket.js';

dotenv.config();
const app = express();

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);
app.use('/api/winners', winningTickets);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', ticketRoutes);
app.use('/api/winning-combo', winningComboRoutes);

// File preview route
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Accept-Ranges', 'bytes');

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// Sequelize connection
sequelize.authenticate()
  .then(async () => {
    console.log('✅ PostgreSQL connected');
    await sequelize.sync({ alter: true });

    // ✅ Auto-end expired competitions
    await WinningCombination.update(
      { status: 'ended' },
      {
        where: {
          status: 'active',
          endDate: {
            [Op.lt]: new Date()
          }
        }
      }
    );
    console.log('🔁 Expired competitions marked as ended.');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  });

// Error handler
app.use(errorHandler);

export default app;
