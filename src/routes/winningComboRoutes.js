// src/routes/winningComboRoutes.js
import express from 'express';
import {
    createOrUpdateWinningCombination,  // Updated this line
    deleteWinningCombination,
    getLatestWinningCombination,
    getWinnersByPrizeType
} from '../controllers/winningComboController.js';

const router = express.Router();

// Create or update winning combination
router.post('/', createOrUpdateWinningCombination);  // Updated this line

// Delete winning combination
router.delete('/', deleteWinningCombination);

// Get latest winning combination
router.get('/latest', getLatestWinningCombination);

// Get all winners grouped by prize type
router.get('/winners', getWinnersByPrizeType);

export default router;