import express from 'express';
import {
    getAllPrizeTiers,
    createOrUpdatePrizeTier,
    updatePrizeTier,
    deletePrizeTier
} from '../controllers/prizeTierController.js';

const router = express.Router();

router.get('/', getAllPrizeTiers);
router.post('/', createOrUpdatePrizeTier);
router.put('/:id', updatePrizeTier);
router.delete('/:id', deletePrizeTier);

export default router;
