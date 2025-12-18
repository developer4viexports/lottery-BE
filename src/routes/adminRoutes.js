// routes/adminRoutes.js
import express from 'express';
import { loginAdmin, verifyComboPassword } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public route
router.post('/login', loginAdmin);

// Protected route - requires JWT auth first, then combo password
router.post('/verify-combo-password', adminAuth, verifyComboPassword);

export default router;
