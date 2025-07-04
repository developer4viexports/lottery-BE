import { Claim } from '../models/index.js';

export const submitClaim = async (req, res, next) => {
    try {
        const newClaim = await Claim.create(req.body);
        res.status(201).json({ message: 'Claim submitted successfully!' });
    } catch (err) {
        next(err);
    }
};

export const getClaims = async (req, res, next) => {
    try {
        const claims = await Claim.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json({ success: true, data: claims });
    } catch (err) {
        console.error('Error fetching claims:', err);
        next(err);
    }
};
