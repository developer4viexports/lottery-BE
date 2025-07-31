import express from 'express';
import {
    collectUrl,
    getCollectedUrl,
    updateCollectedUrl,
} from '../controllers/urlController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/', adminAuth, collectUrl);
router.get('/',  getCollectedUrl);
router.put('/', adminAuth, updateCollectedUrl);

export default router;
