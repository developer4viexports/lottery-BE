// routes/winningTickets.js
import express from 'express';
import { getWinners, addWinner, updateWinner, deleteWinner } from '../controllers/winningTicketsController.js';

const router = express.Router();

router.get('/', getWinners);
router.post('/', addWinner);
router.put('/:id', updateWinner);
router.delete('/:id', deleteWinner);

export default router;
