import express from 'express';
import ticketRoutes from './ticketRoutes.js';

const router = express.Router();

router.use('/tickets', ticketRoutes);

export default router;
