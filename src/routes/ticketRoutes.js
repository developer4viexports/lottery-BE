import express from 'express';
import { createTicket, getAllTickets } from '../controllers/ticketController.js';
import { submitClaim, getClaims } from '../controllers/claimController.js';
import upload from '../middleware/upload.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

/* ─────────────── PUBLIC ROUTES ─────────────── */

// User submits ticket with image
router.post('/tickets', upload.single('file'), createTicket);

// User submits claim form
router.post('/claims', submitClaim);

/* ─────────────── ADMIN ROUTES (Protected) ─────────────── */

// Admin fetches all tickets
router.get('/tickets', adminAuth, getAllTickets);

// Admin fetches all claims
router.get('/claims', adminAuth, getClaims);

export default router;
