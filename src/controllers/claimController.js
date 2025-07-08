import { Claim } from '../models/index.js';

export const submitClaim = async (req, res, next) => {
    try {
        const body = req.body || {}; // Prevent undefined destructuring

        const {
            ticketID,
            name,
            email,
            phone,
            instagram,
            countryCode
        } = body;

        const ticketImage = req.files?.ticketImage?.[0]?.filename
            ? `/uploads/${req.files.ticketImage[0].filename}`
            : '';

        const proofImage = req.files?.proofImage?.[0]?.filename
            ? `/uploads/${req.files.proofImage[0].filename}`
            : '';

        const newClaim = await Claim.create({
            ticketID,
            name,
            email,
            phone,
            instagram,
            countryCode,
            ticketImage,
            proofImage,
        });

        res.status(201).json({ success: true, message: 'Claim submitted successfully!' });
    } catch (err) {
        console.error('Submit claim error:', err);
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
