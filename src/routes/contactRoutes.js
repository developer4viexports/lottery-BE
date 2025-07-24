import express from 'express';
import { submitContactMessage, getAllContactMessages } from '../controllers/contactController.js';
import upload from '../middleware/upload.js'; // Import the upload middleware

const router = express.Router();

// POST /api/contact - with optional file
router.post('/', upload.single('file'), submitContactMessage);

// GET /api/contact - get all messages
router.get('/', getAllContactMessages);

export default router;
