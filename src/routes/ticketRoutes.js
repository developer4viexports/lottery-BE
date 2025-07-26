import express from 'express';
import { createTicket, getAllTickets, uploadTicketImage, sendTicketEmail } from '../controllers/ticketController.js';
import { submitActivate, getActivates } from '../controllers/activateController.js';
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

// ✅ User submits Activate form with files 
router.post('/activate', upload.fields([
    { name: 'ticketImage', maxCount: 1 },
    { name: 'proofImage', maxCount: 1 }
]), submitActivate);

// // User submits Activate form
// router.post('/activate', submitActivate);

/* ─────────────── ADMIN ROUTES (Protected) ─────────────── */

// Admin fetches all tickets
router.get('/tickets', adminAuth, getAllTickets);

// Admin fetches all Activate
router.get('/activate', adminAuth, getActivates);

router.post('/upload-ticket-image', upload.single('image'), uploadTicketImage);

router.post('/send-email/:id', sendTicketEmail);

export default router;
