import express from 'express';
import { createTicket, getAllTickets } from '../controllers/ticketController.js';
import { submitClaim, getClaims } from '../controllers/claimController.js';
import upload from '../middleware/upload.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

/* ─────────────── PUBLIC ROUTES ─────────────── */

// User submits ticket with image
router.post('/tickets', upload.fields([
    { name: 'file', maxCount: 1 },         // This 'file' matches the 'name' attribute of the main file input in LandingForm.jsx
    { name: 'purchaseProof', maxCount: 1 }, // This 'purchaseProof' matches the 'name' attribute of the purchaseProof file input in LandingForm.jsx
    { name: 'followProof', maxCount: 1 } // ✅ NEW 
]),
    createTicket
);

// ✅ User submits claim form with files
router.post('/claims', upload.fields([
    { name: 'ticketImage', maxCount: 1 },
    { name: 'proofImage', maxCount: 1 }
]), submitClaim);

// // User submits claim form
// router.post('/claims', submitClaim);

/* ─────────────── ADMIN ROUTES (Protected) ─────────────── */

// Admin fetches all tickets
router.get('/tickets', adminAuth, getAllTickets);

// Admin fetches all claims
router.get('/claims', adminAuth, getClaims);

export default router;
