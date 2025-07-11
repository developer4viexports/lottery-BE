// src/routes/generatedTicketRoutes.js

import express from 'express';
import { getAllGeneratedTickets, deleteAllGeneratedTickets } from '../controllers/generatedTicketController.js';

const router = express.Router();

// Route to get all generated tickets
router.get('/demoTickets', getAllGeneratedTickets);

// Route to delete all tickets
router.delete('/generated-tickets', deleteAllGeneratedTickets);

export default router;
