// src/routes/winningComboRoutes.js
import express from 'express';
import {
    createOrUpdateWinningCombination,
    deleteWinningCombination,
    getLatestWinningCombination,
    getWinnersByPrizeType,
    endCurrentCompetitionManually,
    getAllCompetitions,
    getCompetitionById // NEW: added controller
} from '../controllers/winningComboController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Create or update winning combination
router.post('/', createOrUpdateWinningCombination);

// Manually end current competition
router.patch('/end', endCurrentCompetitionManually); // ✅ New endpoint to end competition

// Delete winning combination
router.delete('/', deleteWinningCombination);

// Get latest winning combination
router.get('/latest',adminAuth, getLatestWinningCombination);

// Get all winners grouped by prize type
router.get('/winners', adminAuth, getWinnersByPrizeType);

// Get all competitions (for admin dashboard table)
router.get('/all', adminAuth, getAllCompetitions); // ✅ NEW ROUTE

// Get competition by ID (for details view)

router.get('/:id',adminAuth, getCompetitionById); // ✅ New route


export default router;
