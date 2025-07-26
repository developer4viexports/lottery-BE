import express from 'express';
import { submitClaim, getAllClaims } from '../controllers/claimController.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/claim', upload.none(), submitClaim); // public
router.get('/claims', adminAuth, getAllClaims); // admin only

export default router;
