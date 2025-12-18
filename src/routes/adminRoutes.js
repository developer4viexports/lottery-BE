// routes/adminRoutes.js
import express from 'express';
import {
    loginAdmin,
    verifyComboPassword,
    updateComboPassword,
    checkComboPasswordExists
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public route
router.post('/login', loginAdmin);

// Protected routes - requires JWT auth
router.post('/verify-combo-password', adminAuth, verifyComboPassword);
router.post('/update-combo-password', adminAuth, updateComboPassword);
router.get('/combo-password-exists', adminAuth, checkComboPasswordExists);

export default router;
