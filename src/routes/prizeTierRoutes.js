import express from 'express';
import {
    getAllPrizeTiers,
    createPrizeTier,
    updatePrizeTier,
    deletePrizeTier
} from '../controllers/prizeTierController.js';

const router = express.Router();

router.get('/', getAllPrizeTiers);
router.post('/', createPrizeTier);
router.put('/:id', updatePrizeTier);
router.delete('/:id', deletePrizeTier);

export default router;
