import { Claim, Ticket, WinningCombination } from '../models/index.js';
import { Op } from 'sequelize';

// ========================
// Submit Claim
// ========================
export const submitClaim = async (req, res) => {
    try {
        const {
            ticketID,
            name,
            email,
            phone,
            instagram,
            countryCode
        } = req.body || {};

        if (!ticketID || !name || !email || !phone || !instagram) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const ticketImage = req.files?.ticketImage?.[0]?.filename
            ? `/uploads/${req.files.ticketImage[0].filename}` : '';

        const proofImage = req.files?.proofImage?.[0]?.filename
            ? `/uploads/${req.files.proofImage[0].filename}` : '';

        // Determine winningCombinationId
        let winningCombinationId = null;
        const ticket = await Ticket.findOne({ where: { ticketID } });

        if (ticket?.winningCombinationId) {
            winningCombinationId = ticket.winningCombinationId;
        } else {
            const activeOrLatestEnded = await WinningCombination.findOne({
                where: { status: 'active' },
                order: [['createdAt', 'DESC']]
            }) || await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']]
            });

            if (activeOrLatestEnded) {
                winningCombinationId = activeOrLatestEnded.id;
            }
        }

        if (!winningCombinationId) {
            return res.status(400).json({ success: false, message: 'Competition not found' });
        }

        // Check for duplicate claim with same phone/email/instagram in this competition
        const orConditions = [];
        if (phone) orConditions.push({ phone });
        if (email) orConditions.push({ email });
        if (instagram) orConditions.push({ instagram });

        if (orConditions.length > 0) {
            const duplicate = await Claim.findOne({
                where: {
                    winningCombinationId,
                    [Op.or]: orConditions
                }
            });

            if (duplicate) {
                let field = '';
                if (duplicate.phone === phone) field = 'phone';
                else if (duplicate.email === email) field = 'email';
                else if (duplicate.instagram === instagram) field = 'instagram';

                return res.status(409).json({
                    success: false,
                    message: `Duplicate ${field} already used in this competition.`,
                    field
                });
            }
        }

        // Create claim
        const newClaim = await Claim.create({
            ticketID,
            name,
            email,
            phone,
            instagram,
            countryCode,
            ticketImage,
            proofImage,
            winningCombinationId
        });

        return res.status(201).json({
            success: true,
            message: 'Claim submitted successfully!',
            data: newClaim
        });

    } catch (err) {
        console.error('❌ Submit claim error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================
// Get All Claims for Current Competition
// ========================
export const getClaims = async (req, res) => {
    try {
        let competition = await WinningCombination.findOne({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        if (!competition) {
            competition = await WinningCombination.findOne({
                where: { status: 'ended' },
                order: [['createdAt', 'DESC']]
            });
        }

        if (!competition) {
            return res.status(404).json({ success: false, message: 'No competition found' });
        }

        const claims = await Claim.findAll({
            where: { winningCombinationId: competition.id },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: claims
        });

    } catch (err) {
        console.error('❌ Error fetching claims:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ Export both functions for use in routes
// export { submitClaim, getClaims };
